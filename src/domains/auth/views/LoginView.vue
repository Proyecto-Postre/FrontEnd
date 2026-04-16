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
        
        // 1. Authenticate
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
            } else if (res.status === 400) {
                if (errorData.errors) {
                    const firstKey = Object.keys(errorData.errors)[0];
                    errorMsg.value = errorData.errors[firstKey][0];
                } else if (Array.isArray(errorData) && errorData.length > 0) {
                    errorMsg.value = errorData[0].errorMessage || errorData[0];
                } else {
                    errorMsg.value = errorData.message || 'Credenciales inválidas o formato incorrecto.';
                }
            } else {
                errorMsg.value = errorData.message || 'Error del servidor al intentar entrar.';
            }
            return;
        }

        const authData = await res.json();
        // authData is expected to be: { id, username, token }
        const token = authData.token;
        
        // 2. Fetch full profile (RESILIENT)
        let userData = { 
            id: authData.id, 
            username: authData.username,
            role: authData.role || authData.Role || 'user', // Capture role with casing resilience
            firstName: authData.username 
        };

        try {
            const profileRes = await fetch('/api/v1/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (profileRes.ok) {
                const freshProfile = await profileRes.json();
                userData = { ...userData, ...freshProfile };
                console.log('[DEBUG] Profile loaded successfully');
            } else {
                console.warn('[DEBUG] Profile fetch failed (401?), logging in anyway with basic data');
            }
        } catch (e) {
            console.error('[DEBUG] Profile fetch error:', e);
        }

        // 3. Finalize Login (Unblocked)
        authStore.login(userData, token);
        console.log('[DEBUG] Login finalized. Redirecting...');
        router.push('/');
        
    } catch (error) {
        console.error('[DEBUG] Unexpected handleLogin error:', error);
        errorMsg.value = 'Ocurrió un error inesperado. Por favor intente más tarde.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="split-auth">
        <!-- Visual Section -->
        <div class="auth-visual">
            <div class="visual-overlay"></div>
            <img src="/assets/auth_bg.png" alt="Pastries" class="bg-img">
            <div class="visual-content">
                <RouterLink to="/" class="logo-link">
                    <span class="logo-leaf">🌿</span>
                    <h1 class="logo-text">Dulce Fe</h1>
                </RouterLink>
                <div class="visual-caption">
                    <h3>La repostería que alimenta el alma</h3>
                    <p>Cada postre es una obra de arte creada con amor y fe.</p>
                </div>
            </div>
        </div>

        <!-- Form Section -->
        <div class="auth-container">
            <div class="auth-form-box">
                <div class="mobile-logo">
                    <RouterLink to="/">Dulce Fe</RouterLink>
                </div>

                <div class="auth-header">
                    <h2>Bienvenido</h2>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                <div v-if="errorMsg" class="error-toast">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{{ errorMsg }}</span>
                </div>

                <form @submit.prevent="handleLogin" class="elegant-form">
                    <div class="input-group">
                        <label>Usuario o Correo</label>
                        <div class="input-field">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <input 
                                type="text" 
                                v-model="form.identifier" 
                                placeholder="tu@email.com o usuario" 
                                required
                                :disabled="isLoading"
                            >
                        </div>
                    </div>

                    <div class="input-group">
                        <label>Contraseña</label>
                        <div class="input-field">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            <input 
                                :type="showPassword ? 'text' : 'password'" 
                                v-model="form.password" 
                                placeholder="••••••••" 
                                required
                                :disabled="isLoading"
                            >
                            <button type="button" class="eye-toggle" @click="togglePassword">
                                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="auth-submit" :disabled="isLoading">
                        <span v-if="isLoading" class="spinner"></span>
                        <span v-else>Iniciar Sesión</span>
                    </button>
                </form>

                <div class="auth-nav">
                    <span>¿Aún no eres parte? <RouterLink to="/registro">Crea una cuenta</RouterLink></span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.split-auth {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: var(--surface);
    overflow: hidden;
}

/* ── Visual Section ───────────────────────────────────────── */
.auth-visual {
    flex: 1.2;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1a1a;
}

.bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.85;
}

.visual-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(44, 85, 48, 0.4), rgba(28, 25, 23, 0.7));
    z-index: 1;
}

.visual-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: white;
    padding: 40px;
    max-width: 500px;
}

.logo-link {
    display: inline-flex;
    align-items: center;
    gap: 15px;
    text-decoration: none;
    margin-bottom: 40px;
}

.logo-text {
    font-family: var(--heading-font-family);
    font-size: 3rem;
    font-weight: 700;
    color: white;
    letter-spacing: 0.1em;
}

.logo-leaf { font-size: 1.5rem; }

.visual-caption h3 {
    font-family: var(--heading-font-family);
    font-size: 2rem;
    margin-bottom: 15px;
}

.visual-caption p {
    font-size: 1.1rem;
    opacity: 0.9;
    line-height: 1.6;
}

/* ── Form Section ─────────────────────────────────────────── */
.auth-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: white;
    z-index: 10;
    box-shadow: -10px 0 30px rgba(0,0,0,0.05);
}

.auth-form-box {
    width: 100%;
    max-width: 400px;
}

.mobile-logo {
    display: none;
    margin-bottom: 2rem;
}

.auth-header {
    margin-bottom: 2.5rem;
}

.auth-header h2 {
    font-family: var(--heading-font-family);
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 8px;
}

.auth-header p {
    color: var(--text-muted);
    font-size: 1rem;
}

/* ── Elegant Form ────────────────────────────────────────── */
.elegant-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.input-group label {
    display: block;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #555;
    margin-bottom: 10px;
}

.input-field {
    position: relative;
    display: flex;
    align-items: center;
}

.input-field .icon {
    position: absolute;
    left: 16px;
    color: #999;
}

.input-field input {
    width: 100%;
    padding: 16px 16px 16px 48px;
    border: 1.5px solid #eaeaea;
    border-radius: 12px;
    font-size: 1rem;
    font-family: var(--body-font-family);
    transition: all 0.2s ease;
}

.input-field input:focus {
    border-color: var(--primary-color);
    background-color: rgba(44, 85, 48, 0.02);
    box-shadow: 0 4px 12px rgba(44, 85, 48, 0.08);
    outline: none;
}

.eye-toggle {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: #bbb;
    cursor: pointer;
    padding: 8px;
}

.auth-submit {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 18px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.auth-submit:hover:not(:disabled) {
    background-color: #1e3d23;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(44, 85, 48, 0.25);
}

.auth-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.error-toast {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #fff5f5;
    border: 1px solid #feb2b2;
    color: #c53030;
    padding: 14px;
    border-radius: 10px;
    margin-bottom: 2rem;
    font-size: 0.9rem;
}

.auth-nav {
    margin-top: 2.5rem;
    text-align: center;
}

.auth-nav span {
    color: #777;
    font-size: 0.95rem;
}

.auth-nav a {
    color: var(--accent-color);
    font-weight: 700;
    text-decoration: none;
    margin-left: 5px;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 950px) {
    .auth-visual { display: none; }
    .auth-container { box-shadow: none; }
    .mobile-logo { display: block; font-family: var(--heading-font-family); font-size: 2rem; color: var(--primary-color); }
    .mobile-logo a { text-decoration: none; color: inherit; }
}
</style>
