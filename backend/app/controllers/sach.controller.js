const SachService = require("../services/sach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.TenSach) {
    return next(new ApiError(400, "Tên sách không được để trống"));
  }

  if (req.file) {
    req.body.BiaSach = `/uploads/sach/${req.file.filename}`;
  }

  try {
    const sachService = new SachService(MongoDB.client);
    const document = await sachService.create(req.body);

    return res.send({
      message: "Thêm sách thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo sách mới"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const db = MongoDB.client.db();
    const sachCollection = db.collection("sach");
    const muonCollection = db.collection("theodoimuonsach");

    const documents = await sachCollection
      .aggregate([
        {
          $lookup: {
            from: "theodoimuonsach",
            let: { maSach: "$MaSach" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$$maSach", "$ChiTietMuon.MaSach"] },
                  $or: [{ NgayTra: null }, { NgayTra: { $exists: false } }],
                },
              },
            ],
            as: "borrowInfo",
          },
        },
        {
          $addFields: {
            isBorrowed: { $gt: [{ $size: "$borrowInfo" }, 0] },
          },
        },
        { $project: { borrowInfo: 0 } },
      ])
      .toArray();

    res.send({
      message: "Lấy danh sách sách thành công",
      data: documents,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách sách"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);

    const document = await sachService.findById(req.params.id);

    if (document === null) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }

    return res.send({
      message: "Lấy sách thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi tìm sách id=${req.params.id}`));
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được trống"));
  }

  const sachService = new SachService(MongoDB.client);
  const sachId = req.params.id;
  const oldDocument = await sachService.findById(sachId); // Lấy sách cũ để kiểm tra ảnh cũ

  if (!oldDocument) {
    if (req.file) {
      const fs = require("fs");
      fs.unlinkSync(req.file.path);
    }
    return next(new ApiError(404, "Không tìm thấy sách để cập nhật"));
  }

  let oldBiaSachPath = null;
  if (req.file) {
    oldBiaSachPath = oldDocument.BiaSach;
    req.body.BiaSach = `/uploads/sach/${req.file.filename}`;
  }

  try {
    const document = await sachService.update(sachId, req.body);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sách để cập nhật"));
    }

    if (oldBiaSachPath) {
      const fs = require("fs");
      const path = require("path");
      const oldAbsolutePath = path.join(
        __dirname,
        "../../uploads/sach",
        path.basename(oldBiaSachPath)
      );

      if (fs.existsSync(oldAbsolutePath)) {
        fs.unlinkSync(oldAbsolutePath);
      }
    }

    return res.send({
      message: "Cập nhật sách thành công",
      data: document,
    });
  } catch (error) {
    if (req.file) {
      const fs = require("fs");
      fs.unlinkSync(req.file.path);
    }
    return next(new ApiError(500, `Lỗi khi cập nhật sách id=${req.params.id}`));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);
    const sachId = req.params.id;

    const sach = await sachService.findById(sachId);
    if (!sach) {
      return next(new ApiError(404, "Không tìm thấy sách để xóa"));
    }

    const theoDoiMuonSach = MongoDB.client.db().collection("theodoimuonsach");

    const isBorrowed = await theoDoiMuonSach.findOne({
      "ChiTietMuon.MaSach": sach.MaSach,
      $or: [{ NgayTra: null }, { NgayTra: { $exists: false } }],
    });

    if (isBorrowed) {
      return next(
        new ApiError(400, "Không thể xóa sách vì đang có người mượn")
      );
    }

    const document = await sachService.delete(sachId);

    return res.send({
      message: "Xóa sách thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi xóa sách id=${req.params.id}`));
  }
};

exports.deleteAll = async (_req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);
    const deletedCount = await sachService.deleteAll();

    return res.send({
      message: `${deletedCount} sách đã bị xóa`,
      data: { deletedCount },
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa toàn bộ sách"));
  }
};

exports.findAvailable = async (req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);
    const documents = await sachService.find({ SoQuyen: { $gt: 0 } });
    return res.send({
      message: "Lấy danh sách sách có thể mượn thành công",
      data: documents,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách sách có thể mượn"));
  }
};

exports.search = async (req, res, next) => {
  const keyword = req.query.q?.trim();
  console.log(keyword);
  if (!keyword) {
    return res.send({
      message: "Vui lòng nhập từ khóa tìm kiếm",
      data: [],
      total: 0,
    });
  }

  try {
    const sachService = new SachService(MongoDB.client);

    const regex = new RegExp(keyword, "i");

    const documents = await sachService.find({
      $or: [
        { TenSach: regex },
        { TacGia: regex },
        { MaSach: regex },
        { MaNXB: regex },
      ],
    });
    return res.send({
      message: documents.length
        ? "Tìm kiếm thành công"
        : "Không tìm thấy sách nào",
      data: documents,
      total: documents.length,
    });
  } catch (error) {
    console.error("Lỗi tìm kiếm sách:", error);
    return next(new ApiError(500, "Lỗi khi tìm kiếm sách"));
  }
};
