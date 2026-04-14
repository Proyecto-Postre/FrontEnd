<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { authStore } from '../store.js';

const { t } = useI18n();
const isLogin = ref(true);
const router = useRouter();
const errorMsg = ref('');
const isLoading = ref(false);

// Form Data Refs
const form = ref({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
});

const toggleMode = () => {
    isLogin.value = !isLogin.value;
    errorMsg.value = '';
    form.value = { firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' };
};

const handleLogin = async () => {
    errorMsg.value = '';
    if (!form.value.email || !form.value.password) {
        errorMsg.value = t('auth.error_fill_all');
        return;
    }

    isLoading.value = true;
    try {
        // Step 1: Sign in — username IS the email in this backend
        const res = await fetch('/api/v1/Authentication/sign-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: form.value.email, password: form.value.password })
        });

        if (!res.ok) {
            errorMsg.value = t('auth.error_credentials');
            return;
        }

        const { token } = await res.json();

        // Step 2: Fetch full user profile using the JWT
        const profileRes = await fetch('/api/v1/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!profileRes.ok) {
            errorMsg.value = t('auth.error_generic');
            return;
        }

        const userData = await profileRes.json();
        authStore.login(userData, token);
        router.push('/');
    } catch (error) {
        console.error('Login error:', error);
        errorMsg.value = t('auth.error_generic');
    } finally {
        isLoading.value = false;
    }
};

const handleRegister = async () => {
    errorMsg.value = '';

    if (!form.value.firstName || !form.value.lastName || !form.value.phone ||
        !form.value.email    || !form.value.password) {
        errorMsg.value = t('auth.error_fill_all');
        return;
    }

    if (form.value.password !== form.value.confirmPassword) {
        errorMsg.value = t('auth.error_mismatch');
        return;
    }

    isLoading.value = true;
    try {
        // Step 1: Register — username = email, extra fields stored in FirstName etc.
        const signUpRes = await fetch('/api/v1/Authentication/sign-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username:  form.value.email,
                password:  form.value.password,
                firstName: form.value.firstName,
                lastName:  form.value.lastName,
                email:     form.value.email,
                phone:     form.value.phone
            })
        });

        if (!signUpRes.ok) {
            const errData = await signUpRes.json().catch(() => ({}));
            if (signUpRes.status === 409 || errData?.message?.toLowerCase().includes('exist')) {
                errorMsg.value = t('auth.error_email_taken');
            } else {
                errorMsg.value = t('auth.error_generic');
            }
            return;
        }

        // Step 2: Auto sign-in to get the JWT token
        const signInRes = await fetch('/api/v1/Authentication/sign-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: form.value.email, password: form.value.password })
        });

        if (!signInRes.ok) {
            // Registration succeeded but login failed — redirect to login page
            router.push('/login');
            return;
        }

        const { id: tokenId, token } = await signInRes.json();

        // Step 3: Fetch full profile to get the real user ID
        const profileRes = await fetch('/api/v1/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const userData = profileRes.ok ? await profileRes.json() : { username: form.value.email };
        authStore.login(userData, token);

        // Step 4: Save firstName, lastName, phone, email — sign-up only stored username/password
        if (userData.id) {
            await fetch(`/api/v1/users/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: form.value.firstName,
                    lastName:  form.value.lastName,
                    email:     form.value.email,
                    phone:     form.value.phone,
                    address:   ''
                })
            }).then(async (putRes) => {
                if (putRes.ok) {
                    const updated = await putRes.json();
                    authStore.updateUser(updated);
                }
            }).catch(() => {}); // Non-blocking — profile update is best effort
        }

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
    <div class="auth-container">
        <div class="auth-card">
            <h2>{{ isLogin ? $t('auth.login_title') : $t('auth.register_title') }}</h2>

            <!-- Error Banner -->
            <div v-if="errorMsg" class="error-banner">
                ⚠️ {{ errorMsg }}
            </div>

            <!-- Login Form -->
            <form v-if="isLogin" @submit.prevent="handleLogin" key="login-form">
                <div class="form-group">
                    <label>{{ $t('auth.email') }}</label>
                    <input type="email" v-model="form.email" placeholder="tucorreo@ejemplo.com" required>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.password') }}</label>
                    <input type="password" v-model="form.password" placeholder="••••••••" required>
                </div>

                <button type="submit" class="btn-primary full-width" :disabled="isLoading">
                    {{ isLoading ? $t('auth.loading') : $t('auth.login_btn') }}
                </button>
            </form>

            <!-- Register Form -->
            <form v-else @submit.prevent="handleRegister" key="register-form">
                <div class="form-row-split">
                    <div class="form-group">
                        <label>{{ $t('auth.name') }}</label>
                        <input type="text" v-model="form.firstName" placeholder="Juan" required>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('auth.lastname') }}</label>
                        <input type="text" v-model="form.lastName" placeholder="Pérez" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.phone') }}</label>
                    <input type="tel" v-model="form.phone" placeholder="999 999 999" required>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.email') }}</label>
                    <input type="email" v-model="form.email" placeholder="tucorreo@ejemplo.com" required>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.password') }}</label>
                    <input type="password" v-model="form.password" placeholder="••••••••" required>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.confirm_password') }}</label>
                    <input type="password" v-model="form.confirmPassword" placeholder="••••••••" required>
                </div>

                <button type="submit" class="btn-primary full-width" :disabled="isLoading">
                    {{ isLoading ? $t('auth.loading') : $t('auth.register_btn') }}
                </button>
            </form>

            <div class="auth-footer">
                <p>
                    {{ isLogin ? $t('auth.no_account') : $t('auth.has_account') }}
                    <a href="#" @click.prevent="toggleMode">
                        {{ isLogin ? $t('auth.register_btn') : $t('auth.login_btn') }}
                    </a>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-container {
    padding: 100px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    background-color: #f9f8f6;
}

.auth-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    width: 100%;
    max-width: 400px;
    text-align: center;
}

h2 {
    font-family: var(--heading-font-family);
    color: var(--primary-color);
    margin-bottom: 30px;
}

.form-group {
    margin-bottom: 20px;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    color: #666;
}

input {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #eee;
    border-radius: 10px;
    font-family: var(--body-font-family);
    outline: none;
    transition: all 0.3s;
}

input:focus {
    border-color: var(--primary-color);
}

.btn-primary.full-width {
    width: 100%;
    margin-top: 10px;
}

.form-row-split {
    display: flex;
    gap: 15px;
}
.form-row-split .form-group {
    width: 50%;
}

.auth-footer {
    margin-top: 20px;
    font-size: 0.9rem;
    color: #888;
}

.auth-footer a {
    color: var(--accent-color);
    font-weight: 700;
    text-decoration: none;
}

.error-banner {
    background: #fff0f0;
    border: 1px solid #ffcccc;
    color: #c0392b;
    padding: 10px 15px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    text-align: left;
    animation: shake 0.3s ease;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
