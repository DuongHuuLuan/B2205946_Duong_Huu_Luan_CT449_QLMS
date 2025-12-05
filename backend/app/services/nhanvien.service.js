const { ObjectId } = require("mongodb");
const ALLOWED_ROLES = ["Admin", "QuanLy", "ThuThu", "HoTro"];
class NhanVienService {
  constructor(client) {
    this.NhanVien = client.db().collection("nhanvien");
  }

  async create(payload) {
    if (!ALLOWED_ROLES.includes(payload.ChucVu)) {
      throw new Error("Chức vụ không hợp lệ");
    }
    const nv = {
      Avatar: payload.Avatar,
      MSNV: payload.MSNV,
      HoTenNV: payload.HoTenNV,
      Password: payload.Password,
      ChucVu: payload.ChucVu,
      DiaChi: payload.DiaChi,
      SoDienThoai: payload.SoDienThoai,
    };
    return await this.NhanVien.insertOne(nv);
  }

  async find(filter = {}) {
    const cursor = await this.NhanVien.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.NhanVien.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByMSNV(msnv) {
    return await this.NhanVien.findOne({ MSNV: msnv });
  }

  async update(id, payload) {
    const update = {
      $set: {
        Avatar: payload.Avatar,
        MSNV: payload.MSNV,
        HoTenNV: payload.HoTenNV,
        ChucVu: payload.ChucVu,
        DiaChi: payload.DiaChi,
        SoDienThoai: payload.SoDienThoai,
      },
    };

    if (payload.Password) {
      update.$set.Password = payload.Password;
    }

    return await this.NhanVien.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      update,
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    return await this.NhanVien.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async deleteAll() {
    const result = await this.NhanVien.deleteMany({});
    return result.deletedCount;
  }

  /**
   * @description
   * @param {Object} filter
   */
  async count(filter = {}) {
    return await this.NhanVien.countDocuments(filter);
  } /**
   * @description
   * @param {Array} pipeline
   */

  async aggregate(pipeline) {
    const cursor = await this.NhanVien.aggregate(pipeline);
    return await cursor.toArray();
  }
}

module.exports = NhanVienService;
