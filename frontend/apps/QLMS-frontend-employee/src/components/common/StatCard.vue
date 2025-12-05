<template>
    <div class="col">
        <div class="card stat-card shadow-sm" :class="color">
            <div class="card-body">
                <p class="card-title">{{ title }}</p>
                <h3 class="card-value">{{ value }}</h3>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'StatCard',
    props: {
        title: {
            type: String,
            required: true,
        },
        value: {
            type: [Number, String],
            required: true,
            default: 0,
        },
        color: {
            type: String,
            default: 'bg-light',
        },
    },
};
</script>

<style scoped>
.stat-card {
    color: white;
    border: none;
    transition: transform 0.2s;
    min-height: 120px;
}

.stat-card:hover {
    transform: translateY(-5px);
}

.card-title {
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
    opacity: 0.8;
}

.card-value {
    font-weight: 700;
    font-size: 1.8rem;
}

.bg-primary {
    background-color: #007bff !important;
}

.bg-success {
    background-color: #28a745 !important;
}

.bg-danger {
    background-color: #dc3545 !important;
}

.bg-info {
    background-color: #17a2b8 !important;
}

.bg-warning {
    background-color: #ffc107 !important;
}

.bg-secondary {
    background-color: #6c757d !important;
}
</style>