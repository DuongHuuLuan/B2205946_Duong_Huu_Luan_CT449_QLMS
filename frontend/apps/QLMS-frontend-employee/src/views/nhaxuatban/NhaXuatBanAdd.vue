<template>
    <div class="container mt-4">
        <h2 class="mb-3">Thêm Nhà Xuất bản</h2>
        <NhaXuatBanForm :nxb="{}" @submit:nxb="addNXB" />
    </div>
</template>

<script>
import NhaXuatBanForm from '@/components/nhaxuatban/NhaXuatBanForm.vue';
import nhaxuatbanService from '@/services/nhaxuatban.service';
import Swal from "sweetalert2";

export default {
    name: "NhaXuatBanAdd",
    components: { NhaXuatBanForm },
    methods: {
        async addNXB(nxb) {
            try {
                const res = await nhaxuatbanService.create(nxb);
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Thêm mới Nhà Xuất Bản thành công.',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    this.$router.push({ name: "nxb.list" });
                });

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể thêm mới. Vui lòng kiểm tra dữ liệu và thử lại.',
                });
                console.error(error);
            }
        },
    },
};
</script>