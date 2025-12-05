const ApiError = require("../api-error");
const DocGiaService = require("../services/docgia.service");
const MongoDB = require("../utils/mongodb.util");
const { ObjectId } = require("mongodb");

/**
 * @param {Object} req - Request object
 * @param {boolean} withFile - True nếu request có upload file (đã qua Multer)
 */
const createDocGia = async (req, res, next, withFile = false) => {
  if (!req.body?.Ten) return next(new ApiError(400, "Tên không được trống"));
  if (!req.body?.MaDocGia)
    return next(new ApiError(400, "Mã Độc giả không được trống"));

  try {
    const docGiaService = new DocGiaService(MongoDB.client);

    let payload = { ...req.body };

    if (withFile && req.file) {
      payload.Avatar = req.file.path;
    }

    const existingDoc = await docGiaService.findOne({
      MaDocGia: payload.MaDocGia,
    });
    if (existingDoc) {
      return next(new ApiError(400, "Mã Độc giả đã tồn tại."));
    }

    const document = await docGiaService.create(payload);

    if (document.acknowledged && document.insertedId) {
      const newDoc = await docGiaService.findById(document.insertedId);
      const { Password, ...docWithoutPassword } = newDoc;
      res.send(docWithoutPassword);
    } else {
      return next(new ApiError(500, "Không thể tạo Độc giả."));
    }
  } catch (error) {
    console.error("CREATE ERROR:", error);
    return next(new ApiError(500, "Lỗi khi tạo Độc giả mới"));
  }
};

exports.create = async (req, res, next) => {
  return createDocGia(req, res, next, false);
};

exports.createWithAvatar = async (req, res, next) => {
  return createDocGia(req, res, next, true);
};

exports.findAll = async (req, res, next) => {
  try {
    const db = MongoDB.client.db();
    const docGiaCollection = db.collection("docgia");

    const documents = await docGiaCollection
      .aggregate([
        {
          $lookup: {
            from: "theodoimuonsach",
            let: { maDocGia: "$MaDocGia" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$MaDocGia", "$$maDocGia"] },
                  $or: [{ NgayTra: null }, { NgayTra: { $exists: false } }],
                },
              },
            ],
            as: "borrowInfo",
          },
        },
        { $addFields: { hasBorrowed: { $gt: [{ $size: "$borrowInfo" }, 0] } } },
        { $project: { borrowInfo: 0, Password: 0 } },
      ])
      .toArray();

    res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách Độc Giả"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const document = await docGiaService.findById(req.params.id);
    if (!document) return next(new ApiError(404, "Không tìm thấy Độc giả"));

    const { Password, ...userWithoutPassword } = document;
    res.send(userWithoutPassword);
  } catch (error) {
    return next(new ApiError(500, `Lỗi truy xuất Độc giả id=${req.params.id}`));
  }
};

exports.update = async (req, res, next) => {
  try {
    console.log("controller.update called, params.id =", req.params.id);
    console.log("body keys:", Object.keys(req.body || {}));
    console.log("body:", req.body);
  } catch (e) {}

  if (!Object.keys(req.body || {}).length)
    return next(new ApiError(400, "Dữ liệu cập nhật không được trống"));

  try {
    const docGiaService = new DocGiaService(MongoDB.client);

    let payload = { ...req.body };

    if (req.file) {
      payload.Avatar = `/uploads/docgia/${req.file.filename}`;
    }

    const updated = await docGiaService.update(req.params.id, payload);

    console.log(">> update result:", updated);

    if (!updated) {
      const existingById = await docGiaService
        .findById(req.params.id)
        .catch(() => null);
      const existingByMa = !existingById
        ? await docGiaService
            .findOne({ MaDocGia: req.params.id })
            .catch(() => null)
        : null;
      const existing = existingById || existingByMa;

      if (!existing) {
        return next(new ApiError(404, "Không tìm thấy Độc giả"));
      }

      const checkPayload = { ...req.body };
      delete checkPayload.MaDocGia;
      delete checkPayload.Password; // password thường bị xử lý riêng, bỏ qua khi so sánh

      if (payload.Avatar) {
        checkPayload.Avatar = payload.Avatar;
      }

      let hasDiff = false;
      for (const k of Object.keys(checkPayload)) {
        const newVal = checkPayload[k];
        const oldVal = existing[k];

        const normalize = (v) => {
          if (v === undefined || v === null) return "";
          if (typeof v === "string") return v.trim();
          if (v instanceof Date) return v.toISOString();
          return String(v);
        };

        if (normalize(newVal) !== normalize(oldVal)) {
          hasDiff = true;
          break;
        }
      }

      if (!hasDiff) {
        return res.status(200).json({
          message:
            "Không có thay đổi (các trường gửi lên giống với dữ liệu hiện có).",
          doc: existing,
        });
      }
      return next(new ApiError(500, "Không thể cập nhật. Vui lòng thử lại."));
    }

    return res.json({
      message: "Cập nhật thành công",
      doc: updated,
    });
  } catch (error) {
    console.error("update controller ERROR:", error);
    return next(new ApiError(500, `Lỗi cập nhật Độc giả id=${req.params.id}`));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const docGia = await docGiaService.findById(req.params.id);
    if (!docGia) return next(new ApiError(404, "Không tìm thấy Độc giả"));

    const muonCollection = MongoDB.client.db().collection("theodoimuonsach");
    const hasBorrowed = await muonCollection.findOne({
      MaDocGia: docGia.MaDocGia,
      $or: [{ NgayTra: null }, { NgayTra: { $exists: false } }],
    });
    if (hasBorrowed) return next(new ApiError(400, "Độc giả đang mượn sách"));

    await docGiaService.delete(req.params.id);
    res.send({ message: "Xóa thành công" });
  } catch (error) {
    return next(new ApiError(500, `Lỗi xóa Độc giả id=${req.params.id}`));
  }
};

exports.deleteAll = async (_req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const deletedCount = await docGiaService.deleteAll();
    res.send({ message: `${deletedCount} Độc giả đã được xóa thành công` });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa tất cả Độc giả"));
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const docGia = await docGiaService.findOne({ MaDocGia: req.user.MaDocGia });
    if (!docGia) return next(new ApiError(404, "Không tìm thấy Độc giả"));

    const { Password, ...userWithoutPassword } = docGia;
    res.send(userWithoutPassword);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi lấy thông tin profile"));
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    console.log(">>> updateProfile called");
    console.log("USER:", req.user);
    console.log("BODY keys:", Object.keys(req.body || {}));
    console.log("FILES:", req.file ? req.file.path : "No file");

    if (!req.user || !req.user.MaDocGia) {
      console.error("No req.user or missing MaDocGia");
      return next(new ApiError(401, "Không xác thực người dùng"));
    }

    const db = MongoDB.client.db();
    const docGiaColl = db.collection("docgia");
    const maDocGia = String(req.user.MaDocGia).trim(); // BƯỚC 1: KIỂM TRA SỰ TỒN TẠI VÀ LẤY TÀI LIỆU HIỆN CÓ

    const existingDoc = await docGiaColl.findOne({ MaDocGia: maDocGia });
    if (!existingDoc) {
      return next(
        new ApiError(404, "Không tìm thấy Độc giả (MaDocGia không tồn tại)")
      );
    }

    let payload = { ...req.body };
    delete payload.Password;
    delete payload.MatKhau;
    delete payload.MaDocGia;

    if (payload.NgaySinh && typeof payload.NgaySinh === "string") {
      const d = new Date(payload.NgaySinh);
      if (!isNaN(d.getTime())) payload.NgaySinh = d;
    }

    if (req.file) {
      payload.Avatar = req.file.path;
      console.log("Avatar path added:", payload.Avatar);
    }

    if (!Object.keys(payload).length) {
      const { Password, MatKhau, password, matkhau, ...userWithoutPassword } =
        existingDoc;
      return res.status(200).send({
        message: "Không có dữ liệu cập nhật.",
        profile: userWithoutPassword,
      });
    }

    const result = await docGiaColl.findOneAndUpdate(
      { MaDocGia: maDocGia },
      { $set: payload },
      { returnDocument: "after" }
    );

    if (!result.value) {
      const { Password, MatKhau, password, matkhau, ...userWithoutPassword } =
        existingDoc;
      return res.status(200).send({
        message: "Cập nhật thành công.",
        profile: userWithoutPassword,
      });
    }
    const { Password, MatKhau, password, matkhau, ...userWithoutPassword } =
      result.value;
    return res.send({
      message: "Cập nhật thông tin thành công",
      profile: userWithoutPassword,
    });
  } catch (error) {
    console.error("updateProfile ERROR:", error);
    if (process.env.NODE_ENV === "development") {
      return res
        .status(500)
        .json({ message: error.message, stack: error.stack });
    }
    return next(new ApiError(500, "Lỗi khi cập nhật profile"));
  }
};

exports.getBorrowStats = async (req, res, next) => {
  try {
    const db = MongoDB.client.db();
    const muonColl = db.collection("theodoimuonsach");
    const ma = req.user.MaDocGia;

    const docs = await muonColl.find({ MaDocGia: ma }).toArray();

    let currentBorrowed = 0; // số sách đang mượn
    let totalBorrowed = 0; // tổng sách đã mượn (tất cả phiếu)
    let overdueCount = 0; // số sách quá hạn

    const today = new Date();

    for (const d of docs) {
      const chiTiet = Array.isArray(d.ChiTietMuon) ? d.ChiTietMuon : [];
      const numBooks = chiTiet.reduce(
        (s, it) => s + (Number(it.SoLuong) || 1),
        0
      );
      totalBorrowed += numBooks;

      const isStillBorrowed =
        d.NgayTra == null ||
        d.NgayTra === undefined ||
        d.TrangThai === "Đang mượn";
      if (isStillBorrowed) {
        currentBorrowed += numBooks;
      }

      const hanTra = d.HanTra ? new Date(d.HanTra) : null;
      if (hanTra && hanTra < today && isStillBorrowed) {
        overdueCount += numBooks;
      }
    }

    res.json({
      currentBorrowed,
      totalBorrowed,
      overdueCount,
    });
  } catch (err) {
    console.error("getBorrowStats error:", err);
    return next(new ApiError(500, "Lỗi lấy thống kê mượn sách"));
  }
};
