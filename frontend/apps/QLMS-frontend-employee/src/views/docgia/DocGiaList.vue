<template>
    <div class="container mt-4">
        <h2 class="mb-3">Danh sách Độc Giả</h2>

        <div class="d-flex gap-2 align-items-center mb-3">
            <router-link to="/docgia/add" class="btn btn-primary">
                Thêm Độc Giả
            </router-link>
        </div>
        <div class="mb-3">
            <InputSearch v-model="searchKeyword" @submit="onSearch" />
        </div>

        <table class="table table-striped table-hover docgia-table">
            <thead>
                <tr>
                    <th class="avatar-col">Ảnh Đại Diện</th>
                    <th>Mã Độc Giả</th>
                    <th>Họ Lót</th>
                    <th>Tên</th>
                    <th>Ngày Sinh</th>
                    <th>Phái</th>
                    <th>Địa Chỉ</th>
                    <th>Điện Thoại</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="dg in displayedList" :key="dg._id">
                    <td class="avatar-col">
                        <div class="list-avatar-wrapper">
                            <img v-if="dg.Avatar" :src="dg.Avatar" alt="Avatar" class="list-avatar-img" />
                            <div v-else class="list-avatar-default">{{ getInitial(dg) }}</div>
                        </div>
                    </td>
                    <td>{{ dg.MaDocGia || dg._id }}</td>
                    <td>{{ dg.HoLot }}</td>
                    <td>{{ dg.Ten }}</td>
                    <td>{{ formatDate(dg.NgaySinh) }}</td>
                    <td>{{ dg.Phai }}</td>
                    <td>{{ dg.DiaChi }}</td>
                    <td>{{ dg.DienThoai }}</td>
                    <td>
                        <router-link :to="{ name: 'docgia.edit', params: { id: dg._id } }"
                            class="btn btn-warning btn-sm me-2">
                            Sửa
                        </router-link>
                        <button v-if="!dg.hasBorrowed" class="btn btn-danger btn-sm" @click="deleteDocGia(dg._id)">
                            Xóa
                        </button>
                        <span v-else class="text-muted">Đang mượn sách</span>
                    </td>
                </tr>
                <tr v-if="displayedList.length === 0">
                    <td colspan="9" class="text-center">Không có dữ liệu.</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import DocGiaService from "@/services/docgia.service";
import Swal from "sweetalert2";

export default {
    name: "DocGiaList",
    components: {
        InputSearch,
    },
    data() {
        return {
            docGiaList: [],
            searchKeyword: "",
        };
    },
    computed: {
        displayedList() {
            const kw = String(this.searchKeyword || "").trim().toLowerCase();
            if (!kw) return this.docGiaList;

            return this.docGiaList.filter(dg => {
                const fields = [
                    dg.MaDocGia,
                    dg.HoLot,
                    dg.Ten,
                    dg.DiaChi,
                    dg.DienThoai,
                    dg._id,
                ];
                return fields.some(f => (f || "").toString().toLowerCase().includes(kw));
            });
        }
    },
    methods: {
        getInitial(docGia) {
            return (docGia.Ten || docGia.MaDocGia || "?").charAt(0).toUpperCase();
        },

        formatDate(value) {
            if (!value) return "—";
            const d = new Date(value);
            return isNaN(d.getTime()) ? value : d.toLocaleDateString("vi-VN");
        },

        async loadDocGia() {
            try {
                const res = await DocGiaService.getAll();
                this.docGiaList = res?.data ?? res ?? [];
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi tải dữ liệu!',
                    text: 'Không thể tải danh sách Độc Giả. Vui lòng kiểm tra Server!',
                });
                console.error(error);
            }
        },
        async deleteDocGia(id) {
            const result = await Swal.fire({
                title: 'Xác nhận xóa?',
                text: "Bạn có chắc muốn xóa Độc Giả này? Hành động này không thể hoàn tác!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Có, xóa!',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                try {
                    await DocGiaService.delete(id);
                    this.docGiaList = this.docGiaList.filter((dg) => dg._id !== id);
                    Swal.fire('Đã xóa!', 'Độc Giả đã được xóa thành công.', 'success');
                } catch (error) {
                    Swal.fire(
                        'Lỗi!',
                        error.response?.data?.message || 'Xóa thất bại. Vui lòng thử lại!',
                        'error'
                    );
                    console.error(error);
                }
            }
        },

        onSearch() {
            console.log("Tìm Độc Giả:", this.searchKeyword);
        },
    },
    mounted() {
        this.loadDocGia();
    },
};
</script>
<style scoped>
.docgia-table .avatar-col {
    width: 70px;
    text-align: center;
    padding: 8px 5px;
}

.list-avatar-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border: 1px solid #e0e0e0;
}

.list-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.list-avatar-default {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e6e6fa;
    color: #4b0082;
    font-size: 16px;
    font-weight: 600;
}

.docgia-table th,
.docgia-table td {
    vertical-align: middle;
}
</style>