<template>
    <div class="thongke-container p-4">
        <h2 class="mb-4 text-center text-primary">THỐNG KÊ MƯỢN SÁCH</h2>

        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-3 mb-5">
            <StatCard title="Tổng số Sách" :value="generalStats.totalBooks" color="bg-primary" />
            <StatCard title="Tổng Độc giả" :value="generalStats.totalReaders" color="bg-success" />
            <StatCard title="Đang Mượn" :value="generalStats.currentlyBorrowed" color="bg-danger" />
            <StatCard title="Tổng Lượt Mượn" :value="generalStats.totalBorrows" color="bg-info" />
            <StatCard title="Tổng Nhân Viên" :value="generalStats.totalStaff" color="bg-warning" />
            <StatCard title="Tổng NXB" :value="generalStats.totalPublishers" color="bg-secondary" />
        </div>

        <div class="row mt-4">
            <div class="col-12">
                <div class="card shadow-sm p-3">
                    <h5 class="card-title text-center mb-4">Top Sách Được Mượn Nhiều Nhất</h5>

                    <div v-if="topBorrowedBooks && topBorrowedBooks.length">
                        <table class="table table-hover table-striped">
                            <thead>
                                <tr>
                                    <th scope="col" style="width: 5%">#</th>
                                    <th scope="col" style="width: 15%">Mã Sách</th>
                                    <th scope="col">Tên Sách</th>
                                    <th scope="col" style="width: 15%" class="text-center">Số Lượt Mượn</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(book, index) in topBorrowedBooks" :key="book.MaSach">
                                    <th scope="row">{{ index + 1 }}</th>
                                    <td>{{ book.MaSach }}</td>
                                    <td>{{ book.TenSach }}</td>
                                    <td class="text-center">{{ book.SoLuotMuon }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p v-else-if="!isLoading" class="text-center text-muted p-5">
                        Không có dữ liệu mượn sách nào được ghi nhận.
                    </p>
                </div>
            </div>
        </div>
        <div v-if="isLoading" class="text-center mt-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="text-primary mt-2">Đang tải dữ liệu thống kê...</p>
        </div>
    </div>
</template>

<script>
import ThongKeService from '@/services/thongke.service';
import StatCard from '@/components/common/StatCard.vue';
import { Bar, Pie } from 'vue-chartjs';

export default {
    components: { StatCard, Bar, Pie },
    data() {
        return {
            isLoading: false,
            generalStats: {
                totalBooks: 0,
                totalReaders: 0,
                currentlyBorrowed: 0,
                totalBorrows: 0,
                totalStaff: 0,
                totalPublishers: 0,
            },
            publisherStats: [],
            staffStats: [],
            publisherChartData: null,
            staffChartData: null,
            topBorrowedBooks: [],
        };
    },
    methods: {
        async fetchStats() {
            this.isLoading = true;
            try {
                this.generalStats = await ThongKeService.getGeneralStats();
                this.publisherStats = await ThongKeService.getBooksByPublisher();
                this.staffStats = await ThongKeService.getStaffByRole();
                this.topBorrowedBooks = await ThongKeService.getTopBorrowedBooks();
                if (this.publisherStats.length) this.processPublisherData();
                if (this.staffStats.length) this.processStaffData();

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thống kê:", error);
            } finally {
                this.isLoading = false;
            }
        },

        processPublisherData() {
            const labels = this.publisherStats.map(item => item.TenNXB);
            const data = this.publisherStats.map(item => item.count);


            this.publisherChartData = {
                labels: labels,
                datasets: [{
                    label: 'Số lượng Sách',
                    backgroundColor: '#007bff',
                    data: data
                }]
            };
        },
        processStaffData() {
            const labels = this.staffStats.map(item => item.ChucVu);
            const data = this.staffStats.map(item => item.count);

            this.staffChartData = {
                labels: labels,
                datasets: [{
                    backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545'],
                    data: data
                }]
            };
        }
    },
    mounted() {
        this.fetchStats();
    }
};
</script>

<style scoped>
.thongke-container {
    max-width: 1200px;
    margin: auto;
}

.card {
    min-height: 250px;
}
</style>
