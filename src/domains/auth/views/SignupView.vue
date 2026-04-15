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
        console.log('[DEBUG] Starting signup for:', form.value.email);
        
        // Step 1: Register
        const signUpRes = await fetch('/api/v1/Authentication/sign-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username:  form.value.firstName.trim(), 
                firstName: form.value.firstName.trim(),
                lastName:  form.value.lastName.trim(),
                phone:     form.value.phone.trim(),
                email:     form.value.email.trim(),
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

        console.log('[DEBUG] Signup success. Auto-signing in...');

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
            console.warn('[DEBUG] Auto sign-in failed after signup, redirecting to login');
            router.push('/login');
            return;
        }

        const authData = await signInRes.json();
        const token = authData.token;

        // Step 3: Fetch profile (RESILIENT)
        let userData = { 
            id: authData.id, 
            username: authData.username,
            role: authData.role || authData.Role || 'user', // Capture role with casing resilience
            firstName: form.value.firstName.trim(),
            lastName: form.value.lastName.trim()
        };

        try {
            const profileRes = await fetch('/api/v1/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (profileRes.ok) {
                const freshProfile = await profileRes.json();
                userData = { ...userData, ...freshProfile };
                console.log('[DEBUG] Profile loaded successfully after signup');
            } else {
                console.warn('[DEBUG] Profile fetch failed (401) after signup, logging in with form data');
            }
        } catch (e) {
            console.error('[DEBUG] Failed to fetch profile after signup:', e);
        }

        authStore.login(userData, token);
        console.log('[DEBUG] Registration complete. Redirecting...');
        router.push('/');

    } catch (error) {
        console.error('[DEBUG] Unexpected handleRegister error:', error);
        errorMsg.value = t('auth.error_generic');
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="split-auth">
        <!-- Visual Section (Imagery) -->
        <div class="auth-visual">
            <div class="visual-overlay"></div>
            <img src="/assets/auth_bg.png" alt="Pastries" class="bg-img">
            <div class="visual-content">
                <RouterLink to="/" class="logo-link">
                    <span class="logo-leaf">🌿</span>
                    <h1 class="logo-text">Dulce Fe</h1>
                </RouterLink>
                <div class="visual-caption">
                    <h3>Crea momentos dulces</h3>
                    <p>Regístrate para guardar tus favoritos y vivir la experiencia completa.</p>
                </div>
            </div>
        </div>

        <!-- Form Section -->
        <div class="auth-container">
            <div class="auth-form-box">
                <div class="auth-header">
                    <h2>Nueva Cuenta</h2>
                    <p>Crea un perfil para empezar tu experiencia</p>
                </div>

                <div v-if="errorMsg" class="error-toast">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{{ errorMsg }}</span>
                </div>

                <form @submit.prevent="handleRegister" class="elegant-form">
                    <div class="input-row">
                        <div class="input-group">
                            <label>Nombre</label>
                            <input type="text" v-model="form.firstName" placeholder="Juan" required :disabled="isLoading">
                        </div>
                        <div class="input-group">
                            <label>Apellido</label>
                            <input type="text" v-model="form.lastName" placeholder="Pérez" required :disabled="isLoading">
                        </div>
                    </div>

                    <div class="input-group">
                        <label>Teléfono</label>
                        <input type="tel" v-model="form.phone" placeholder="999 999 999" required :disabled="isLoading">
                    </div>

                    <div class="input-group">
                        <label>Correo Electrónico</label>
                        <input type="email" v-model="form.email" placeholder="tu@email.com" required :disabled="isLoading">
                    </div>

                    <div class="input-group">
                        <label>Contraseña</label>
                        <div class="input-field">
                            <input 
                                :type="showPassword ? 'text' : 'password'" 
                                v-model="form.password" 
                                placeholder="Mínimo 6 caracteres" 
                                required
                                :disabled="isLoading"
                            >
                            <button type="button" class="eye-toggle" @click="togglePassword">
                                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>

                    <div class="input-group">
                        <label>Confirmar Contraseña</label>
                        <input type="password" v-model="form.confirmPassword" placeholder="Repite tu contraseña" required :disabled="isLoading">
                    </div>

                    <button type="submit" class="auth-submit" :disabled="isLoading">
                        <span v-if="isLoading" class="spinner"></span>
                        <span v-else>Crear Cuenta</span>
                    </button>
                </form>

                <div class="auth-nav">
                    <span>¿Ya tienes una cuenta? <RouterLink to="/login">Inicia sesión</RouterLink></span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Reuse styles from LoginView for consistent Premium Split feel */
.split-auth { display: flex; min-height: 100vh; width: 100%; background: #fff; overflow-x: hidden; }

.auth-visual { flex: 1.2; position: relative; background: #222; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
.visual-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(44, 85, 48, 0.4), rgba(28, 25, 23, 0.7)); z-index: 1; }
.visual-content { position: relative; z-index: 2; color: white; text-align: center; padding: 40px; }

.logo-link { display: inline-flex; align-items: center; gap: 15px; text-decoration: none; margin-bottom: 30px; }
.logo-text { font-family: var(--heading-font-family); font-size: 2.5rem; font-weight: 700; color: white; letter-spacing: 0.08em; }
.logo-leaf { font-size: 1.2rem; }

.visual-caption h3 { font-family: var(--heading-font-family); font-size: 1.8rem; margin-bottom: 12px; }
.visual-caption p { opacity: 0.9; line-height: 1.5; font-size: 1rem; }

.auth-container { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: white; z-index: 10; box-shadow: -15px 0 35px rgba(0,0,0,0.06); }
.auth-form-box { width: 100%; max-width: 440px; }

.auth-header { margin-bottom: 2rem; }
.auth-header h2 { font-family: var(--heading-font-family); font-size: 2.2rem; color: var(--primary-color); margin-bottom: 6px; }
.auth-header p { color: var(--text-muted); font-size: 0.95rem; }

.elegant-form { display: flex; flex-direction: column; gap: 15px; }

.input-row { display: flex; gap: 15px; }
.input-row .input-group { flex: 1; }

.input-group label { display: block; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: #666; margin-bottom: 8px; }
.input-group input { width: 100%; padding: 14px 16px; border: 1.5px solid #eee; border-radius: 10px; font-family: var(--body-font-family); font-size: 0.95rem; transition: all 0.2s; }
.input-group input:focus { border-color: var(--primary-color); outline: none; background: rgba(44, 85, 48, 0.02); }

.input-field { position: relative; }
.eye-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #ccc; cursor: pointer; padding: 5px; }

.auth-submit { background: var(--primary-color); color: white; border: none; padding: 16px; border-radius: 10px; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.3s; margin-top: 5px; display: flex; align-items: center; justify-content: center; width: 100%; }
.auth-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 15px rgba(44, 85, 48, 0.2); background: #1e3d23; }

.error-toast { display: flex; align-items: center; gap: 10px; background: #fff5f5; border: 1px solid #feb2b2; color: #c53030; padding: 12px; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.85rem; }

.auth-nav { margin-top: 2rem; text-align: center; font-size: 0.9rem; color: #888; }
.auth-nav a { color: var(--accent-color); font-weight: 700; text-decoration: none; margin-left: 5px; }

.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 950px) {
    .auth-visual { display: none; }
    .auth-container { box-shadow: none; padding: 25px; }
    .input-row { flex-direction: column; gap: 15px; }
}
</style>
