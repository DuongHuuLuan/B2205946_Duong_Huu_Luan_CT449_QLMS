const TheoDoiMuonSachService = require("../services/theodoimuonsach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const moment = require("moment");
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

exports.create = async (req, res, next) => {
  if (
    !req.body?.MaDocGia ||
    !req.body?.ChiTietMuon ||
    req.body.ChiTietMuon.length === 0
  ) {
    return next(
      new ApiError(400, "Mã Độc Giả và Chi tiết sách mượn không được để trống")
    );
  }

  try {
    const tdmsService = new TheoDoiMuonSachService(MongoDB.client);

    if (!req.body.HanTra && req.body.NgayMuon) {
      req.body.HanTra = moment(req.body.NgayMuon).add(7, "days").toDate();
    }

    const document = await tdmsService.create(req.body);
    return res.send({
      message: "Tạo phiếu mượn thành công",
      document,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error.message || "Lỗi khi tạo phiếu mượn.",
      error: error.message,
    });
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const tdmsService = new TheoDoiMuonSachService(MongoDB.client);
    let documents = await tdmsService.find({});

    documents = documents.map((doc) => ({
      ...doc,
      NgayMuon: doc.NgayMuon ? moment(doc.NgayMuon).format("YYYY-MM-DD") : null,
      HanTra: doc.HanTra ? moment(doc.HanTra).format("YYYY-MM-DD") : null,
      NgayTra: doc.NgayTra ? moment(doc.NgayTra).format("YYYY-MM-DD") : null,
    }));

    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách phiếu mượn"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const tdmsService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await tdmsService.findById(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
    }

    const today = new Date();
    const hanTra = document.HanTra ? new Date(document.HanTra) : null;
    const soCuon = (document.ChiTietMuon || []).reduce(
      (s, ct) => s + (ct.SoLuong || 1),
      0
    );
    const soNgayTre = overdueDays(hanTra, today);
    const tienPhat = soNgayTre > 0 ? soNgayTre * 10000 * soCuon : 0;
    const tongThanhToan = (document.TongTien || 0) + tienPhat;

    let needUpdate = false;
    const updateFields = {};

    if (
      soNgayTre > 0 &&
      document.TrangThai !== "Trễ hạn" &&
      document.TrangThai !== "Đã trả"
    ) {
      updateFields.TrangThai = "Trễ hạn";
      needUpdate = true;
    }
    if ((document.TienPhat || 0) !== tienPhat) {
      updateFields.TienPhat = tienPhat;
      updateFields.TongThanhToan = tongThanhToan;
      needUpdate = true;
    }

    if (needUpdate) {
      await MongoDB.client
        .db()
        .collection("theodoimuonsach")
        .updateOne({ _id: document._id }, { $set: updateFields });
      Object.assign(document, updateFields);
    }

    document.TienPhat = document.TienPhat || 0;
    document.TongThanhToan = document.TongThanhToan || document.TongTien || 0;

    document.NgayMuon = document.NgayMuon
      ? moment(document.NgayMuon).format("YYYY-MM-DD")
      : null;
    document.HanTra = document.HanTra
      ? moment(document.HanTra).format("YYYY-MM-DD")
      : null;
    document.NgayTra = document.NgayTra
      ? moment(document.NgayTra).format("YYYY-MM-DD")
      : null;

    return res.send(document);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, `Lỗi khi tìm phiếu mượn id=${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được trống"));
  }

  try {
    if (
      req.body.NgayMuon &&
      typeof req.body.NgayMuon === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(req.body.NgayMuon)
    ) {
      req.body.NgayMuon = new Date(req.body.NgayMuon + "T00:00:00.000Z");
    }
    if (
      req.body.HanTra &&
      typeof req.body.HanTra === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(req.body.HanTra)
    ) {
      req.body.HanTra = new Date(req.body.HanTra + "T00:00:00.000Z");
    }
    if (
      req.body.NgayTra &&
      typeof req.body.NgayTra === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(req.body.NgayTra)
    ) {
      req.body.NgayTra = new Date(req.body.NgayTra + "T00:00:00.000Z");
    }

    const tdmsService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await tdmsService.update(req.params.id, req.body);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
    }

    const result = {
      ...document,
      NgayMuon: document.NgayMuon
        ? moment(document.NgayMuon).format("YYYY-MM-DD")
        : null,
      HanTra: document.HanTra
        ? moment(document.HanTra).format("YYYY-MM-DD")
        : null,
      NgayTra: document.NgayTra
        ? moment(document.NgayTra).format("YYYY-MM-DD")
        : null,
    };

    return res.send({
      message: "Cập nhật phiếu mượn thành công",
      document: result,
    });
  } catch (error) {
    console.error("Lỗi update:", error);
    return next(new ApiError(500, `Lỗi server: ${error.message}`));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const tdmsService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await tdmsService.delete(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn để xóa"));
    }
    return res.send({
      message: "Xóa phiếu mượn thành công",
      document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        error.message || `Lỗi khi xóa phiếu mượn id=${req.params.id}`
      )
    );
  }
};

exports.deleteAll = async (_req, res, next) => {
  try {
    const tdmsService = new TheoDoiMuonSachService(MongoDB.client);
    const deletedCount = await tdmsService.deleteAll();

    return res.send({
      message: `${deletedCount} phiếu mượn đã bị xóa`,
    });
  } catch (error) {
    return next(
      new ApiError(500, error.message || "Lỗi khi xóa toàn bộ phiếu mượn")
    );
  }
};

exports.findByDocGia = async (req, res, next) => {
  try {
    const MaDocGia = req.user.MaDocGia;
    const db = MongoDB.client.db();
    const collection = db.collection("theodoimuonsach");

    let documents = await collection
      .aggregate([
        { $match: { MaDocGia } },
        {
          $lookup: {
            from: "sach",
            localField: "ChiTietMuon.MaSach",
            foreignField: "MaSach",
            as: "SachThongTin",
          },
        },
        { $sort: { NgayMuon: -1 } },
      ])
      .toArray();

    const FINE_PER_DAY = 10000;
    const today = new Date();

    for (const doc of documents) {
      const hanTra = doc.HanTra ? new Date(doc.HanTra) : null;
      const soCuon = (doc.ChiTietMuon || []).reduce(
        (s, ct) => s + (ct.SoLuong || 1),
        0
      );
      const soNgayTre = overdueDays(hanTra, today);
      const tienPhat = soNgayTre > 0 ? soNgayTre * FINE_PER_DAY * soCuon : 0;
      const tongThanhToan = (doc.TongTien || 0) + tienPhat;

      let needUpdate = false;
      const updateFields = {};

      if (
        soNgayTre > 0 &&
        doc.TrangThai !== "Trễ hạn" &&
        doc.TrangThai !== "Đã trả"
      ) {
        updateFields.TrangThai = "Trễ hạn";
        needUpdate = true;
      }
      if (
        (doc.TienPhat || 0) !== tienPhat ||
        (doc.TongThanhToan || 0) !== tongThanhToan
      ) {
        updateFields.TienPhat = tienPhat;
        updateFields.TongThanhToan = tongThanhToan;
        needUpdate = true;
      }

      if (needUpdate) {
        await collection.updateOne({ _id: doc._id }, { $set: updateFields });
        Object.assign(doc, updateFields);
      }

      doc.TienPhat = doc.TienPhat || 0;
      doc.TongThanhToan = doc.TongThanhToan || doc.TongTien || 0;

      doc.NgayMuon = doc.NgayMuon
        ? moment(doc.NgayMuon).format("YYYY-MM-DD")
        : null;
      doc.HanTra = doc.HanTra ? moment(doc.HanTra).format("YYYY-MM-DD") : null;
      doc.NgayTra = doc.NgayTra
        ? moment(doc.NgayTra).format("YYYY-MM-DD")
        : null;
    }

    return res.send(documents);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách mượn sách của độc giả")
    );
  }
};

exports.createByDocGia = async (req, res, next) => {
  try {
    console.log("CONTROLLEr");
    const MaDocGia = req.user.MaDocGia;
    const { ChiTietMuon, TongTien, NgayMuon, HanTra } = req.body;

    if (!ChiTietMuon || !Array.isArray(ChiTietMuon) || ChiTietMuon.length === 0)
      return next(new ApiError(400, "Danh sách sách mượn không hợp lệ"));

    if (ChiTietMuon.length > 3)
      return next(new ApiError(400, "Chỉ được mượn tối đa 3 sách"));

    const db = MongoDB.client.db();
    const sachCollection = db.collection("sach");
    const muonCollection = db.collection("theodoimuonsach");

    const tienCocTuFrontend = Number(TongTien) || 0;

    if (tienCocTuFrontend <= 0) {
      return next(
        new ApiError(
          400,
          "Tổng tiền cọc phải lớn hơn 0. Vui lòng kiểm tra giá sách."
        )
      );
    }

    for (const item of ChiTietMuon) {
      const sach = await sachCollection.findOne({ MaSach: item.MaSach });
      if (!sach)
        return next(new ApiError(404, `Không tìm thấy sách ${item.MaSach}`));

      const soQuyenCon = sach.SoQuyenCon || sach.SoQuyen || 0;
      if (soQuyenCon <= 0 || item.SoLuong > soQuyenCon)
        return next(
          new ApiError(
            400,
            `Sách ${sach.TenSach} không đủ số lượng (${item.SoLuong} > ${soQuyenCon})`
          )
        );
    }

    const newBorrow = {
      MaDocGia,
      NgayMuon: NgayMuon ? new Date(NgayMuon) : new Date(),
      HanTra: HanTra
        ? new Date(HanTra)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ChiTietMuon,
      TrangThai: "Chờ duyệt",
      TongTien: tienCocTuFrontend,
      NgayTra: null,
    };

    const result = await muonCollection.insertOne(newBorrow);

    res.send({
      message: "Yêu cầu mượn sách đã được gửi đi. Vui lòng chờ duyệt.",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Lỗi Controller createByDocGia:", error);
    return next(
      new ApiError(500, error.message || "Lỗi khi độc giả mượn sách")
    );
  }
};
