const NhanVienService = require("../services/nhanvien.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

exports.create = async (req, res, next) => {
  if (req.user.ChucVu !== "Admin") {
    return next(new ApiError(403, "Chỉ Admin mới có quyền thêm nhân viên"));
  }

  if (!req.body?.MSNV || !req.body?.HoTenNV || !req.body?.Password) {
    return next(
      new ApiError(400, "MSNV, HoTenNV và Password không được để trống")
    );
  }

  try {
    if (req.file) {
      req.body.Avatar = `/uploads/nhanvien/${req.file.filename}`;
    }

    const nvService = new NhanVienService(MongoDB.client);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.Password, salt);

    const nhanVienData = {
      MSNV: req.body.MSNV,
      Avatar: req.body.Avatar || null,
      HoTenNV: req.body.HoTenNV,
      Password: hashedPassword,
      ChucVu: req.body.ChucVu || "HoTro",
      DiaChi: req.body.DiaChi,
      SoDienThoai: req.body.SoDienThoai,
    };

    const document = await nvService.create(nhanVienData);
    return res.send({
      message: "Thêm nhân viên thành công!",
      data: document,
    });
  } catch (error) {
    if (req.file) {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(__dirname, "..", "..", req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (error.code === 11000) {
      return next(new ApiError(400, "Mã số nhân viên đã tồn tại."));
    }
    return next(new ApiError(500, `Lỗi khi tạo nhân viên: ${error.message}`));
  }
};
exports.findAll = async (req, res, next) => {
  if (req.user.ChucVu !== "Admin") {
    return next(
      new ApiError(403, "Chỉ Admin mới có quyền xem danh sách nhân viên")
    );
  }

  try {
    const nvService = new NhanVienService(MongoDB.client);
    const documents = await nvService.find({});
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách nhân viên"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    if (req.user.ChucVu !== "Admin" && req.user.MSNV !== req.params.id) {
      return next(
        new ApiError(403, "Bạn không có quyền xem thông tin nhân viên khác")
      );
    }

    const nvService = new NhanVienService(MongoDB.client);
    const document = await nvService.findById(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi tìm nhân viên id=${req.params.id}`));
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được trống"));
  }

  try {
    if (req.user.ChucVu !== "Admin" && req.user.MSNV !== req.params.id) {
      return next(
        new ApiError(403, "Bạn không có quyền cập nhật nhân viên khác")
      );
    }

    const nvService = new NhanVienService(MongoDB.client);
    const oldNV = await nvService.findById(req.params.id);
    if (!oldNV) {
      if (req.file) fs.unlinkSync(req.file.path); // xóa file nếu lỗi
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.Avatar = `/uploads/nhanvien/${req.file.filename}`;

      if (oldNV.Avatar && oldNV.Avatar.includes("/uploads/nhanvien/")) {
        const oldPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "nhanvien",
          path.basename(oldNV.Avatar)
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    if (updateData.Password) {
      const salt = await bcrypt.genSalt(10);
      updateData.Password = await bcrypt.hash(updateData.Password, salt);
    }

    const document = await nvService.update(req.params.id, updateData);

    return res.send({
      message: "Cập nhật nhân viên thành công",
      data: document.value || document,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    return next(new ApiError(500, `Lỗi khi cập nhật: ${error.message}`));
  }
};

exports.delete = async (req, res, next) => {
  if (req.user.ChucVu !== "Admin") {
    return next(new ApiError(403, "Chỉ Admin mới có quyền xóa nhân viên"));
  }

  try {
    const nvService = new NhanVienService(MongoDB.client);
    const document = await nvService.delete(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhân viên để xóa"));
    }
    return res.send({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi xóa nhân viên id=${req.params.id}`));
  }
};

exports.deleteAll = async (_req, res, next) => {
  if (_req.user.ChucVu !== "Admin") {
    return next(
      new ApiError(403, "Chỉ Admin mới có quyền xóa tất cả nhân viên")
    );
  }

  try {
    const nvService = new NhanVienService(MongoDB.client);
    const deletedCount = await nvService.deleteAll();

    return res.send({
      message: `${deletedCount} nhân viên đã bị xóa`,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa tất cả nhân viên"));
  }
};
