<template>
    <div class="container mt-4">
        <h2>Cập Nhật Phiếu Mượn Sách</h2>
        <TheoDoiMuonSachForm v-if="td" :td="td" :docGiaList="docGiaList" :sachList="sachList"
            @submit:td="updateTheoDoi" />
        <p v-else>Đang tải dữ liệu...</p>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
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
        td: null,
        docGiaList: [],
        sachList: [],
        errorMessage: ""
    }),
    async mounted() {
        try {
            const id = this.$route.params.id;
            const [tdRes, dgRes, sachRes] = await Promise.all([
                TheoDoiMuonSachService.get(id),
                DocGiaService.getAll(),
                SachService.getAll()
            ]);

            this.docGiaList = dgRes.data || dgRes;
            this.sachList = sachRes.data || sachRes;

            this.td = {
                ...tdRes,
                MaDocGia: tdRes.MaDocGia || "",
                ChiTietMuon: tdRes.ChiTietMuon || [],
                NgayMuon: tdRes.NgayMuon?.slice(0, 10),
                HanTra: tdRes.HanTra?.slice(0, 10),
                TrangThai: tdRes.TrangThai || "Chờ duyệt"
            };
        } catch (err) {
            this.errorMessage = "Không thể tải dữ liệu phiếu mượn";
        }
    },
    methods: {
        async updateTheoDoi(payload) {
            try {
                await TheoDoiMuonSachService.update(this.$route.params.id, payload);
                this.$swal.fire("Thành công!", "Cập nhật thành công", "success");
                this.$router.push({ name: "theodoimuonsach.list" });
            } catch (err) {
                this.$swal.fire("Lỗi", err.response?.data?.message || "Cập nhật thất bại", "error");
            }
        }
    }
};
</script>