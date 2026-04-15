<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { authStore } from '../store.js';

const { t } = useI18n();
const router = useRouter();
const errorMsg = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

const form = ref({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
});

const togglePassword = () => {
    showPassword.value = !showPassword.value;
};

const handleRegister = async () => {
    errorMsg.value = '';

    if (!form.value.firstName || !form.value.lastName || !form.value.phone ||
        !form.value.email    || !form.value.password) {
        errorMsg.value = t('auth.error_fill_all');
        return;
    }

    if (form.value.password.length < 6) {
        errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.';
        return;
    }

    if (form.value.password !== form.value.confirmPassword) {
        errorMsg.value = t('auth.error_mismatch');
        return;
    }

    isLoading.value = true;
    try {
        // Step 1: Register
        const signUpRes = await fetch('/api/v1/Authentication/sign-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username:  form.value.firstName, // Use firstName as username
                firstName: form.value.firstName,
                lastName:  form.value.lastName,
                phone:     form.value.phone,
                email:     form.value.email,
                password:  form.value.password
            })
        });

        if (!signUpRes.ok) {
            const errData = await signUpRes.json().catch(() => ({}));
            if (signUpRes.status === 409 || errData?.message?.toLowerCase().includes('exist')) {
                errorMsg.value = t('auth.error_email_taken');
            } else {
                errorMsg.value = errData.message || t('auth.error_generic');
            }
            return;
        }

        // Step 2: Auto sign-in
        const signInRes = await fetch('/api/v1/Authentication/sign-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usernameOrEmail: form.value.email, 
                password: form.value.password 
            })
        });

        if (!signInRes.ok) {
            // Succeeded registering but login failed - go to login page
            router.push('/login');
            return;
        }

        const { token } = await signInRes.json();

        // Step 3: Fetch full profile
        const profileRes = await fetch('/api/v1/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const userData = profileRes.ok ? await profileRes.json() : { username: form.value.firstName };
        authStore.login(userData, token);

        router.push('/');
    } catch (error) {
        console.error('Registration error:', error);
        errorMsg.value = t('auth.error_generic');
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="auth-page">
        <div class="auth-card">
            <div class="auth-header">
                <h2>Crea tu Cuenta</h2>
                <p class="subtitle">Únete a la familia Dulce Fe</p>
            </div>

            <div v-if="errorMsg" class="error-banner">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{{ errorMsg }}</span>
            </div>

            <form @submit.prevent="handleRegister">
                <div class="form-row">
                    <div class="form-group">
                        <label>{{ $t('auth.name') }}</label>
                        <input type="text" v-model="form.firstName" placeholder="Juan" required :disabled="isLoading">
                    </div>
                    <div class="form-group">
                        <label>{{ $t('auth.lastname') }}</label>
                        <input type="text" v-model="form.lastName" placeholder="Pérez" required :disabled="isLoading">
                    </div>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.phone') }}</label>
                    <input type="tel" v-model="form.phone" placeholder="999 999 999" required :disabled="isLoading">
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.email') }}</label>
                    <input type="email" v-model="form.email" placeholder="tucorreo@ejemplo.com" required :disabled="isLoading">
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.password') }}</label>
                    <div class="password-wrapper">
                        <input 
                            :type="showPassword ? 'text' : 'password'" 
                            v-model="form.password" 
                            placeholder="••••••••" 
                            required
                            :disabled="isLoading"
                        >
                        <button type="button" class="eye-btn" @click="togglePassword">
                            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.confirm_password') }}</label>
                    <input type="password" v-model="form.confirmPassword" placeholder="••••••••" required :disabled="isLoading">
                </div>

                <button type="submit" class="btn-primary full-width" :disabled="isLoading">
                    <span v-if="isLoading" class="loader"></span>
                    <span v-else>{{ $t('auth.register_btn') }}</span>
                </button>
            </form>

            <div class="auth-footer">
                <p>¿Ya tienes una cuenta? <RouterLink to="/login">Inicia sesión aquí</RouterLink></p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-page {
    min-height: 85vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 20px;
    background-color: var(--bg-color);
}

.auth-card {
    background: white;
    width: 100%;
    max-width: 480px;
    padding: 40px;
    border-radius: 28px;
    box-shadow: 0 15px 50px rgba(0,0,0,0.06);
}

.auth-header {
    text-align: center;
    margin-bottom: 35px;
}

h2 {
    font-family: var(--heading-font-family);
    color: var(--primary-color);
    font-size: 2.2rem;
    margin-bottom: 8px;
}

.subtitle {
    color: #888;
    font-size: 1rem;
}

.form-row {
    display: flex;
    gap: 15px;
}

.form-row .form-group {
    flex: 1;
}

.form-group {
    margin-bottom: 22px;
}

label {
    display: block;
    font-family: var(--body-font-family);
    font-weight: 600;
    font-size: 0.88rem;
    color: #444;
    margin-bottom: 8px;
}

input {
    width: 100%;
    padding: 14px 18px;
    border: 1.5px solid #eee;
    border-radius: 14px;
    font-family: var(--body-font-family);
    font-size: 1rem;
    transition: all 0.25s;
    outline: none;
}

input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(44, 85, 48, 0.06);
}

.password-wrapper {
    position: relative;
}

.eye-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #bbb;
    padding: 5px;
    display: flex;
}

.error-banner {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #dc2626;
    padding: 14px 18px;
    border-radius: 14px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.92rem;
}

.btn-primary.full-width {
    width: 100%;
    padding: 16px;
    border-radius: 14px;
    font-weight: 700;
    margin-top: 15px;
    font-size: 1.05rem;
}

.auth-footer {
    text-align: center;
    margin-top: 35px;
    font-size: 0.95rem;
    color: #777;
}

.auth-footer a {
    color: var(--accent-color);
    font-weight: 700;
    text-decoration: none;
}

.loader {
    width: 22px;
    height: 22px;
    border: 3px solid rgba(255,255,255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@media (max-width: 500px) {
    .form-row {
        flex-direction: column;
        gap: 0;
    }
}
</style>
