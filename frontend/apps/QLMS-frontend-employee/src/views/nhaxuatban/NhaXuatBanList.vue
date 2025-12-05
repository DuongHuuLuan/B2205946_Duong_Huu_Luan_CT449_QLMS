<template>
    <div class="container mt-4">
        <h2 class="mb-3">Danh sách Nhà Xuất Bản</h2>

        <div class="d-flex gap-2 align-items-center mb-3">
            <router-link to="/nhaxuatban/add" class="btn btn-primary">
                Thêm Nhà Xuất Bản
            </router-link>
        </div>
        <div class="mb-3">
            <InputSearch v-model="searchKeyword" @submit="onSearch" />
        </div>

        <NhaXuatBanTable :nxbList="displayedList" @delete="deleteNXB" />

        <p v-if="displayedList.length === 0" class="mt-3 text-center text-muted">Không có Nhà Xuất Bản nào.</p>
    </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import NhaXuatBanService from "@/services/nhaxuatban.service";
import NhaXuatBanTable from "@/components/nhaxuatban/NhaXuatBanTable.vue";
import Swal from "sweetalert2";

export default {
    name: "NhaXuatBanList",
    components: { NhaXuatBanTable, InputSearch },
    data() {
        return {
            nxbList: [],
            searchKeyword: "",
        };
    },
    computed: {
        displayedList() {
            const kw = String(this.searchKeyword || "").trim().toLowerCase();
            if (!kw) return this.nxbList;

            return this.nxbList.filter((nxb) => {
                const fields = [
                    nxb.TenNXB,
                    nxb.MaNXB,
                    nxb.DiaChi,
                    nxb._id,
                ];
                return fields.some((f) => (f || "").toString().toLowerCase().includes(kw));
            });
        }
    },
    methods: {
        async loadNXB() {
            try {
                const data = await NhaXuatBanService.getAll();
                this.nxbList = data?.data ?? data ?? [];
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi tải dữ liệu!',
                    text: 'Không thể tải danh sách Nhà Xuất Bản. Vui lòng kiểm tra Server!',
                });
                console.error(error);
            }
        },

        async deleteNXB(id) {
            const result = await Swal.fire({
                title: 'Xác nhận xóa?',
                text: "Bạn có chắc muốn xóa Nhà Xuất Bản này? Hành động này không thể hoàn tác!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Có, xóa!',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                try {
                    await NhaXuatBanService.delete(id);
                    this.nxbList = this.nxbList.filter((nxb) => nxb._id !== id);
                    Swal.fire(
                        'Đã xóa!',
                        'Nhà Xuất Bản đã được xóa thành công.',
                        'success'
                    );
                } catch (error) {
                    Swal.fire(
                        'Lỗi!',
                        error.response?.data?.message || 'Xóa thất bại. Vui lòng thử lại.',
                        'error'
                    );
                    console.error(error);
                }
            }
        },

        onSearch() {
            console.log("Tìm Nhà Xuất Bản:", this.searchKeyword);
        },
    },
    mounted() {
        this.loadNXB();
    },
};
</script>
