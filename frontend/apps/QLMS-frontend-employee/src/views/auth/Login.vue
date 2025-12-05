<template>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <LoginForm />
            </div>
        </div>
    </div>
</template>

<script>
import LoginForm from "@/components/auth/LoginForm.vue";

export default {
    name: "login",
    components: { LoginForm },
};
</script>
