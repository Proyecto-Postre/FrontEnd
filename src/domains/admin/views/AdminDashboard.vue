<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { authStore } from '../../auth/store.js';
import { apiFetch } from '../../../api.js';

const { t } = useI18n();

// ─── State ──────────────────────────────────────────────────
const activeTab = ref('orders'); 
const stats = ref({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
});
const products = ref([]);
const users = ref([]);
const orders = ref([]);
const testimonials = ref([]);

const reviewsSearch = ref('');
const isEditing = ref(false);
const currentProduct = ref({});
const fileName = ref('');
const isSaving = ref(false);

const emptyProduct = {
    title: '',
    price: 0,
    description: '',
    category: 'Tortas',
    image: '',
    popular: false,
    isFeatured: false
};

// ─── Helpers ────────────────────────────────────────────────
const getImgUrl = (img) => {
    if (!img) return '/assets/postreejemplo.jpg';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    
    const apiUrl = import.meta.env.VITE_API_URL || 'https://backend-q47c.onrender.com';
    
    // If it's a relative path that doesn't look like a local asset, try the API URL
    if (img.includes('.') && !img.startsWith('/') && !img.startsWith('assets/')) {
        return `${apiUrl}/uploads/${img}`; // Common pattern for backend uploads
    }
    
    return img.startsWith('/') ? img : `/assets/${img}`;
};

const formatPrice = (price) => {
    if (typeof price === 'string') {
        return price.includes('S/') ? price : `S/ ${parseFloat(price).toFixed(2)}`;
    }
    return `S/ ${parseFloat(price || 0).toFixed(2)}`;
};

// ─── Data Fetching ──────────────────────────────────────────
const fetchData = async () => {
    try {
        console.log('[ADMIN] Fetching dashboard data...');
        
        // Fetch everything including metrics
        const [dashRes, userRes, orderRes, testRes] = await Promise.all([
            apiFetch('/api/v1/admin/analytics/dashboard'),
            apiFetch('/api/v1/users'),
            apiFetch('/api/v1/admin/orders'),
            apiFetch('/api/v1/admin/testimonials')
        ]);

        if (dashRes.ok) {
            const dashData = await dashRes.json();
            stats.value = dashData.stats || stats.value;
            products.value = dashData.topProducts || [];
        }

        // If dashData.topProducts is too limited, fetch all products for inventory
        const prodRes = await apiFetch('/api/v1/admin/products');
        if (prodRes.ok) products.value = await prodRes.json();

        if (userRes.ok) users.value = await userRes.json();
        if (orderRes.ok) orders.value = (await orderRes.json()).reverse();
        if (testRes.ok) testimonials.value = await testRes.json();
        
    } catch (e) {
        console.error("[ADMIN] Error loading dashboard:", e);
    }
};

onMounted(fetchData);

// ─── Actions ────────────────────────────────────────────────
const saveProduct = async () => {
    isSaving.value = true;
    const isNew = !currentProduct.value.id;
    const url = isNew ? '/api/v1/admin/products' : `/api/v1/admin/products/${currentProduct.value.id}`;
    const method = isNew ? 'POST' : 'PUT';

    // Clean price for backend (Backend might expect number or formatted string)
    let payload = { ...currentProduct.value };
    if (typeof payload.price === 'string') {
        payload.price = parseFloat(payload.price.replace(/[^0-9.]/g, '')) || 0;
    }

    try {
        const res = await apiFetch(url, {
            method,
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            await fetchData();
            isEditing.value = false;
        } else {
            console.error('[ADMIN] Error saving product:', res.status);
            alert('Error al guardar el producto.');
        }
    } catch (e) {
        console.error('[ADMIN] Save error:', e);
    } finally {
        isSaving.value = false;
    }
};

const deleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
        const res = await apiFetch(`/api/v1/admin/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            products.value = products.value.filter(p => p.id !== id);
        }
    } catch (e) {
        console.error('[ADMIN] Delete error:', e);
    }
};

const updateOrderStatus = async (order, newStatus) => {
    try {
        const res = await apiFetch(`/api/v1/admin/orders/${order.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(newStatus)
        });
        if (res.ok) order.status = newStatus;
    } catch(e) { /* silent */ }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        fileName.value = file.name;
        const reader = new FileReader();
        reader.onload = (e) => { currentProduct.value.image = e.target.result; };
        reader.readAsDataURL(file);
    }
};

const toggleTestimonialSelection = async (review) => {
    try {
        const res = await apiFetch(`/api/v1/admin/testimonials/${review.id}/pin`, {
            method: 'PATCH'
        });
        if (res.ok) {
            const updated = await res.json();
            review.isPinned = updated.isPinned;
        }
    } catch (e) { console.error("[ADMIN] Toggle pin error:", e); }
};

const deleteTestimonial = async (id) => {
    if (!confirm("¿Eliminar comentario?")) return;
    try {
        const res = await apiFetch(`/api/v1/admin/testimonials/${id}`, { method: 'DELETE' });
        if (res.ok) {
            testimonials.value = testimonials.value.filter(t => t.id !== id);
        }
    } catch (e) { console.error("[ADMIN] Delete review error:", e); }
};
</script>

<template>
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="sidebar-brand">
                <span class="leaf">🌿</span>
                <div class="brand-info">
                    <h2>Dulce Fe</h2>
                    <span>Panel de Control</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <button @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                    Pedidos
                </button>
                <button @click="activeTab = 'inventory'" :class="{ active: activeTab === 'inventory' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Inventario
                </button>
                <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Usuarios
                </button>
                <button @click="activeTab = 'reviews'" :class="{ active: activeTab === 'reviews' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Reseñas
                </button>
            </nav>

            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="avatar">{{ authStore.displayName?.charAt(0) }}</div>
                    <div class="details">
                        <p class="name">{{ authStore.displayName }}</p>
                        <p class="role">Administrador</p>
                    </div>
                </div>
                <button @click="authStore.logout(); $router.push('/')" class="logout-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar Sesión
                </button>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="main-viewport">
            <!-- Header Stats -->
            <section class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon orders"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
                    <div class="stat-content">
                        <span class="label">Pedidos Totales</span>
                        <span class="value">{{ stats.totalOrders }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon revenue"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                    <div class="stat-content">
                        <span class="label">Ingresos Brutos</span>
                        <span class="value">S/ {{ stats.totalRevenue.toFixed(2) }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon items"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>
                    <div class="stat-content">
                        <span class="label">Productos</span>
                        <span class="value">{{ stats.totalProducts }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon users"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
                    <div class="stat-content">
                        <span class="label">Clientes</span>
                        <span class="value">{{ stats.totalUsers }}</span>
                    </div>
                </div>
            </section>

            <!-- Table Sections -->
            <section class="content-body shadow-card">
                <!-- Orders Tab -->
                <div v-if="activeTab === 'orders'" class="tab-pane">
                    <div class="table-header">
                        <h2>Gestión de Pedidos</h2>
                        <div class="actions">
                             <button @click="fetchData" class="btn-refresh">Actualizar</button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="premium-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="order in orders" :key="order.id">
                                    <td>#{{ order.id }}</td>
                                    <td>{{ new Date(order.timestamp || order.date).toLocaleDateString() }}</td>
                                    <td>{{ order.userName || 'Usuario' }}</td>
                                    <td class="bold">{{ formatPrice(order.total) }}</td>
                                    <td>
                                        <select 
                                            :value="order.status" 
                                            @change="updateOrderStatus(order, $event.target.value)"
                                            class="status-dropdown" :class="order.status"
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="atendido">Atendido</option>
                                            <option value="cancelado">Cancelado</option>
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Inventory Tab -->
                <div v-if="activeTab === 'inventory'" class="tab-pane">
                    <div class="table-header">
                        <h2>Catálogo de Productos</h2>
                        <button class="btn-primary" @click="isEditing = true; currentProduct = { ...emptyProduct }">+ Nuevo Postre</button>
                    </div>
                    <div class="table-responsive">
                        <table class="premium-table">
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Categoría</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="p in products" :key="p.id">
                                    <td><img :src="getImgUrl(p.image)" class="thumb-round shadow-sm" @error="$event.target.src = '/assets/postreejemplo.jpg'"></td>
                                    <td class="bold">{{ p.title }}</td>
                                    <td class="price-cell">{{ formatPrice(p.price) }}</td>
                                    <td><span class="tag">{{ p.category }}</span></td>
                                    <td>
                                        <span :class="['tag', p.isFeatured ? 'featured' : 'standard']">
                                            {{ p.isFeatured ? 'Destacado' : 'Normal' }}
                                        </span>
                                    </td>
                                    <td class="actions">
                                        <button @click="currentProduct = { ...p }; isEditing = true" class="btn-icon edit" title="Editar">✏️</button>
                                        <button @click="deleteProduct(p.id)" class="btn-icon delete" title="Eliminar">🗑️</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Users Tab -->
                <div v-if="activeTab === 'users'" class="tab-pane">
                    <div class="table-header">
                        <h2>Gestión de Usuarios</h2>
                    </div>
                    <div class="table-responsive">
                        <table class="premium-table">
                            <thead>
                                <tr>
                                    <th>Nombre Completo</th>
                                    <th>Email / Usuario</th>
                                    <th>Rol actual</th>
                                    <th>Última Actividad</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="u in users" :key="u.id">
                                    <td class="bold">{{ (u.firstName && u.lastName) ? (u.firstName + ' ' + u.lastName) : (u.name || u.username) }}</td>
                                    <td>{{ u.email || u.username }}</td>
                                    <td>
                                        <span :class="['tag role-badge', u.role === '1' || u.role === 'admin' ? 'admin' : 'customer']">
                                            {{ u.role === '1' || u.role === 'admin' ? 'Admin' : 'Cliente' }}
                                        </span>
                                    </td>
                                    <td class="date-cell">Hoy</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Reviews Tab -->
                <div v-if="activeTab === 'reviews'" class="tab-pane">
                    <div class="table-header">
                        <h2>Reseñas de Clientes</h2>
                        <input v-model="reviewsSearch" placeholder="🔍 Buscar autor..." class="sub-search">
                    </div>
                    <div class="table-responsive">
                        <table class="premium-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Comentario</th>
                                    <th>Calificación</th>
                                    <th>Visibilidad</th>
                                    <th>Quitar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="r in testimonials" :key="r.id">
                                    <td class="bold">{{ r.name }}</td>
                                    <td class="long-text">{{ r.text }}</td>
                                    <td class="stars-cell">{{ "★".repeat(r.stars || 5) }}</td>
                                    <td>
                                        <button @click="toggleTestimonialSelection(r)" :class="{ pinned: r.isPinned }" class="btn-pin">
                                            {{ r.isPinned ? "📌 Destacado" : "📍 Fijar" }}
                                        </button>
                                    </td>
                                    <td><button @click="deleteTestimonial(r.id)" class="btn-icon delete">🗑️</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>

        <!-- Edit Modal Overlay -->
        <div v-if="isEditing" class="modal-backdrop" @click.self="isEditing = false">
            <div class="modal-card animator-slide-up">
                <h3>{{ currentProduct.id ? 'Editar Postre' : 'Nuevo Postre' }}</h3>
                <p class="subtitle">Personaliza los detalles del catálogo</p>
                
                <form @submit.prevent="saveProduct" class="modern-form">
                    <div class="g-2">
                        <div class="field">
                            <label>Nombre del Postre</label>
                            <input v-model="currentProduct.title" required placeholder="Ej: Red Velvet Supreme">
                        </div>
                        <div class="field">
                            <label>Precio (S/)</label>
                            <input type="number" step="0.01" v-model="currentProduct.price" required placeholder="0.00">
                        </div>
                    </div>
                    <div class="g-2">
                        <div class="field">
                            <label>Categoría</label>
                            <select v-model="currentProduct.category">
                                <option>Tortas</option>
                                <option>Postres</option>
                                <option>Bebidas</option>
                                <option>Workshops</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Estado Destacado</label>
                            <select v-model="currentProduct.isFeatured">
                                <option :value="true">Sí, mostrar en inicio</option>
                                <option :value="false">No, normal</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label>Imagen del Producto</label>
                        <div class="file-uploader" @click="$refs.fileInput.click()">
                            <input type="file" ref="fileInput" @change="handleFileUpload" hidden>
                            <div v-if="currentProduct.image" class="preview">
                                <img :src="getImgUrl(currentProduct.image)" alt="Preview">
                                <span>Cambiar imagen</span>
                            </div>
                            <div v-else class="upload-placeholder">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <p>Sube una foto deliciosa</p>
                            </div>
                        </div>
                    </div>
                    <div class="field">
                        <label>Descripción sugerente</label>
                        <textarea v-model="currentProduct.description" rows="3" placeholder="Describe el sabor..."></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" @click="isEditing = false" class="btn-ghost">Cancelar</button>
                        <button type="submit" class="btn-solid" :disabled="isSaving">
                            <span v-if="isSaving" class="load-spin"></span>
                            {{ currentProduct.id ? 'Actualizar' : 'Crear Postre' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ── Layout & Theme ────────────────────────────────────────── */
.admin-layout {
    display: flex;
    min-height: 100vh;
    background: var(--bg-color);
    color: var(--text-color);
    font-family: var(--body-font-family);
}

/* ── Sidebar ───────────────────────────────────────────────── */
.sidebar {
    width: 280px;
    background: var(--primary-color);
    color: white;
    display: flex;
    flex-direction: column;
    padding: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    box-shadow: 10px 0 40px rgba(0,0,0,0.1);
}

.sidebar-brand {
    padding: 40px 30px;
    display: flex;
    align-items: center;
    gap: 15px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}

.sidebar-brand .leaf { font-size: 2rem; }

.sidebar-brand h2 { 
    font-family: var(--heading-font-family);
    font-size: 1.6rem; 
    color: #fff; 
    margin: 0; 
}

.sidebar-nav {
    padding: 30px 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.sidebar-nav button {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.7);
    padding: 14px 20px;
    border-radius: 14px;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-nav button:hover {
    background: rgba(255,255,255,0.05);
    color: white;
}

.sidebar-nav button.active {
    background: var(--bg-color);
    color: var(--primary-color);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.sidebar-footer {
    padding: 30px;
    background: rgba(0,0,0,0.1);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.avatar {
    width: 40px; 
    height: 40px; 
    background: var(--accent-color); 
    border-radius: 12px;
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-weight: 700; 
    color: white;
}

.logout-btn {
    background: rgba(197, 48, 48, 0.2); 
    border: none; 
    color: #fc8181; 
    width: 100%;
    padding: 12px; 
    border-radius: 12px; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    gap: 10px; 
    font-weight: 700; 
    cursor: pointer; 
    transition: 0.3s;
}

.logout-btn:hover { background: #c53030; color: white; }

/* ── Main Viewport ─────────────────────────────────────────── */
.main-viewport {
    flex: 1;
    padding: 40px 60px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

/* Stats Cards */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 25px;
    margin-bottom: 50px;
}

.stat-card {
    background: var(--surface);
    padding: 24px;
    border-radius: 24px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: transform 0.3s, box-shadow 0.3s;
    box-shadow: 0 4px 12px var(--shadow-color);
}

.stat-card:hover { 
    transform: translateY(-5px); 
    box-shadow: 0 10px 30px var(--shadow-color);
}

.stat-icon {
    width: 60px; 
    height: 60px; 
    border-radius: 18px;
    display: flex; 
    align-items: center; 
    justify-content: center;
}

.stat-icon.orders  { background: #eef2ff; color: #4338ca; }
.stat-icon.revenue { background: #f0fdf4; color: #15803d; }
.stat-icon.items   { background: #fff7ed; color: #c2410c; }
.stat-icon.users   { background: #faf5ff; color: #7e22ce; }

.stat-card .label { 
    color: var(--text-muted); 
    font-size: 0.8rem; 
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 1px; 
}

.stat-card .value { 
    font-family: var(--heading-font-family);
    font-size: 1.8rem; 
    font-weight: 800; 
    color: var(--text-color); 
    display: block; 
}

/* Content Body */
.shadow-card {
    background: var(--surface);
    border-radius: 32px;
    padding: 40px;
    box-shadow: 0 20px 60px var(--shadow-color);
    border: 1px solid var(--border-color);
}

.table-header h2 { 
    font-family: var(--heading-font-family); 
    font-size: 2rem; 
    color: var(--primary-color); 
}

.premium-table th {
    text-align: left;
    color: var(--text-light);
    font-size: 0.75rem;
    padding: 15px 20px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.premium-table td {
    padding: 18px 20px;
    background: #fdfcfb;
    font-size: 0.95rem;
    border-top: 1px solid var(--bg-color);
    border-bottom: 1px solid var(--bg-color);
}

.bold { font-weight: 700; color: var(--text-color); }

/* Modal */
.modal-card { 
    background: var(--white); 
    width: 600px; 
    border-radius: 32px; 
    padding: 50px; 
    box-shadow: 0 30px 100px rgba(0,0,0,0.2); 
}

.modal-card h3 { 
    font-family: var(--heading-font-family); 
    font-size: 2.2rem; 
    margin-bottom: 10px; 
    color: var(--primary-color); 
}

.btn-solid { 
    background: var(--primary-color); 
    color: white; 
    border: none; 
    padding: 16px 30px; 
    border-radius: 16px; 
    font-weight: 700; 
    cursor: pointer; 
    transition: 0.3s; 
    width: 100%; 
}

.btn-solid:hover { 
    background: var(--primary-dark); 
    transform: translateY(-2px); 
    box-shadow: 0 8px 20px rgba(44, 85, 48, 0.3);
}

.animator-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
