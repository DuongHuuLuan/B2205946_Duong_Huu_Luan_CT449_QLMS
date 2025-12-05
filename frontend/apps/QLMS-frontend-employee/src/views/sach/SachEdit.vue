<script>
import SachForm from "@/components/sach/SachForm.vue";
import SachService from "@/services/sach.service";
import NxbService from "@/services/nhaxuatban.service";
import Swal from "sweetalert2";

export default {
    components: { SachForm },
    data() {
        return { sach: null, nxbList: [] };
    },
    methods: {
        async loadData() {
            const [resNxb, resSach] = await Promise.all([
                NxbService.getAll(),
                SachService.get(this.$route.params.id)
            ]);
            this.nxbList = resNxb.data || resNxb;
            const data = resSach.data || resSach;
            this.sach = data;
        },
        async updateSach(data) {
            await SachService.updateWithCover(this.$route.params.id, data, null);
            Swal.fire("Thành công!", "Cập nhật thành công", "success");
            this.$router.push({ name: "sach.list" });
        },
        async updateSachWithCover({ sach, file }) {
            await SachService.updateWithCover(this.$route.params.id, sach, file);
            Swal.fire("Thành công!", "Cập nhật bìa sách thành công", "success");
            this.$router.push({ name: "sach.list" });
        }
    },
    mounted() {
        this.loadData();
    }
};
</script>

<template>
    <div class="container mt-4">
        <h2>Cập Nhật Sách</h2>
        <SachForm v-if="sach" :sach="sach" :nxbList="nxbList" @submit:sach="updateSach"
            @submit:sach-with-file="updateSachWithCover" />
    </div>
</template>