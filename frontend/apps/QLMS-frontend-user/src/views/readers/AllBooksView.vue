<template>
    <div class="all-books-page">
        <div class="container">
            <h1 class="page-title">
                {{ searchKeyword ? `Kết quả tìm kiếm: "${searchKeyword}"` : "Tất Cả Sách Trong Thư Viện" }}
            </h1>

            <div class="books-list" v-if="paginatedBooks.length">
                <BookCardHorizontal v-for="book in paginatedBooks" :key="book._id" :book="book"
                    @click="goToDetail(book)" />
            </div>

            <div v-else class="empty">
                <p v-if="bookStore.loading">Đang tải sách...</p>
                <p v-else-if="searchKeyword">Không tìm thấy sách nào phù hợp với "{{ searchKeyword }}"</p>
                <p v-else>Chưa có sách nào trong thư viện.</p>
            </div>

            <div class="pagination" v-if="totalPages > 1">
                <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
                    ‹ Trước
                </button>

                <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
                    :class="{ active: page === currentPage }" class="page-btn">
                    {{ page }}
                </button>

                <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">
                    Sau ›
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBookStore } from "@/stores/bookStore";
import BookCardHorizontal from "@/components/readers/BookCardHorizontal.vue";

const router = useRouter();
const route = useRoute();
const bookStore = useBookStore();

const searchKeyword = ref("");
const currentPage = ref(1);
const pageSize = 10;

const paginatedBooks = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return bookStore.books.slice(start, end);
});

const totalPages = computed(() => {
    return Math.ceil(bookStore.books.length / pageSize);
});

const visiblePages = computed(() => {
    const pages = [];
    const maxVisible = 7;
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages.value) {
        end = totalPages.value;
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
});

async function performSearch() {
    const q = searchKeyword.value.trim();
    if (q) {
        await bookStore.searchBooks(q);
    } else {
        await bookStore.fetchAvailableBooks();
    }
    currentPage.value = 1;
}

onMounted(async () => {
    searchKeyword.value = (route.query.q || "").toString();
    await performSearch();
});

watch(
    () => route.query.q,
    async (newQuery) => {
        searchKeyword.value = (newQuery || "").toString();
        await performSearch();
    }
);

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function goToDetail(book) {
    router.push(`/reader/books/${book._id}`);
}
</script>

<style scoped>
.all-books-page {
    background: #f5f0e6;
    min-height: 100vh;
    padding: 4rem 0;
}

.page-title {
    text-align: center;
    font-size: 2.6rem;
    font-weight: 900;
    color: #1e1b15;
    margin-bottom: 3rem;
}

.books-list {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
}

.empty {
    text-align: center;
    padding: 5rem;
    color: #64748b;
    font-size: 1.4rem;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.8rem;
    margin-top: 4rem;
    flex-wrap: wrap;
}

.page-btn {
    background: white;
    color: #1e1b15;
    border: 2px solid #1e293b;
    padding: 10px 16px;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 44px;
}

.page-btn:hover:not(:disabled) {
    background: #1e293b;
    color: white;
    transform: translateY(-2px);
}

.page-btn.active {
    background: #1e293b;
    color: white;
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
}
</style>