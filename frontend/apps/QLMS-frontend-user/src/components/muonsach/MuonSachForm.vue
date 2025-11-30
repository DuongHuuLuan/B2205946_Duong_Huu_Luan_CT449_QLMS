<template>
    <div class="checkout-container">
        <h2 class="form-title">Xác nhận Mượn Sách</h2>

        <div v-if="loading" class="message loading">
            Đang tải thông tin sách...
        </div>
        <div v-else-if="!bookDetail" class="message error">
            Không tìm thấy thông tin sách hoặc Mã Sách không hợp lệ.
        </div>

        <form v-else @submit.prevent="confirmBorrow" class="checkout-form">
            <h3 class="book-title">{{ bookDetail.TenSach }}</h3>
            <p class="book-author">Tác giả: {{ bookDetail.TacGia }}</p>

            <div class="form-group">
                <label for="quantity">Số lượng mượn</label>
                <input id="quantity" type="number" v-model.number="quantity" min="1" :max="bookDetail.SoQuyen || 1"
                    class="form-control" />
                <p v-if="bookDetail.SoQuyen" class="quantity-info">Tổng số quyển: **{{ bookDetail.SoQuyen }}**
                    cuốn</p>
            </div>

            <div class="date-group">
                <div class="form-group date-input">
                    <label for="ngayMuon">Ngày Mượn</label>
                    <input id="ngayMuon" type="date" v-model="ngayMuon" :min="today" class="form-control" />
                </div>
                <div class="form-group date-input">
                    <label for="hanTra">Hạn Trả (Tối đa: {{ maxReturnDays }} ngày)</label>
                    <input id="hanTra" type="date" v-model="hanTra" :min="ngayMuon" :max="maxHanTra"
                        class="form-control" />
                </div>
            </div>

            <div class="summary">
                <span class="total-label">Tổng chi phí dự kiến:</span>
                <span class="total-amount">{{ totalCostFormatted }} VNĐ</span>
            </div>

            <button type="submit" :disabled="isSubmitting || quantity <= 0 || quantity > (bookDetail.SoQuyen ?? 0)"
                class="btn btn-confirm">
                {{ isSubmitting ? "Đang xác nhận..." : "Xác nhận Mượn" }}
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SachService from "@/services/sach.service";
import TheoDoiMuonSachService from "@/services/theodoimuonsach.service";
import moment from "moment";
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();

const bookDetail = ref(null);
const loading = ref(true);
const isSubmitting = ref(false);

const quantity = ref(1);
const today = moment().format('YYYY-MM-DD');
const maxReturnDays = 30;

const ngayMuon = ref(today);
const hanTra = ref(moment(today).add(7, 'days').format('YYYY-MM-DD'));

const maxHanTra = computed(() => {
    return moment(ngayMuon.value).add(maxReturnDays, 'days').format('YYYY-MM-DD');
});

watch(ngayMuon, (newNgayMuon) => {
    const newMaxHanTra = moment(newNgayMuon).add(maxReturnDays, 'days');
    if (moment(hanTra.value).isAfter(newMaxHanTra) || moment(hanTra.value).isBefore(moment(newNgayMuon))) {
        hanTra.value = moment(newNgayMuon).add(7, 'days').format('YYYY-MM-DD');
    }
});

const totalCostNumeric = computed(() => {
    const pricePerBook = bookDetail.value?.DonGia || bookDetail.value?.GiaSach || 5000;
    const numericPrice = Number(pricePerBook);
    if (!bookDetail.value) return 0;
    return numericPrice * quantity.value;
});

const totalCostFormatted = computed(() => {
    return totalCostNumeric.value.toLocaleString('vi-VN');
});


onMounted(async () => {
    try {
        const id = route.params.id;
        if (!id) throw new Error("Không có ID sách");
        console.log(id)
        const bookData = await SachService.getById(id);
        console.log("GET NGU")
        if (!bookData || bookData.SoQuyen === undefined) {
            console.warn("Dữ liệu sách thiếu trường SoQuyen!");
        }

        bookDetail.value = bookData;

        if (bookData && bookData.SoQuyen < quantity.value) {
            quantity.value = bookData.SoQuyen > 0 ? 1 : 0;
        }
    } catch (err) {
        console.error("Lỗi tải chi tiết sách:", err);
        Swal.fire('Lỗi', 'Không thể tải chi tiết sách.', 'error');
        bookDetail.value = null;
    } finally {
        loading.value = false;
    }
});

async function confirmBorrow() {
    console.log("1123123s")
    isSubmitting.value = true;
    try {
        if (quantity.value <= 0) {
            Swal.fire('Lỗi', 'Số lượng mượn không hợp lệ.', 'warning');
            return;
        }

        if (moment(hanTra.value).isBefore(moment(ngayMuon.value))) {
            Swal.fire('Lỗi', 'Hạn trả không thể trước ngày mượn.', 'warning');
            return;
        }
        if (moment(hanTra.value).isAfter(moment(ngayMuon.value).add(maxReturnDays, 'days'))) {
            Swal.fire('Lỗi', `Hạn trả không được vượt quá ${maxReturnDays} ngày.`, 'warning');
            return;
        }

        const data = {
            ChiTietMuon: [
                { MaSach: bookDetail.value.MaSach || bookDetail.value._id, SoLuong: quantity.value },
            ],
            NgayMuon: ngayMuon.value,
            HanTra: hanTra.value,

            TongTien: totalCostNumeric.value,
        };

        console.log("MUON SACHS")

        await TheoDoiMuonSachService.createByDocGia(data);

        await Swal.fire({
            title: 'Thành công!',
            text: 'Yêu cầu mượn sách đã được gửi đi. Vui lòng chờ nhân viên duyệt.',
            icon: 'success',
            confirmButtonText: 'Đóng'
        });

        router.push("/sach");

    } catch (error) {
        console.error("Lỗi xác nhận mượn:", error);
        Swal.fire('Thất bại', error.response?.data?.message || "Không thể xác nhận mượn sách! Vui lòng thử lại.", 'error');
    } finally {
        isSubmitting.value = false;
    }
}
</script>



<style scoped>
.checkout-container {
    padding: 24px;
    max-width: 600px;
    margin: 20px auto;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

.form-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
    border-bottom: 2px solid #ddd;
    padding-bottom: 8px;
    color: #333;
}

.message {
    text-align: center;
    padding: 40px 0;
    font-weight: 600;
}

.message.loading {
    color: #4f46e5;
}

.message.error {
    color: #ef4444;
}

.book-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
}

.book-author {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 16px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 4px;
}

.form-control {
    display: block;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    font-size: 16px;
}

.form-control:focus {
    border-color: #4f46e5;
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.quantity-info {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
}

.date-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.total-label {
    font-size: 18px;
    font-weight: bold;
}

.total-amount {
    font-size: 24px;
    color: #1e40af;
    font-weight: 800;
}

.btn-confirm {
    width: 100%;
    margin-top: 24px;
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    background-color: #1e293b;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
}

.btn-confirm:hover:not(:disabled) {
    background-color: #4338ca;
}

.btn-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>