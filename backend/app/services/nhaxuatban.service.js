const { ObjectId } = require("mongodb");

class NhaXuatBanService {
  constructor(client) {
    this.NXB = client.db().collection("nhaxuatban");
  }

  async create(payload) {
    const doc = {
      MaNXB: payload.MaNXB,
      TenNXB: payload.TenNXB,
      DiaChi: payload.DiaChi,
      DienThoai: payload.DienThoai,
    };
    const result = await this.NXB.insertOne(doc);
    return result;
  }

  async find(filter) {
    const cursor = await this.NXB.find(filter);
    return await cursor.toArray();
  }
  async findById(id) {
    return await this.NXB.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const update = {
      $set: {
        MaNXB: payload.MaNXB,
        TenNXB: payload.TenNXB,
        DiaChi: payload.DiaChi,
        DienThoai: payload.DienThoai,
      },
    };
    const result = await this.NXB.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      update,
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.NXB.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.NXB.deleteMany({});
    return result.deletedCount;
  }

  /**
   * @description
   * @param {Object} filter
   */
  async count(filter = {}) {
    return await this.NXB.countDocuments(filter);
  }
}

module.exports = NhaXuatBanService;
