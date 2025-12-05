<template>
    <div class="container mt-4">
        <h2>Thêm Phiếu Mượn Sách</h2>
        <TheoDoiMuonSachForm :td="{}" :docGiaList="docGiaList" :sachList="sachList" @submit:td="createTheoDoi" />
        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
    </div>
</template>

<script>
import TheoDoiMuonSachForm from "@/components/theodoimuonsach/TheoDoiMuonSachForm.vue";
import TheoDoiMuonSachService from "@/services/theodoimuonsach.service";
import DocGiaService from "@/services/docgia.service";
import SachService from "@/services/sach.service";

export default {
    components: { TheoDoiMuonSachForm },
    data: () => ({
        docGiaList: [],
        sachList: [],
        errorMessage: ""
    }),
    async created() {
        try {
            const [dg, sach] = await Promise.all([
                DocGiaService.getAll(),
                SachService.getAll()
            ]);
            this.docGiaList = dg.data || dg;
            this.sachList = sach.data || sach;
        } catch (err) {
            this.errorMessage = "Không tải được danh sách độc giả hoặc sách";
        }
    },
    methods: {
        async createTheoDoi(payload) {
            try {
                await TheoDoiMuonSachService.create(payload);
                this.$swal.fire("Thành công!", "Tạo phiếu mượn thành công", "success");
                this.$router.push({ name: "theodoimuonsach.list" });
            } catch (err) {
                this.$swal.fire("Lỗi", err.response?.data?.message || "Tạo thất bại", "error");
            }
        }
    }
};
</script>