<template>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <RegisterForm />
            </div>
        </div>
    </div>
</template>

<script>
import RegisterForm from '@/components/auth/RegisterForm.vue';

export default {
    name: "Register",
    components: { RegisterForm },
};
</script>