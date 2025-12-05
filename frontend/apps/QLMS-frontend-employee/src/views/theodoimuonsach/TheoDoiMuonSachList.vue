<template>
    <div class="container mt-4">
        <h2 class="mb-3">Danh sách Theo Dõi Mượn Sách</h2>

        <router-link to="/theodoimuonsach/add" class="btn btn-primary mb-3">
            Thêm Theo Dõi
        </router-link>

        <div class="mb-3">
            <InputSearch v-model="searchKeyword" @submit="onSearch" />
        </div>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>Mã Độc Giả</th>
                    <th>Sách Mượn</th>
                    <th>Ngày Mượn</th>
                    <th>Ngày Trả</th>
                    <th>Trạng Thái</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="td in displayedList" :key="td._id">
                    <td>{{ td.MaDocGia }}</td>

                    <td>
                        <ul v-if="td.ChiTietMuon && td.ChiTietMuon.length" class="list-unstyled mb-0">
                            <li v-for="(item, index) in td.ChiTietMuon" :key="index">
                                {{ getSachInfo(item.MaSach) }}
                            </li>
                        </ul>
                        <span v-else>N/A</span>
                    </td>
                    <td>{{ formatDate(td.NgayMuon) }}</td>
                    <td>{{ td.NgayTra ? formatDate(td.NgayTra) : "Chưa trả" }}</td>
                    <td>
                        <span :class="statusClass(td.TrangThai)">
                            {{ td.TrangThai }}
                        </span>
                    </td>

                    <td>
                        <button v-if="td.TrangThai === 'Chờ duyệt'" class="btn btn-sm btn-success me-2"
                            @click="updateStatus(td._id, 'Đang mượn')">
                            Duyệt
                        </button>

                        <button v-if="td.TrangThai === 'Đang mượn' || td.TrangThai === 'Trễ hạn'"
                            class="btn btn-sm btn-info me-2" @click="updateStatus(td._id, 'Đã trả')">
                            Trả sách
                        </button>

                        <router-link :to="{ name: 'theodoimuonsach.edit', params: { id: td._id } }"
                            class="btn btn-warning btn-sm me-2">
                            Sửa
                        </router-link>
                        <button class="btn btn-danger btn-sm" @click="deleteTheoDoi(td._id)">Xóa</button>
                    </td>
                </tr>
                <tr v-if="displayedList.length === 0">
                    <td colspan="6" class="text-center">Không có dữ liệu.</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import TheoDoiMuonSachService from "@/services/theodoimuonsach.service";
import { useAuthStore } from "@/stores/authStore";
import Swal from "sweetalert2";

export default {
    name: "TheoDoiMuonSachList",
    components: {
        InputSearch,
    },
    data() {
        return {
            tdList: [],
            errorMessage: "",
            searchKeyword: ""
        };
    },

    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },

    computed: {
        displayedList() {
            const kw = String(this.searchKeyword || "").trim().toLowerCase();
            if (!kw) return this.tdList;

            return this.tdList.filter(td => {
                if ((td.MaDocGia || "").toString().toLowerCase().includes(kw)) return true;

                if (Array.isArray(td.ChiTietMuon)) {
                    for (const it of td.ChiTietMuon) {
                        if ((it.MaSach || "").toString().toLowerCase().includes(kw)) return true;
                    }
                }
                return false;
            });
        }
    },

    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString("vi-VN");
        },

        getSachInfo(maSach) {
            return maSach;
        },

        statusClass(status) {
            switch (status) {
                case "Chờ duyệt":
                    return "badge bg-warning text-dark";
                case "Đang mượn":
                    return "badge bg-primary";
                case "Đã trả":
                    return "badge bg-success";
                case "Trễ hạn":
                    return "badge bg-danger";
                default:
                    return "badge bg-secondary";
            }
        },

        async loadData() {
            try {
                this.tdList = await TheoDoiMuonSachService.getAll();
            } catch (error) {
                this.errorMessage = "Không thể tải dữ liệu.";
                Swal.fire("Lỗi", "Không thể tải dữ liệu.", "error");
                console.error(error);
            }
        },

        async deleteTheoDoi(id) {
            const result = await Swal.fire({
                title: "Xác nhận",
                text: "Bạn có chắc muốn xóa bản ghi này?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Có, xóa",
                cancelButtonText: "Hủy",
            });

            if (result.isConfirmed) {
                try {
                    await TheoDoiMuonSachService.delete(id);
                    this.tdList = this.tdList.filter((td) => td._id !== id);
                    Swal.fire("Đã xóa!", "Bản ghi đã được xóa.", "success");
                } catch (error) {
                    this.errorMessage = "Xóa thất bại.";
                    Swal.fire("Lỗi", "Không thể xóa bản ghi.", "error");
                    console.error(error);
                }
            }
        },

        async updateStatus(id, newStatus) {
            try {
                const payload = {
                    TrangThai: newStatus,
                    MSNV: this.authStore.getMSNV
                };

                if (!payload.MSNV) {
                    throw new Error("Không thể xác định Mã Số Nhân Viên (MSNV).");
                }

                await TheoDoiMuonSachService.update(id, payload);
                await this.loadData();
                Swal.fire("Thành công", `Cập nhật trạng thái thành "${newStatus}"`, "success");
            } catch (error) {
                Swal.fire("Lỗi", "Không thể cập nhật trạng thái.", "error");
                console.error(error);
            }
        },

        onSearch() {
            console.log("Đang tìm:", this.searchKeyword);
        },
    },

    mounted() {
        this.loadData();
    },
};
</script>
