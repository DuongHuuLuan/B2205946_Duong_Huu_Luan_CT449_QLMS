<template>
    <form @submit.prevent="submitDocGia" enctype="multipart/form-data">
        <div class="row g-3">
            <div class="col-12 text-center">
                <label class="form-label d-block fw-bold">Ảnh Đại Diện</label>

                <div class="avatar-preview-wrapper mx-auto mb-3">
                    <img v-if="previewUrl" :src="previewUrl" alt="Avatar preview"
                        class="avatar-preview rounded-circle" />
                    <div v-else
                        class="avatar-preview rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center">
                        <span class="fs-3">DG</span>
                    </div>
                </div>

                <input type="file" class="form-control form-control-sm w-75 mx-auto" accept="image/*"
                    @change="handleAvatarChange" />
                <small class="text-muted">Tối đa 2MB, định dạng JPG/PNG</small>
            </div>

            <div class="col-md-6">
                <label class="form-label">Mã Độc Giả <span class="text-danger">*</span></label>
                <input v-model="docGiaLocal.MaDocGia" class="form-control" required />
            </div>

            <div class="col-md-6">
                <label class="form-label">Họ Lót <span class="text-danger">*</span></label>
                <input v-model="docGiaLocal.HoLot" class="form-control" required />
            </div>

            <div class="col-md-6">
                <label class="form-label">Tên <span class="text-danger">*</span></label>
                <input v-model="docGiaLocal.Ten" class="form-control" required />
            </div>

            <div class="col-md-6">
                <label class="form-label">Ngày Sinh <span class="text-danger">*</span></label>
                <input type="date" v-model="docGiaLocal.NgaySinh" class="form-control" required />
            </div>

            <div class="col-md-6">
                <label class="form-label">Phái <span class="text-danger">*</span></label>
                <select v-model="docGiaLocal.Phai" class="form-select" required>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                </select>
            </div>

            <div class="col-md-6">
                <label class="form-label">Địa Chỉ</label>
                <input v-model="docGiaLocal.DiaChi" class="form-control" />
            </div>

            <div class="col-md-6">
                <label class="form-label">Điện Thoại</label>
                <input v-model="docGiaLocal.DienThoai" class="form-control" />
            </div>

            <div class="col-md-6" v-if="!docGiaLocal._id">
                <label class="form-label">Mật Khẩu Mặc Định</label>
                <input v-model="docGiaLocal.Password" type="text" class="form-control"
                    placeholder="Để trống (Mặc định = 123456)" />
            </div>
        </div>

        <div class="text-center mt-4">
            <button type="submit" class="btn btn-success px-5">
                <i class="fas fa-save me-2"></i>
                {{ docGiaLocal._id ? 'Cập Nhật' : 'Tạo Mới' }}
            </button>
        </div>
    </form>
</template>

<script>
export default {
    name: "DocGiaForm",
    props: {
        docGia: { type: Object, required: true }
    },
    emits: ["submit:docgia", "submit:docgia-with-file"],
    data() {
        return {
            docGiaLocal: {},
            newAvatarFile: null,
            previewUrl: null
        };
    },
    watch: {
        docGia: {
            handler(newVal) {
                this.docGiaLocal = newVal ? { ...newVal } : {};
                this.previewUrl = this.docGiaLocal.Avatar || null;
                this.newAvatarFile = null;
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        handleAvatarChange(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
                alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB");
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

        submitDocGia() {
            const cleanData = { ...this.docGiaLocal };
            delete cleanData.Avatar;

            if (this.newAvatarFile) {
                this.$emit("submit:docgia-with-file", {
                    docGia: cleanData,
                    file: this.newAvatarFile
                });
            } else {
                this.$emit("submit:docgia", cleanData);
            }
        }
    }
};
</script>

<style scoped>
.avatar-preview-wrapper {
    width: 120px;
    height: 120px;
    margin: 0 auto 15px;
    border: 3px solid #e0e0e0;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.avatar-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.default-avatar {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 2rem;
    color: white;
}
</style>