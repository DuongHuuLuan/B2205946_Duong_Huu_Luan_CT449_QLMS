<template>
    <div class="container mt-4">
        <h2 class="mb-3">Cập Nhật Nhà Xuất Bản</h2>
        <NhaXuatBanForm v-if="nxb" :nxb="nxb" @submit:nxb="updateNXB" />
        <p v-else>Đang tải dữ liệu...</p>
    </div>
</template>

<script>
import NhaXuatBanForm from '@/components/nhaxuatban/NhaXuatBanForm.vue';
import NhaXuatBanService from '@/services/nhaxuatban.service';
import Swal from "sweetalert2";

export default {
    name: "NhaXuatBanEdit",
    components: { NhaXuatBanForm },
    data() {
        return {
            nxb: null,
        };
    },
    methods: {
        async loadNXB() {
            try {
                const id = this.$route.params.id;
                this.nxb = await NhaXuatBanService.get(id);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể tải dữ liệu Nhà Xuất Bản.',
                });
                console.error(error);
            }
        },
        async updateNXB(updatedNXB) {
            try {
                await NhaXuatBanService.update(this.$route.params.id, updatedNXB);

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Cập nhật Nhà Xuất Bản thành công.',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    this.$router.push({ name: "nxb.list" });
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Cập nhật thất bại. Vui lòng thử lại!',
                });
                console.error(error);
            }
        },
    },
    mounted() {
        this.loadNXB();
    }
};
</script>