const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

class AuthService {
  constructor(client) {
    this.NhanVien = client.db().collection("nhanvien");
  }

  extractNhanVienData(payload) {
    const nv = {
      MSNV: payload.MSNV,
      HoTenNV: payload.HoTenNV,
      Password: payload.Password,
      Chucvu: payload.Chucvu,
      Diachi: payload.Diachi,
      SoDienThoai: payload.SoDienThoai,
    };

    Object.keys(nv).forEach((key) => nv[key] === undefined && delete nv[key]);
    return nv;
  }

  async register(payload) {
    const data = this.extractNhanVienData(payload);

    const exist = await this.NhanVien.findOne({ MSNV: data.MSNV });
    if (exist) {
      throw new Error("MSNV already exists");
    }

    const salt = await bcrypt.genSalt(10);
    data.Password = await bcrypt.hash(data.Password, salt);

    const result = await this.NhanVien.insertOne(data);
    return { message: "Register success", id: result.insertedId };
  }

  async login(payload) {
    const { MSNV, Password } = payload;

    const nv = await this.NhanVien.findOne({ MSNV });
    if (!nv) throw new Error("Employee not found");

    const valid = await bcrypt.compare(Password, nv.Password);
    if (!valid) throw new Error("Password incorrect");

    const token = jwt.sign(
      {
        MSNV: nv.MSNV,
        Chucvu: nv.Chucvu,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" }
    );

    return {
      message: "Login success",
      token,
      user: {
        MSNV: nv.MSNV,
        HoTenNV: nv.HoTenNV,
        Chucvu: nv.Chucvu,
      },
    };
  }
}

module.exports = AuthService;
