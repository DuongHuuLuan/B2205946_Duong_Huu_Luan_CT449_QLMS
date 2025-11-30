<template>
    <div class="home-wrapper">
        <section class="hero-section">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">
                    Chào mừng
                    <span class="user-name">{{ fullName }}</span>
                </h1>
                <p class="hero-subtitle">
                    Đắm mình vào thế giới sách, từ những câu chuyện cổ điển đến tri thức hiện đại, mọi lúc mọi nơi.
                </p>

                <div class="search-box">
                    <input type="text" placeholder="Tìm kiếm sách, tác giả,..." class="search-input"
                        v-model="searchQuery" @keyup.enter="performSearch" />
                    <button class="search-btn" @click="performSearch">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>

        <section class="featured-section">
            <div class="container">
                <h2 class="section-title">Sách Nổi Bật Trong Tuần</h2>
                <div class="underline"></div>

                <div class="book-carousel" v-if="featuredBooks.length">
                    <BookCardHorizontal v-for="book in featuredBooks" :key="book._id" :book="book"
                        @click="goToDetail(book)" />
                </div>
                <div v-else class="empty-state">
                    <p>Đang tải sách nổi bật...</p>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useBookStore } from "@/stores/bookStore";
import { useDocGiaStore } from "@/stores/docgiaStore";
import BookCardHorizontal from "@/components/readers/BookCardHorizontal.vue";

const router = useRouter();
const bookStore = useBookStore();
const docgiaStore = useDocGiaStore();

const searchQuery = ref("");
const featuredBooks = ref([]);

const fullName = computed(() => {
    if (!docgiaStore.profile) return "Độc Giả";
    const hoLot = (docgiaStore.profile.HoLot || "").trim();
    const ten = (docgiaStore.profile.Ten || "").trim();
    return hoLot && ten ? `${hoLot} ${ten}` : hoLot || ten || "Độc Giả";
});

onMounted(async () => {
    await bookStore.fetchAvailableBooks();
    featuredBooks.value = bookStore.books.slice(0, 10);
});

function goToDetail(book) {
    router.push(`/reader/books/${book._id}`);
}


function performSearch() {
    const q = searchQuery.value.trim();
    if (!q) return;

    router.push({
        name: "reader.all-books",
        query: { q }
    });

    searchQuery.value = "";
}
</script>

<style scoped>
.home-wrapper {
    min-height: 100vh;
    background: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.hero-section {
    position: relative;
    height: 90vh;
    min-height: 620px;
    background: url('https://inuvdp.com/wp-content/uploads/2024/04/background-ke-sach-4.jpg') center/cover no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
}

.hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.55) 100%);
}

.hero-content {
    position: relative;
    z-index: 2;
    max-width: 1000px;
    padding: 2rem;
}

.hero-title {
    font-size: 3.2rem;
    font-weight: 900;
    margin: 0 0 1rem 0;
    line-height: 1.1;
}

.user-name {
    display: block;
    font-size: 3.2rem;
    background: #ffffff;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-top: 0.5rem;
}

.hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.95;
    margin-bottom: 3.5rem;
    line-height: 1.7;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.search-box {
    max-width: 720px;
    margin: 0 auto;
    position: relative;
    border-radius: 50px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.search-input {
    width: 100%;
    padding: 1.3rem 2rem 1.3rem 2.5rem;
    font-size: 1.2rem;
    border: none;
    outline: none;
    background: white;
}

.search-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: #1f2937;
    color: white;
    border: none;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
}

.search-btn:hover {
    background: #6d28d9;
    transform: translateY(-50%) scale(1.08);
}

.search-btn svg {
    width: 28px;
    height: 28px;
}

.featured-section {
    padding: 6rem 0;
    background: #ffffff;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-title {
    text-align: center;
    font-size: 2.6rem;
    font-weight: 900;
    color: #1e293b;
    margin-bottom: 1rem;
}

.underline {
    width: 140px;
    height: 6px;
    background: #1f2937;
    margin: 0 auto 4.5rem;
    border-radius: 4px;
}

.book-carousel {
    display: flex;
    gap: 2rem;
    overflow-x: auto;
    padding: 2rem 0 4rem;
    scrollbar-width: thin;
}

.empty-state {
    text-align: center;
    padding: 5rem 2rem;
    color: #64748b;
    font-size: 1.3rem;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.6rem;
    }

    .user-name {
        font-size: 2.8rem;
    }
}
</style>