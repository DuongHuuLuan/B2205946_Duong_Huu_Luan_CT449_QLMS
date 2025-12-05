<template>
    <div class="container mt-4">
        <h2 class="text-center text-primary fw-bold mb-4">Thêm Nhân Viên Mới</h2>
        <NhanVienForm :nhanVien="{}" @submit:nhanvien="addNhanVien" @submit:nhanvien-with-file="addNhanVienWithFile" />
    </div>
</template>

<script>
import NhanVienForm from "@/components/nhanvien/NhanVienForm.vue";
import NhanVienService from "@/services/nhanvien.service";
import Swal from "sweetalert2";

export default {
    components: { NhanVienForm },
    methods: {
        async addNhanVien(data) {
            await NhanVienService.createWithAvatar(data, null);
            Swal.fire("Thành công!", "Thêm nhân viên thành công", "success");
            this.$router.push({ name: "nhanvien.list" });
        },
        async addNhanVienWithFile({ nhanVien, file }) {
            await NhanVienService.createWithAvatar(nhanVien, file);
            Swal.fire("Thành công!", "Thêm nhân viên + avatar thành công", "success");
            this.$router.push({ name: "nhanvien.list" });
        }
    }
};
</script>