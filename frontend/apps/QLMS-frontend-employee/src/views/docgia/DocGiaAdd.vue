<script>
import DocGiaForm from "@/components/docgia/DocGiaForm.vue";
import DocGiaService from "@/services/docgia.service";
import Swal from "sweetalert2";

export default {
    components: { DocGiaForm },
    methods: {
        async addDocGia(docGiaData) {
            try {
                await DocGiaService.create(docGiaData);
                Swal.fire("Thành công!", "Thêm độc giả thành công", "success");
                this.$router.push({ name: "docgia.list" });
            } catch (err) {
                Swal.fire("Lỗi", err.response?.data?.message || "Thêm thất bại", "error");
            }
        },

        async addDocGiaWithFile({ docGia, file }) {
            try {
                await DocGiaService.createWithAvatar(docGia, file);
                Swal.fire("Thành công!", "Thêm độc giả mới thành công", "success");
                this.$router.push({ name: "docgia.list" });
            } catch (err) {
                Swal.fire("Lỗi", err.response?.data?.message || "Upload avatar thất bại", "error");
            }
        },
    },
};
</script>

<template>
    <div class="container mt-4">
        <h2>Thêm Độc Giả</h2>
        <DocGiaForm :docGia="{}" @submit:docgia="addDocGia" @submit:docgia-with-file="addDocGiaWithFile" />
    </div>
</template>