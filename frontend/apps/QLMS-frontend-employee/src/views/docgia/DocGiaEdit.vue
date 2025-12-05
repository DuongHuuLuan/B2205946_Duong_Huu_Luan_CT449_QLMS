<script>
import DocGiaForm from "@/components/docgia/DocGiaForm.vue";
import DocGiaService from "@/services/docgia.service";
import Swal from "sweetalert2";

export default {
    components: { DocGiaForm },
    data() {
        return { docGia: null };
    },
    methods: {
        async loadDocGia() {
            this.docGia = await DocGiaService.get(this.$route.params.id);
        },

        async updateDocGia(data) {
            await DocGiaService.updateWithAvatar(this.$route.params.id, data, null);
            Swal.fire("Thành công!", "Cập nhật thành công", "success");
            this.$router.push({ name: "docgia.list" });
        },

        async updateDocGiaWithFile({ docGia, file }) {
            await DocGiaService.updateWithAvatar(this.$route.params.id, docGia, file);
            Swal.fire("Thành công!", "Cập nhật avatar thành công", "success");
            this.$router.push({ name: "docgia.list" });
        },
    },
    mounted() {
        this.loadDocGia();
    },
};
</script>

<template>
    <div class="container mt-4">
        <h2>Cập Nhật Độc Giả</h2>
        <DocGiaForm v-if="docGia" :docGia="docGia" @submit:docgia="updateDocGia"
            @submit:docgia-with-file="updateDocGiaWithFile" />
    </div>
</template>