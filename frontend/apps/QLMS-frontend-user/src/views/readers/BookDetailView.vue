<template>
    <div class="detail-page">
        <div class="back-link">
            <button @click="goBack" class="back-btn">
                ← Quay lại
            </button>
        </div>

        <div class="detail-card" v-if="book">
            <div class="book-cover-large">
                <img :src="book.BiaSach || fallbackCover" :alt="book.TenSach" class="cover-img" />
            </div>

            <div class="book-info">
                <h1 class="book-title">{{ book.TenSach }}</h1>

                <div class="info-group">
                    <strong>Mã sách:</strong> <span>{{ book.MaSach || '—' }}</span>
                </div>
                <div class="info-group">
                    <strong>Tác giả:</strong> <span>{{ book.TacGia || '—' }}</span>
                </div>

                <div class="price-stock">
                    <div class="price">
                        <span class="currency">₫</span>
                        <strong>{{ formatPrice(book.DonGia) }}</strong>
                    </div>
                    <div class="stock" :class="{ 'in-stock': stock > 0, 'out-stock': stock === 0 }">
                        <span v-if="stock > 0">Số quyển còn: {{ stock }}</span>
                        <span v-else>Hết sách</span>
                    </div>
                </div>

                <button class="borrow-btn" :disabled="stock === 0" @click="borrowBook">
                    <span v-if="stock > 0">Yêu cầu mượn sách</span>
                    <span v-else>Hết sách</span>
                </button>
            </div>
        </div>

        <div v-else class="empty-state">
            <p>Đang tải chi tiết sách...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBookStore } from "@/stores/bookStore";

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();

const book = ref(null);
const fallbackCover = "https://via.placeholder.com/300x450.png?text=No+Cover";

onMounted(async () => {
    const id = route.params.id;
    await bookStore.fetchAvailableBooks();
    book.value = bookStore.books.find(b => b._id === id || b.MaSach === id);
});

const stock = computed(() => {
    return book.value?.SoQuyenCon ?? book.value?.SoQuyen ?? 0;
});

function formatPrice(price) {
    if (!price) return "0";
    return Number(price).toLocaleString("vi-VN");
}

function goBack() {
    router.go(-1);
}

async function borrowBook() {
    if (stock.value === 0) return;

    console.log(book.value._id)
    router.push({
        name: 'reader.checkout-book',
        params: { id: book.value._id }
    });
}
</script>

<style scoped>
.detail-page {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.back-link {
    margin-bottom: 1.5rem;
}

.back-btn {
    background: none;
    border: none;
    color: #4b5563;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.2s;
}

.back-btn:hover {
    color: #1f2937;
}

.detail-card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 3rem;
    align-items: start;
}

.book-cover-large {
    text-align: center;
}

.cover-img {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    object-fit: cover;
}

.book-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.book-title {
    font-size: 2.2rem;
    font-weight: 800;
    color: #1f2937;
    margin: 0;
    line-height: 1.2;
}

.info-group {
    font-size: 1.05rem;
    color: #4b5563;
}

.info-group strong {
    color: #111827;
    margin-right: 0.5rem;
}

.price-stock {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin: 1.5rem 0;
    padding: 1rem 0;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
}

.price {
    font-size: 2rem;
    font-weight: 800;
    color: #1e40af;
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
}

.price .currency {
    font-size: 1.4rem;
    font-weight: 600;
}

.stock {
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.95rem;
}

.in-stock {
    background: #ecfdf5;
    color: #065f46;
}

.out-stock {
    background: #fee2e2;
    color: #991b1b;
}

.borrow-btn {
    margin-top: 1.5rem;
    background: #1e293b;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.borrow-btn:hover:not(:disabled) {
    background: #334155;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(30, 41, 59, 0.2);
}

.borrow-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #6b7280;
    font-size: 1.1rem;
}

@media (max-width: 768px) {
    .detail-card {
        grid-template-columns: 1fr;
        text-align: center;
        padding: 2rem;
        gap: 2rem;
    }

    .book-title {
        font-size: 1.8rem;
    }

    .price-stock {
        flex-direction: column;
        gap: 1rem;
        align-items: center;
    }
}
</style>