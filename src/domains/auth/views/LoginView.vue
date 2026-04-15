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
    identifier: '',
    password: ''
});

const togglePassword = () => {
    showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
    errorMsg.value = '';
    if (!form.value.identifier || !form.value.password) {
        errorMsg.value = t('auth.error_fill_all');
        return;
    }

    isLoading.value = true;
    try {
        console.log('[DEBUG] Attempting login for:', form.value.identifier);
        
        const res = await fetch('/api/v1/Authentication/sign-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usernameOrEmail: form.value.identifier.trim(), 
                password: form.value.password 
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('[DEBUG] Login failed with status:', res.status, errorData);
            
            if (res.status === 401) {
                errorMsg.value = t('auth.error_credentials');
            } else {
                errorMsg.value = errorData.message || 'Error del servidor al intentar entrar.';
            }
            return;
        }

        const authData = await res.json();
        const token = authData.token;

        // Fetch full profile
        const profileRes = await fetch('/api/v1/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!profileRes.ok) {
            throw new Error('No se pudo obtener el perfil del usuario');
        }

        const userData = await profileRes.json();
        
        if (userData && token) {
            authStore.login(userData, token);
            router.push('/');
        } else {
            throw new Error('Datos de usuario inválidos');
        }
    } catch (error) {
        console.error('[DEBUG] Login error:', error);
        errorMsg.value = 'Ocurrió un error inesperado. Por favor intente más tarde.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="auth-page">
        <div class="auth-card">
            <div class="auth-header">
                <h2>{{ $t('auth.login_title') }}</h2>
                <p class="subtitle">Bienvenido de nuevo a Dulce Fe</p>
            </div>

            <div v-if="errorMsg" class="error-banner">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{{ errorMsg }}</span>
            </div>

            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label>Usuario o Correo Electrónico</label>
                    <input 
                        type="text" 
                        v-model="form.identifier" 
                        placeholder="ej: juanito o juan@mail.com" 
                        required
                        :disabled="isLoading"
                    >
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

                <button type="submit" class="btn-primary full-width" :disabled="isLoading">
                    <span v-if="isLoading" class="loader"></span>
                    <span v-else>{{ $t('auth.login_btn') }}</span>
                </button>
            </form>

            <div class="auth-footer">
                <p>¿No tienes una cuenta? <RouterLink to="/registro">Regístrate aquí</RouterLink></p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-page {
    min-height: 80vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    background-color: var(--bg-color);
}

.auth-card {
    background: white;
    width: 100%;
    max-width: 420px;
    padding: 40px;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.06);
}

.auth-header {
    text-align: center;
    margin-bottom: 30px;
}

h2 {
    font-family: var(--heading-font-family);
    color: var(--primary-color);
    font-size: 2rem;
    margin-bottom: 8px;
}

.subtitle {
    color: #888;
    font-size: 0.95rem;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    font-family: var(--body-font-family);
    font-weight: 600;
    font-size: 0.85rem;
    color: #555;
    margin-bottom: 8px;
}

input {
    width: 100%;
    padding: 14px 16px;
    border: 1.5px solid #eee;
    border-radius: 12px;
    font-family: var(--body-font-family);
    font-size: 1rem;
    transition: all 0.2s;
    outline: none;
}

input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(44, 85, 48, 0.05);
}

.password-wrapper {
    position: relative;
}

.eye-btn {
    position: absolute;
    right: 12px;
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
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
}

.btn-primary.full-width {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    font-weight: 700;
    margin-top: 10px;
}

.auth-footer {
    text-align: center;
    margin-top: 30px;
    font-size: 0.9rem;
    color: #777;
}

.auth-footer a {
    color: var(--accent-color);
    font-weight: 700;
    text-decoration: none;
}

.loader {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
