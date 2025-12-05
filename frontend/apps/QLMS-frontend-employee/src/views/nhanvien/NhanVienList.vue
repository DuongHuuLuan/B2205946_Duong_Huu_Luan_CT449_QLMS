<template>
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-12">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3 class="fw-bold text-primary">Danh sách Nhân Viên</h3>
                    <div class="d-flex gap-2 align-items-center">
                        <RouterLink :to="{ name: 'nhanvien.add' }" class="btn btn-success">
                            <i class="fas fa-plus"></i> Thêm mới
                        </RouterLink>
                    </div>
                </div>
                <div class="mb-3">
                    <InputSearch v-model="searchKeyword" @submit="onSearch" />
                </div>

                <table class="table table-hover table-striped nhanvien-table">
                    <thead>
                        <tr>
                            <th class="avatar-col">Avatar</th>
                            <th>MSNV</th>
                            <th>Họ Tên</th>
                            <th>Chức Vụ</th>
                            <th>Địa Chỉ</th>
                            <th>Số Điện Thoại</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="nv in displayedList" :key="nv._id">
                            <td class="avatar-col">
                                <div class="list-avatar-wrapper">
                                    <img v-if="nv.Avatar" :src="nv.Avatar" :alt="nv.HoTenNV" class="list-avatar-img" />
                                    <div v-else class="list-avatar-default">{{ getInitial(nv) }}</div>
                                </div>
                            </td>
                            <td>{{ nv.MSNV }}</td>
                            <td>{{ nv.HoTenNV }}</td>
                            <td>{{ nv.ChucVu }}</td>
                            <td>{{ nv.DiaChi }}</td>
                            <td>{{ nv.SoDienThoai }}</td>
                            <td>
                                <RouterLink :to="{ name: 'nhanvien.edit', params: { id: nv._id } }"
                                    class="btn btn-warning btn-sm me-2">
                                    <i class="fas fa-edit"></i>
                                </RouterLink>
                                <button @click="deleteNhanVien(nv._id)" class="btn btn-danger btn-sm">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>

                        <tr v-if="displayedList.length === 0">
                            <td colspan="7" class="text-center text-muted">Không có nhân viên nào.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import NhanVienService from "@/services/nhanvien.service";
import Swal from "sweetalert2";

export default {
    name: "NhanVienList",
    components: {
        InputSearch,
    },
    data() {
        return {
            nhanVienList: [],
            searchKeyword: "",
        };
    },
    computed: {
        displayedList() {
            const kw = String(this.searchKeyword || "").trim().toLowerCase();
            if (!kw) return this.nhanVienList;

            return this.nhanVienList.filter(nv => {
                const fields = [
                    nv.MSNV,
                    nv.HoTenNV,
                    nv.ChucVu,
                    nv.DiaChi,
                    nv.SoDienThoai,
                    nv._id,
                ];
                return fields.some(f => (f || "").toString().toLowerCase().includes(kw));
            });
        }
    },
    methods: {
        getInitial(nhanVien) {
            return (nhanVien.HoTenNV || nhanVien.MSNV || "?").charAt(0).toUpperCase();
        },

        async loadNhanVien() {
            try {
                const res = await NhanVienService.getAll();
                this.nhanVienList = res?.data ?? res ?? [];
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể tải danh sách nhân viên.',
                });
                console.error(error);
            }
        },

        async deleteNhanVien(id) {
            const result = await Swal.fire({
                title: 'Xác nhận xóa?',
                text: "Bạn có chắc muốn xóa nhân viên này? Hành động này không thể hoàn tác!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Có, xóa!',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                try {
                    await NhanVienService.delete(id);
                    this.nhanVienList = this.nhanVienList.filter((nv) => nv._id !== id);
                    Swal.fire('Đã xóa!', 'Nhân viên đã được xóa thành công.', 'success');
                } catch (error) {
                    Swal.fire('Lỗi!', 'Xóa thất bại. Vui lòng thử lại!', 'error');
                    console.error(error);
                }
            }
        },

        onSearch() {
            console.log("Tìm nhân viên:", this.searchKeyword);
        },
    },
    created() {
        this.loadNhanVien();
    },
};
</script>
<style scoped>
.nhanvien-table .avatar-col {
    width: 60px;
    text-align: center;
}

.list-avatar-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border: 3px solid #0d6efd;
    box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
}

.list-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.list-avatar-default {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0d6efd, #0b5ed7);
    color: white;
    font-weight: 700;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-success,
.btn-warning {
    background-color: #0d6efd !important;
    border-color: #0d6efd !important;
}

.btn-success:hover {
    background-color: #0b5ed7 !important;
}

.btn-warning {
    background-color: #ffc107 !important;
    border-color: #ffc107 !important;
}

.text-primary {
    color: #0d6efd !important;
}
</style>
