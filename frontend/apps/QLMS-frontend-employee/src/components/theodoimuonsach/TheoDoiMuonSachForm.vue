<template>
    <div class="container py-4">
        <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="card-header bg-dark text-white py-4">
                <h4 class="mb-0 text-center fw-bold">
                    <i class="fas fa-book-reader me-2"></i>
                    {{ tdLocal._id ? 'CẬP NHẬT PHIẾU MƯỢN' : 'TẠO PHIẾU MƯỢN MỚI' }}
                </h4>
            </div>

            <div class="card-body p-5">
                <form @submit.prevent="submitTheoDoi">

                    <div class="mb-4">
                        <label class="form-label fw-bold text-dark">
                            <i class="fas fa-user me-2"></i>Mã Độc Giả <span class="text-danger">*</span>
                        </label>
                        <select v-model="tdLocal.MaDocGia" class="form-select form-select-lg" required>
                            <option value="" disabled>-- Chọn độc giả --</option>
                            <option v-for="dg in docGiaList" :key="dg._id" :value="dg.MaDocGia">
                                {{ dg.MaDocGia }} - {{ dg.HoLot }} {{ dg.Ten }}
                            </option>
                        </select>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0 fw-bold text-dark">
                            <i class="fas fa-book me-2"></i>Sách mượn
                        </h5>
                        <span class="badge bg-secondary fs-5 px-4 py-2">{{ totalBooks }}/3 cuốn</span>
                    </div>

                    <div v-for="(item, index) in tdLocal.ChiTietMuon" :key="index"
                        class="d-flex align-items-center gap-3 p-3 mb-3 border rounded bg-light">
                        <div class="flex-grow-1">
                            <strong class="text-dark">{{ index + 1 }}.</strong>
                            <span class="fw-bold ms-2">{{ getTenSach(item.MaSach) }}</span>
                            <small class="text-muted ms-2">× {{ item.SoLuong || 1 }}</small>
                        </div>
                        <input type="number" v-model.number="item.SoLuong" min="1" :max="getSoQuyenCon(item.MaSach)"
                            class="form-control w-25" />
                        <button type="button" class="btn btn-outline-danger btn-sm" @click="xoaSach(index)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>

                    <div v-if="totalBooks < 3" class="input-group mb-4">
                        <select v-model="sachMoi" class="form-select">
                            <option :value="null" disabled>-- Chọn sách để thêm --</option>
                            <option v-for="s in sachList" :key="s.MaSach" :value="s"
                                :disabled="s.SoQuyen <= 0 || daChonSach(s.MaSach)">
                                {{ s.MaSach }} - {{ s.TenSach }} (Còn: {{ s.SoQuyen }} cuốn)
                            </option>
                        </select>
                        <input type="number" v-model.number="soLuongMoi" min="1" :max="3 - totalBooks" placeholder="SL"
                            class="form-control" style="max-width: 100px;" />
                        <button type="button" class="btn btn-success" @click="themSach"
                            :disabled="!sachMoi || !soLuongMoi || totalBooks + soLuongMoi > 3">
                            <i class="fas fa-plus me-1"></i> Thêm
                        </button>
                    </div>

                    <div v-if="totalBooks >= 3" class="alert alert-secondary">
                        <i class="fas fa-info-circle"></i> <strong>Đã đạt giới hạn 3 cuốn sách!</strong>
                    </div>

                    <div class="row g-4 mb-4">
                        <div class="col-md-6">
                            <label class="form-label fw-bold text-dark">
                                <i class="fas fa-calendar-alt me-2"></i>Ngày mượn <span class="text-danger">*</span>
                            </label>
                            <input type="date" v-model="tdLocal.NgayMuon" class="form-control form-control-lg"
                                required />
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold text-dark">
                                <i class="fas fa-calendar-check me-2"></i>Hạn trả
                            </label>
                            <input type="date" v-model="tdLocal.HanTra" class="form-control form-control-lg" />
                        </div>
                    </div>

                    <div class="mb-4" v-if="tdLocal._id">
                        <label class="form-label fw-bold text-dark">
                            <i class="fas fa-tasks me-2"></i>Trạng thái
                        </label>
                        <select v-model="tdLocal.TrangThai" class="form-select form-select-lg">
                            <option value="Chờ duyệt">Chờ duyệt</option>
                            <70<option value="Đang mượn">Đang mượn</option>
                                <option value="Đã trả">Đã trả</option>
                                <option value="Trễ hạn">Trễ hạn</option>
                        </select>
                    </div>

                    <div v-if="tdLocal.TrangThai === 'Trễ hạn'" class="alert alert-danger">
                        <h5 class="alert-heading">PHIẾU ĐÃ TRỄ HẠN</h5>
                        <hr>
                        <p class="mb-2">Tiền thuê: <strong>{{ formatTien(tdLocal.TongTien) }}</strong></p>
                        <p class="mb-2 h5">
                            Phạt trễ hạn: <strong>{{ formatTien(tdLocal.TienPhat || tdLocal.TienPhatTamThoi) }}</strong>
                        </p>
                        <p class="mb-0 h4 text-danger">
                            Tổng phải trả: <strong>{{ formatTien(tdLocal.TongThanhToan) }}</strong>
                        </p>
                    </div>

                    <div class="d-grid mt-5">
                        <button type="submit" class="btn btn-success btn-lg fw-bold">
                            <i class="fas fa-save me-2"></i>
                            {{ tdLocal._id ? 'CẬP NHẬT PHIẾU MƯỢN' : 'TẠO PHIẾU MƯỢN MỚI' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
    name: "TheoDoiMuonSachForm",
    props: {
        td: { type: Object, default: () => ({}) },
        docGiaList: { type: Array, default: () => [] },
        sachList: { type: Array, default: () => [] }
    },
    emits: ["submit:td"],
    data() {
        return {
            tdLocal: {
                MaDocGia: "",
                ChiTietMuon: [],
                NgayMuon: new Date().toISOString().split("T")[0],
                HanTra: "",
                TrangThai: "Chờ duyệt"
            },
            sachMoi: null,
            soLuongMoi: 1
        };
    },
    computed: {
        totalBooks() {
            return this.tdLocal.ChiTietMuon.reduce((sum, item) => sum + (item.SoLuong || 1), 0);
        }
    },
    watch: {
        td: {
            handler(newVal) {
                if (newVal && Object.keys(newVal).length > 0) {
                    this.tdLocal = {
                        ...newVal,
                        MaDocGia: newVal.MaDocGia || "",
                        ChiTietMuon: (newVal.ChiTietMuon || []).map(item => ({
                            MaSach: item.MaSach,
                            SoLuong: item.SoLuong || 1
                        })),
                        NgayMuon: newVal.NgayMuon ? newVal.NgayMuon.substring(0, 10) : new Date().toISOString().split("T")[0],
                        HanTra: newVal.HanTra ? newVal.HanTra.substring(0, 10) : "",
                        TrangThai: newVal.TrangThai || "Chờ duyệt"
                    };
                } else {
                    this.tdLocal = {
                        MaDocGia: "",
                        ChiTietMuon: [],
                        NgayMuon: new Date().toISOString().split("T")[0],
                        HanTra: "",
                        TrangThai: "Chờ duyệt"
                    };
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        formatTien(value) {
            const num = Number(value);
            if (isNaN(num) || num <= 0) return "0 đ";
            return num.toLocaleString("vi-VN") + " đ";
        },
        getTenSach(maSach) {
            const s = this.sachList.find(x => x.MaSach === maSach);
            return s ? s.TenSach : "Không tìm thấy";
        },
        getSoQuyenCon(maSach) {
            const s = this.sachList.find(x => x.MaSach === maSach);
            return s ? s.SoQuyen : 0;
        },
        daChonSach(maSach) {
            return this.tdLocal.ChiTietMuon.some(x => x.MaSach === maSach);
        },
        themSach() {
            if (!this.sachMoi || !this.soLuongMoi) return;
            if (this.totalBooks + this.soLuongMoi > 3) {
                Swal.fire("Lỗi", "Chỉ được mượn tối đa 3 cuốn!", "warning");
                return;
            }
            const exist = this.tdLocal.ChiTietMuon.find(x => x.MaSach === this.sachMoi.MaSach);
            if (exist) {
                exist.SoLuong += this.soLuongMoi;
            } else {
                this.tdLocal.ChiTietMuon.push({
                    MaSach: this.sachMoi.MaSach,
                    SoLuong: this.soLuongMoi
                });
            }
            this.sachMoi = null;
            this.soLuongMoi = 1;
        },
        xoaSach(index) {
            this.tdLocal.ChiTietMuon.splice(index, 1);
        },
        submitTheoDoi() {
            if (!this.tdLocal.MaDocGia) {
                Swal.fire("Lỗi", "Vui lòng chọn độc giả!", "warning");
                return;
            }
            if (this.tdLocal.ChiTietMuon.length === 0) {
                Swal.fire("Lỗi", "Vui lòng chọn ít nhất 1 sách!", "warning");
                return;
            }
            if (this.totalBooks > 3) {
                Swal.fire("Lỗi", "Tối đa chỉ được mượn 3 cuốn!", "warning");
                return;
            }

            const payload = {
                ...this.tdLocal,
                ChiTietMuon: this.tdLocal.ChiTietMuon.map(x => ({
                    MaSach: x.MaSach,
                    SoLuong: x.SoLuong
                }))
            };

            delete payload.TienPhatTamThoi;
            delete payload.TongThanhToan;
            delete payload.TienPhat;

            this.$emit("submit:td", payload);
        }
    }
};
</script>