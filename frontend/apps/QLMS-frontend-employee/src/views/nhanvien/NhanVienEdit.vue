<template>
    <div class="container mt-4">
        <div class="row justify-content-center">
            <div class="col-md-7">
                <h2 class="text-center text-primary fw-bold mb-4">
                    Cập Nhật Nhân Viên
                </h2>

                <NhanVienForm v-if="nhanVien" :nhanVien="nhanVien" @submit:nhanvien="updateNhanVien"
                    @submit:nhanvien-with-file="updateNhanVienWithFile" />

                <div v-else class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <p class="mt-3 text-muted">Đang tải thông tin nhân viên...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import NhanVienForm from "@/components/nhanvien/NhanVienForm.vue";
import NhanVienService from "@/services/nhanvien.service";
import Swal from "sweetalert2";

export default {
    components: { NhanVienForm },
    data() {
        return {
            nhanVien: null,
        };
    },
    methods: {
        async loadNhanVien() {
            try {
                this.nhanVien = await NhanVienService.getById(this.$route.params.id);
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: "Không thể tải thông tin nhân viên.",
                });
                this.$router.push({ name: "nhanvien.list" });
            }
        },

        async updateNhanVien(data) {
            try {
                await NhanVienService.updateWithAvatar(this.nhanVien._id, data, null);
                this.showSuccess("Cập nhật thành công!");
            } catch (error) {
                this.showError(error);
            }
        },

        async updateNhanVienWithFile({ nhanVien, file }) {
            try {
                await NhanVienService.updateWithAvatar(this.nhanVien._id, nhanVien, file);
                this.showSuccess("Cập nhật nhân viên + avatar thành công!");
            } catch (error) {
                this.showError(error);
            }
        },

        showSuccess(message) {
            Swal.fire({
                icon: "success",
                title: "Thành công!",
                text: message,
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                this.$router.push({ name: "nhanvien.list" });
            });
        },

        showError(error) {
            const msg = error?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại!";
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: msg,
            });
            console.error("Lỗi cập nhật nhân viên:", error);
        },
    },
    created() {
        this.loadNhanVien();
    },
};
</script>

<style scoped>
.text-primary {
    color: #0d6efd !important;
}

.spinner-border {
    width: 3rem;
    height: 3rem;
}
</style>