const { ObjectId } = require("mongodb");

const MS_PER_DAY = 1000 * 60 * 60 * 24;
function overdueDays(hanTra, now = new Date()) {
  if (!hanTra) return 0;
  const dHan = new Date(hanTra);
  const dNow = new Date(now);
  const utcHan = Date.UTC(
    dHan.getUTCFullYear(),
    dHan.getUTCMonth(),
    dHan.getUTCDate()
  );
  const utcNow = Date.UTC(
    dNow.getUTCFullYear(),
    dNow.getUTCMonth(),
    dNow.getUTCDate()
  );
  const diffDays = Math.floor((utcNow - utcHan) / MS_PER_DAY);
  return diffDays > 0 ? diffDays : 0;
}

class TheoDoiMuonSachService {
  constructor(client) {
    this.TDMS = client.db().collection("theodoimuonsach");
    this.DocGia = client.db().collection("docgia");
    this.Sach = client.db().collection("sach");
  }

  async create(payload) {
    const { MaDocGia, ChiTietMuon, NgayMuon, HanTra, TongTien } = payload;

    const docGia = await this.DocGia.findOne({ MaDocGia });
    if (!docGia) throw new Error("Mã độc giả không tồn tại");

    if (!Array.isArray(ChiTietMuon) || ChiTietMuon.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một sách");
    }

    let tongTienTinh = 0;
    let tongSoCuon = 0;
    const chiTietChuan = [];

    for (const item of ChiTietMuon) {
      const maSach = item.MaSach?.trim();
      const soLuong = Number(item.SoLuong) || 1;

      if (!maSach || soLuong < 1) throw new Error("Dữ liệu sách không hợp lệ");

      const sach = await this.Sach.findOne({ MaSach: maSach });
      if (!sach) throw new Error(`Không tìm thấy sách mã ${maSach}`);
      if ((sach.SoQuyen || 0) < soLuong) {
        throw new Error(
          `Sách "${sach.TenSach}" chỉ còn ${sach.SoQuyen || 0} cuốn`
        );
      }

      const giaTien = Number(sach.DonGia) || 0;
      tongTienTinh += giaTien * soLuong;
      tongSoCuon += soLuong;

      chiTietChuan.push({
        MaSach: maSach,
        SoLuong: soLuong,
        GiaTien: giaTien,
        TrangThai: "Chưa trả",
      });
    }

    const dangMuon = await this.TDMS.find({
      MaDocGia,
      TrangThai: { $in: ["Chờ duyệt", "Đang mượn", "Trễ hạn"] },
    }).toArray();

    let soCuonHienTai = 0;
    for (const rec of dangMuon) {
      for (const ct of rec.ChiTietMuon || []) {
        if (ct.TrangThai !== "Đã trả") soCuonHienTai += ct.SoLuong || 1;
      }
    }

    if (soCuonHienTai + tongSoCuon > 3) {
      throw new Error(
        `Chỉ được mượn tối đa 3 cuốn. Hiện đang mượn ${soCuonHienTai} cuốn`
      );
    }

    if (dangMuon.some((r) => r.TrangThai === "Trễ hạn")) {
      throw new Error("Bạn đang có sách trễ hạn, không thể mượn thêm");
    }

    const doc = {
      MaDocGia,
      ChiTietMuon: chiTietChuan,
      TongTien: TongTien != null ? TongTien : tongTienTinh,
      TienPhat: 0,
      TongThanhToan: TongTien != null ? TongTien : tongTienTinh,
      NgayMuon: NgayMuon ? new Date(NgayMuon) : new Date(),
      HanTra: HanTra
        ? new Date(HanTra)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      NgayTra: null,
      TrangThai: "Chờ duyệt",
      NhanVienDuyet: null,
      NhanVienTra: null,
    };

    const result = await this.TDMS.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  async find(filter = {}) {
    const cursor = await this.TDMS.find(filter);
    let records = await cursor.toArray();
    const today = new Date();

    for (let rec of records) {
      const hanTra = rec.HanTra ? new Date(rec.HanTra) : null;
      const soCuon = (rec.ChiTietMuon || []).reduce(
        (s, ct) => s + (ct.SoLuong || 1),
        0
      );
      const ngayTre = overdueDays(hanTra, today);
      const tienPhat = ngayTre > 0 ? ngayTre * 10000 * soCuon : 0;
      const tongThanhToan = (rec.TongTien || 0) + tienPhat;

      let needUpdate = false;
      const updateFields = {};

      if (
        ngayTre > 0 &&
        rec.TrangThai !== "Trễ hạn" &&
        rec.TrangThai !== "Đã trả"
      ) {
        updateFields.TrangThai = "Trễ hạn";
        needUpdate = true;
      }
      if ((rec.TienPhat || 0) !== tienPhat) {
        updateFields.TienPhat = tienPhat;
        updateFields.TongThanhToan = tongThanhToan;
        needUpdate = true;
      }

      if (needUpdate) {
        await this.TDMS.updateOne({ _id: rec._id }, { $set: updateFields });
        Object.assign(rec, updateFields);
      }

      rec.TienPhat = rec.TienPhat || 0;
      rec.TongThanhToan = rec.TongThanhToan || rec.TongTien || 0;
    }

    return records;
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.TDMS.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;
    const _id = new ObjectId(id);
    const doc = await this.TDMS.findOne({ _id });
    if (!doc) return null;

    let updateData = {};

    if (payload.NgayMuon !== undefined)
      updateData.NgayMuon = new Date(payload.NgayMuon);
    if (payload.HanTra !== undefined)
      updateData.HanTra = new Date(payload.HanTra);
    if (
      payload.TrangThai &&
      !["Đang mượn", "Đã trả"].includes(payload.TrangThai)
    ) {
      updateData.TrangThai = payload.TrangThai;
    }

    if (payload.TrangThai === "Đang mượn" && doc.TrangThai === "Chờ duyệt") {
      for (const item of doc.ChiTietMuon) {
        const soLuong = item.SoLuong || 1;
        await this.Sach.updateOne(
          { MaSach: item.MaSach },
          { $inc: { SoQuyen: -soLuong } }
        );
      }
      updateData = {
        TrangThai: "Đang mượn",
        NgayMuon: payload.NgayMuon ? new Date(payload.NgayMuon) : new Date(),
        HanTra: payload.HanTra
          ? new Date(payload.HanTra)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        NhanVienDuyet: payload.MSNV || null,
      };
    } else if (payload.TrangThai === "Đã trả" && doc.TrangThai !== "Đã trả") {
      const today = new Date();
      const hanTra = doc.HanTra ? new Date(doc.HanTra) : today;
      const ngayTre = overdueDays(hanTra, today);
      const soCuon = (doc.ChiTietMuon || []).reduce(
        (s, ct) => s + (ct.SoLuong || 1),
        0
      );
      const tienPhat = ngayTre * 10000 * soCuon;

      for (const item of doc.ChiTietMuon) {
        await this.Sach.updateOne(
          { MaSach: item.MaSach },
          { $inc: { SoQuyen: +(item.SoLuong || 1) } }
        );
      }

      updateData = {
        TrangThai: "Đã trả",
        NgayTra: payload.NgayTra ? new Date(payload.NgayTra) : today,
        NhanVienTra: payload.MSNV || null,
        TienPhat: tienPhat,
        TongThanhToan: (doc.TongTien || 0) + tienPhat,
        ChiTietMuon: doc.ChiTietMuon.map((ct) => ({
          ...ct,
          TrangThai: "Đã trả",
        })),
      };
    }

    if (Object.keys(updateData).length === 0) return doc;

    await this.TDMS.updateOne({ _id }, { $set: updateData });
    return await this.TDMS.findOne({ _id });
  }

  async aggregate(pipeline = []) {
    if (!Array.isArray(pipeline)) pipeline = [];
    const cursor = await this.TDMS.aggregate(pipeline);
    return await cursor.toArray();
  }

  async count(filter = {}) {
    if (!filter || typeof filter !== "object") filter = {};
    return await this.TDMS.countDocuments(filter);
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.TDMS.findOneAndDelete({ _id: new ObjectId(id) });
  }

  async deleteAll() {
    const result = await this.TDMS.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = TheoDoiMuonSachService;
