<template>
    <form @submit.prevent="submitNhanVien" class="row g-3">
        <div class="col-12 text-center mb-4">
            <label class="form-label fw-bold text-success">Avatar Nhân Viên</label>
            <div class="avatar-preview-wrapper mx-auto">
                <img v-if="previewUrl" :src="previewUrl" alt="Avatar" class="avatar-preview rounded-circle shadow" />
                <div v-else
                    class="avatar-preview bg-primary-custom text-white d-flex align-items-center justify-content-center rounded-circle shadow">
                    <span class="fs-1 fw-bold">{{ initials }}</span>
                </div>
            </div>
            <input type="file" class="form-control w-75 mx-auto mt-3" accept="image/*" @change="handleAvatarChange" />
            <small class="text-muted">Tối đa 3MB, định dạng JPG/PNG</small>
        </div>

        <div class="col-md-6">
            <label>MSNV <span class="text-danger">*</span></label>
            <input v-model="nhanVienLocal.MSNV" class="form-control" required />
        </div>
        <div class="col-md-6">
            <label>Họ Tên <span class="text-danger">*</span></label>
            <input v-model="nhanVienLocal.HoTenNV" class="form-control" required />
        </div>

        <div class="col-md-6" v-if="!nhanVienLocal._id">
            <label>Mật Khẩu <span class="text-danger">*</span></label>
            <input type="password" v-model="nhanVienLocal.Password" class="form-control" required />
        </div>
        <div class="col-md-6" v-else>
            <label>Mật Khẩu Mới <small class="text-muted">(để trống nếu không đổi)</small></label>
            <input type="password" v-model="nhanVienLocal.Password" class="form-control"
                placeholder="Nhập để đổi mật khẩu" />
        </div>

        <div class="col-md-6">
            <label>Chức Vụ <span class="text-danger">*</span></label>
            <select v-model="nhanVienLocal.ChucVu" class="form-select" required>
                <option value="HoTro">Hỗ Trợ</option>
                <option value="ThuThu">Thủ Thư</option>
                <option value="QuanLy">Quản Lý</option>
                <option value="Admin">Admin</option>
            </select>
        </div>

        <div class="col-md-6">
            <label>Địa Chỉ</label>
            <input v-model="nhanVienLocal.DiaChi" class="form-control" />
        </div>
        <div class="col-md-6">
            <label>Số Điện Thoại</label>
            <input v-model="nhanVienLocal.SoDienThoai" class="form-control" />
        </div>

        <div class="col-12 text-center mt-4">
            <button type="submit" class="btn btn-success px-5">
                <i class="fas fa-save me-2"></i>
                {{ nhanVienLocal._id ? 'Cập Nhật' : 'Thêm Mới' }}
            </button>
        </div>
    </form>
</template>

<script>
export default {
    name: "NhanVienForm",
    props: { nhanVien: { type: Object, required: true } },
    emits: ["submit:nhanvien", "submit:nhanvien-with-file"],
    data() {
        return {
            nhanVienLocal: {},
            newAvatarFile: null,
            previewUrl: null
        };
    },
    computed: {
        initials() {
            return (this.nhanVienLocal.HoTenNV || this.nhanVienLocal.MSNV || "?").charAt(0).toUpperCase();
        }
    },
    watch: {
        nhanVien: {
            handler(newVal) {
                this.nhanVienLocal = newVal ? { ...newVal } : {};
                this.previewUrl = this.nhanVienLocal.Avatar || null;
                this.newAvatarFile = null;
                if (this.nhanVienLocal._id) {
                    this.nhanVienLocal.Password = "";
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        handleAvatarChange(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 3 * 1024 * 1024) {
                alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 3MB");
                e.target.value = "";
                return;
            }

            this.newAvatarFile = file;
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.previewUrl = ev.target.result;
            };
            reader.readAsDataURL(file);
        },
        submitNhanVien() {
            const cleanData = { ...this.nhanVienLocal };
            delete cleanData.Avatar;

            if (this.newAvatarFile) {
                this.$emit("submit:nhanvien-with-file", {
                    nhanVien: cleanData,
                    file: this.newAvatarFile
                });
            } else {
                this.$emit("submit:nhanvien", cleanData);
            }
        }
    }
};
</script>

<style scoped>
:root {
    --primary: #0d6efd;
    --primary-light: #cfe2ff;
    --primary-bg: #e7f1ff;
}

.avatar-preview-wrapper {
    width: 160px;
    height: 160px;
    margin: 0 auto 20px;
    border: 5px solid var(--primary);
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(13, 110, 253, 0.25);
}

.avatar-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.bg-primary-custom {
    background: linear-gradient(135deg, #0d6efd, #0b5ed7) !important;
}

.form-control:focus,
.form-select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-success {
    background-color: var(--primary) !important;
    border-color: var(--primary) !important;
}

.btn-success:hover {
    background-color: #0b5ed7 !important;
    border-color: #0a58ca !important;
}
</style>