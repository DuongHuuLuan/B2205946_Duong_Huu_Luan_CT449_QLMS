const { ObjectId } = require("mongodb");

class SachService {
  constructor(client) {
    this.Sach = client.db().collection("sach");
  }

  extractSachData(payload) {
    const sach = {
      MaSach: payload.MaSach,
      TenSach: payload.TenSach,
      BiaSach: payload.BiaSach,
      DonGia: payload.DonGia ? Number(payload.DonGia) : undefined,
      SoQuyen: payload.SoQuyen ? Number(payload.SoQuyen) : undefined, // ÉP SỐ
      NamXuatBan: payload.NamXuatBan ? Number(payload.NamXuatBan) : undefined,
      MaNXB: payload.MaNXB,
      TacGia: payload.TacGia,
    };

    Object.keys(sach).forEach(
      (key) => sach[key] === undefined && delete sach[key]
    );
    return sach;
  }

  async create(payload) {
    const sach = this.extractSachData(payload);
    const result = await this.Sach.insertOne(sach);
    return result;
  }

  async find(filter) {
    const cursor = await this.Sach.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.Sach.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
    const update = this.extractSachData(payload);

    const result = await this.Sach.updateOne(filter, { $set: update });
    if (result.matchedCount === 0) {
      return null;
    }

    return await this.Sach.findOne(filter);
  }

  async delete(id) {
    const result = await this.Sach.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.Sach.deleteMany({});
    return result.deletedCount;
  }

  /**
   * @description
   * @param {Object} filter
   */
  async count(filter = {}) {
    return await this.Sach.countDocuments(filter);
  } /**
   * @description
   * @param {Array} pipeline
   */

  async aggregate(pipeline) {
    const cursor = await this.Sach.aggregate(pipeline);
    return await cursor.toArray();
  }
}

module.exports = SachService;
