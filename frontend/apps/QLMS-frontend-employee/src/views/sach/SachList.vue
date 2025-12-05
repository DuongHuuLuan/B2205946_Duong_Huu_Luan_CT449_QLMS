<template>
    <div class="container mt-4">
        <h2 class="mb-3">Danh sách Sách</h2>

        <router-link to="/sach/add" class="btn btn-primary mb-3">
            Thêm Sách
        </router-link>

        <InputSearch v-model="searchKeyword" @submit="onSearch" class="mb-3" />

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <table class="table table-striped table-hover sach-table">
            <thead>
                <tr>
                    <th class="cover-col">Bìa Sách</th>
                    <th>Mã Sách</th>
                    <th>Tên Sách</th>
                    <th>Đơn Giá</th>
                    <th>Số Quyển</th>
                    <th>Năm XB</th>
                    <th>Mã NXB</th>
                    <th>Tác Giả</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="sach in displayedList" :key="sach._id">
                    <td class="cover-col">
                        <div class="list-cover-wrapper">
                            <img v-if="sach.BiaSach" :src="sach.BiaSach" :alt="sach.TenSach" class="list-cover-img" />
                            <div v-else class="list-cover-default">Ảnh</div>
                        </div>
                    </td>
                    <td>{{ sach.MaSach || sach._id }}</td>
                    <td>{{ sach.TenSach }}</td>
                    <td>{{ formatPrice(sach.DonGia) }}</td>
                    <td>{{ sach.SoQuyen }}</td>
                    <td>{{ sach.NamXuatBan }}</td>
                    <td>{{ sach.MaNXB }}</td>
                    <td>{{ sach.TacGia || sach.NguonGoc }}</td>
                    <td>
                        <router-link :to="{ name: 'sach.edit', params: { id: sach._id } }"
                            class="btn btn-warning btn-sm me-2">
                            Sửa
                        </router-link>
                        <button v-if="!sach.isBorrowed" class="btn btn-danger btn-sm" @click="deleteSach(sach._id)">
                            Xóa
                        </button>
                        <span v-else class="text-muted">Đang được mượn</span>
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
import SachService from "@/services/sach.service";
import Swal from "sweetalert2";

export default {
    name: "SachList",
    components: {
        InputSearch,
    },
    data() {
        return {
            sachList: [],
            errorMessage: "",
            searchKeyword: "",
        };
    },
    computed: {
        displayedList() {
            const kw = String(this.searchKeyword || "").trim().toLowerCase();
            if (!kw) return this.sachList;

            return this.sachList.filter((s) => {
                const fields = [
                    s.MaSach,
                    s.TenSach,
                    s.TacGia,
                    s.NguonGoc,
                    s.MaNXB,
                    s._id,
                ];
                return fields.some((f) => (f || "").toString().toLowerCase().includes(kw));
            });
        },
    },
    methods: {
        formatPrice(v) {
            if (v === null || v === undefined || v === "") return "-";
            const n = Number(String(v).replace(/\D/g, ""));
            if (Number.isNaN(n)) return v;
            return n.toLocaleString("vi-VN") + " ₫";
        },

        async loadSach() {
            try {
                const res = await SachService.getAll();
                this.sachList = res?.data ?? res ?? [];
            } catch (error) {
                this.errorMessage = "Không thể tải danh sách Sách.";
                console.error(error);
            }
        },

        async deleteSach(id) {
            const confirm = await Swal.fire({
                title: "Bạn có chắc muốn xóa?",
                text: "Dữ liệu sẽ bị mất vĩnh viễn!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
            });

            if (confirm.isConfirmed) {
                try {
                    const res = await SachService.delete(id);
                    const message = res?.data?.message || res?.message || "Xóa thành công";
                    this.sachList = this.sachList.filter((s) => s._id !== id);
                    Swal.fire("Thành công", message, "success");
                } catch (error) {
                    const errMsg = error.response?.data?.message || "Xóa thất bại.";
                    Swal.fire("Lỗi", errMsg, "error");
                    console.error(error);
                }
            }
        },

        onSearch() {
            console.log("Tìm kiếm:", this.searchKeyword);
        },
    },
    mounted() {
        this.loadSach();
    },
};
</script>

<style scoped>
.sach-table .cover-col {
    width: 80px;
    text-align: center;
    padding: 8px 5px;
}

.list-cover-wrapper {
    width: 50px;
    height: 75px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border: 1px solid #ddd;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.list-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.list-cover-default {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    color: #888;
    font-size: 10px;
    font-weight: 500;
    text-align: center;
}

.sach-table th,
.sach-table td {
    vertical-align: middle;
}
</style>