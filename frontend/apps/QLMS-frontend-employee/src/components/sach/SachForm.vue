<template>
    <form @submit.prevent="submitSach" enctype="multipart/form-data" class="row g-3">
        <div class="col-12 text-center mb-4">
            <label class="form-label fw-bold">Bìa Sách</label>
            <div class="cover-preview-wrapper mx-auto">
                <img v-if="previewUrl" :src="previewUrl" alt="Bìa sách" class="cover-preview rounded shadow" />
                <div v-else
                    class="cover-preview bg-light d-flex align-items-center justify-content-center rounded shadow">
                    <span class="text-muted">Không có ảnh</span>
                </div>
            </div>
            <input type="file" class="form-control w-75 mx-auto mt-3 mt-3" accept="image/*"
                @change="handleBiaSachChange" />
            <small class="text-muted">Tỷ lệ khuyến nghị: 2:3 (ví dụ: 400x600px)</small>
        </div>

        <div class="col-md-6">
            <label>Mã Sách <span class="text-danger">*</span></label>
            <input v-model="sachLocal.MaSach" class="form-control" required />
        </div>
        <div class="col-md-6">
            <label>Tên Sách <span class="text-danger">*</span></label>
            <input v-model="sachLocal.TenSach" class="form-control" required />
        </div>
        <div class="col-md-6">
            <label>Đơn Giá <span class="text-danger">*</span></label>
            <input type="number" v-model.number="sachLocal.DonGia" class="form-control" required />
        </div>
        <div class="col-md-6">
            <label>Số Quyển <span class="text-danger">*</span></label>
            <input type="number" v-model.number="sachLocal.SoQuyen" class="form-control" required />
        </div>
        <div class="col-md-6">
            <label>Năm Xuất Bản <span class="text-danger">*</span></label>
            <input type="number" v-model.number="sachLocal.NamXuatBan" class="form-control" required />
        </div>
        <div class="col-md-6">
            <label>Mã NXB <span class="text-danger">*</span></label>
            <select v-model="sachLocal.MaNXB" class="form-select" required>
                <option value="" disabled>Chọn NXB</option>
                <option v-for="n in nxbList" :key="n._id" :value="n.MaNXB">
                    {{ n.MaNXB }} - {{ n.TenNXB }}
                </option>
            </select>
        </div>
        <div class="col-12">
            <label>Tác Giả / Nguồn Gốc</label>
            <input v-model="sachLocal.TacGia" class="form-control" />
        </div>

        <div class="col-12 text-center mt-4">
            <button type="submit" class="btn btn-success px-5">
                {{ sachLocal._id ? 'Cập Nhật' : 'Thêm Mới' }}
            </button>
        </div>
    </form>
</template>

<script>
export default {
    name: "SachForm",
    props: {
        sach: { type: Object, required: true },
        nxbList: { type: Array, default: () => [] }
    },
    emits: ["submit:sach", "submit:sach-with-file"],
    data() {
        return {
            sachLocal: {},
            newBiaSachFile: null,
            previewUrl: null
        };
    },
    watch: {
        sach: {
            handler(newVal) {
                this.sachLocal = newVal ? { ...newVal } : {};
                this.previewUrl = this.sachLocal.BiaSach || null;
                this.newBiaSachFile = null;
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        handleBiaSachChange(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 3 * 1024 * 1024) {
                alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 3MB");
                return;
            }

            this.newBiaSachFile = file;
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.previewUrl = ev.target.result;
            };
            reader.readAsDataURL(file);
        },
        submitSach() {
            const cleanData = { ...this.sachLocal };
            delete cleanData.BiaSach;

            if (this.newBiaSachFile) {
                this.$emit("submit:sach-with-file", {
                    sach: cleanData,
                    file: this.newBiaSachFile
                });
            } else {
                this.$emit("submit:sach", cleanData);
            }
        }
    }
};
</script>

<style scoped>
.cover-preview-wrapper {
    width: 200px;
    ;
    height: 300px;
    margin: 0 auto 20px;
    border: 3px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cover-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>