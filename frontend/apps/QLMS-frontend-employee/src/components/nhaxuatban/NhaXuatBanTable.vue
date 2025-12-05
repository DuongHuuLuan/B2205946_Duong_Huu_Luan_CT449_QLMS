<template>
    <div>
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>Mã NXB</th>
                    <th>Tên Nhà Xuất Bản</th>
                    <th>Địa Chỉ</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="nxb in nxbList" :key="nxb._id">
                    <td>{{ nxb.MaNXB || nxb._id }}</td>

                    <td>{{ nxb.TenNXB }}</td>

                    <td>{{ nxb.DiaChi }}</td>

                    <td>
                        <router-link :to="{ name: 'nxb.edit', params: { id: nxb._id } }"
                            class="btn btn-warning btn-sm me-2">
                            Sửa
                        </router-link>

                        <button v-if="nxb.bookCount == 0" class="btn btn-danger btn-sm" @click="handleDelete(nxb._id)">
                            Xóa
                        </button>
                        <span v-else class="text-muted">Còn {{ nxb.bookCount }} sách</span>
                    </td>
                </tr>
                <tr v-if="nxbList.length === 0">
                    <td colspan="4" class="text-center">Không có dữ liệu.</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: "NhaXuatBanTable",
    props: {
        nxbList: {
            type: Array,
            required: true,
        },
    },
    emits: ["delete"],
    methods: {
        handleDelete(id) {
            this.$emit("delete", id);
        },
    },
};
</script>