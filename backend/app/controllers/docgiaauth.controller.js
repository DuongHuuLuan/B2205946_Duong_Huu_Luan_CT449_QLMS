const ApiError = require("../api-error");
const DocGiaService = require("../services/docgia.service");
const MongoDB = require("../utils/mongodb.util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

exports.register = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);

    const existingUser = await docGiaService.findOne({
      MaDocGia: req.body.MaDocGia,
    });
    if (existingUser) return next(new ApiError(400, "Mã độc giả đã tồn tại"));

    const document = await docGiaService.create(req.body);

    const { Password, ...userWithoutPassword } = req.body;
    res.send({ message: "Đăng ký thành công", user: userWithoutPassword });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi đăng ký"));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { MaDocGia, Password } = req.body;
    const docGiaService = new DocGiaService(MongoDB.client);

    const user = await docGiaService.findOne({ MaDocGia });
    if (!user) return next(new ApiError(404, "Không tìm thấy độc giả"));

    const validPassword = await bcrypt.compare(Password, user.Password);
    if (!validPassword) return next(new ApiError(401, "Sai mật khẩu"));

    const token = jwt.sign(
      { id: user._id, MaDocGia: user.MaDocGia },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { Password: pwd, ...userWithoutPassword } = user;
    res.send({
      message: "Đăng nhập thành công",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi đăng nhập"));
  }
};
