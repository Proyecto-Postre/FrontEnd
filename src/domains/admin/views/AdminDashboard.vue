<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { authStore } from '../../auth/store.js';
import { apiFetch } from '../../../api.js';
import SalesChart from '../components/SalesChart.vue';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Box, 
  Users, 
  MessageSquare, 
  LogOut, 
  Plus, 
  RefreshCw, 
  Search, 
  Pencil, 
  Trash2, 
  Pin,
  TrendingUp,
  DollarSign,
  Package,
  User as UserIcon,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-vue-next';

const { t } = useI18n();

// ─── State ──────────────────────────────────────────────────
const activeTab = ref('dashboard'); 
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
            body: JSON.stringify({
                ...payload,
                // Ensure we send field names that match the DB/Backend expectations
                first_name: payload.first_name,
                last_name: payload.last_name,
                is_featured: payload.isFeatured || payload.is_featured
            })
        });
        
        if (res.ok) {
            await fetchData();
            isEditing.value = false;
        } else {
            console.error('[ADMIN] Error saving product:', res.status);
            alert('Error al guardar el producto. Verifica la conexión.');
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
            // Ensure we sync with the database field 'is_pinned'
            review.is_pinned = updated.is_pinned !== undefined ? updated.is_pinned : !review.is_pinned;
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
    <div class="admin-page-container">
        <!-- Horizontal Admin Navigation -->
        <nav class="admin-horizontal-nav shadow-premium">
            <div class="container nav-tabs-wrapper">
                <div class="admin-brand-mini">
                    <Box :size="20" class="icon-accent" />
                    <span>Panel Admin</span>
                </div>
                
                <div class="tabs-group">
                    <button @click="activeTab = 'dashboard'" :class="{ active: activeTab === 'dashboard' }">
                        <LayoutDashboard :size="18" />
                        <span>Resumen</span>
                    </button>
                    <button @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }">
                        <ShoppingBag :size="18" />
                        <span>Pedidos</span>
                    </button>
                    <button @click="activeTab = 'inventory'" :class="{ active: activeTab === 'inventory' }">
                        <Box :size="18" />
                        <span>Inventario</span>
                    </button>
                    <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">
                        <Users :size="18" />
                        <span>Usuarios</span>
                    </button>
                    <button @click="activeTab = 'reviews'" :class="{ active: activeTab === 'reviews' }">
                        <MessageSquare :size="18" />
                        <span>Reseñas</span>
                    </button>
                </div>
                
                <div class="nav-spacer"></div>
                
                <div class="admin-header-actions">
                    <button @click="fetchData" class="refresh-pill" title="Sincronizar Datos">
                        <RefreshCw :size="16" />
                    </button>
                    <div class="user-chip">
                        <div class="avatar-xs">{{ authStore.displayName?.charAt(0) }}</div>
                        <span class="user-label">{{ authStore.displayName }}</span>
                    </div>
                </div>
            </div>
        </nav>

            <div class="tab-content-wrapper animator-fade-in">
                <!-- Dashboard Overview -->
                <div v-if="activeTab === 'dashboard'" class="tab-content animator-fade-in">
                    <section class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-icon orders"><TrendingUp :size="24" /></div>
                            <div class="metric-data">
                                <span class="m-label">Pedidos Totales</span>
                                <span class="m-value">{{ stats.totalOrders }}</span>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon revenue"><DollarSign :size="24" /></div>
                            <div class="metric-data">
                                <span class="m-label">Ingresos</span>
                                <span class="m-value">S/ {{ stats.totalRevenue.toFixed(2) }}</span>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon products"><Package :size="24" /></div>
                            <div class="metric-data">
                                <span class="m-label">Productos</span>
                                <span class="m-value">{{ stats.totalProducts }}</span>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon clients"><UserIcon :size="24" /></div>
                            <div class="metric-data">
                                <span class="m-label">Clientes</span>
                                <span class="m-value">{{ stats.totalUsers }}</span>
                            </div>
                        </div>
                    </section>

                    <div class="dashboard-grid-dual">
                        <article class="chart-box shadow-premium">
                            <div class="box-header">
                                <h3>Rendimiento de Ventas</h3>
                                <span>Últimos 30 días</span>
                            </div>
                            <SalesChart />
                        </article>
                        
                        <article class="activity-box shadow-premium">
                            <div class="box-header">
                                <h3>Actividad Reciente</h3>
                            </div>
                            <div class="activity-list">
                                <div v-for="order in orders.slice(0, 5)" :key="order.id" class="activity-item">
                                    <div class="activity-icon" :class="order.status">
                                        <CheckCircle v-if="order.status === 'atendido'" :size="16" />
                                        <Clock v-else-if="order.status === 'pendiente'" :size="16" />
                                        <XCircle v-else :size="16" />
                                    </div>
                                    <div class="activity-details">
                                        <p><strong>Pedido #{{ order.id }}</strong> - {{ order.userName || 'Cliente' }}</p>
                                        <span>{{ new Date(order.timestamp || order.date).toLocaleTimeString() }}</span>
                                    </div>
                                    <span class="activity-amount">{{ formatPrice(order.total) }}</span>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>

                <!-- Orders Tab -->
                <div v-if="activeTab === 'orders'" class="tab-content animator-fade-in">
                    <div class="section-card shadow-premium">
                        <div class="section-header">
                            <h2>Gestión de Pedidos</h2>
                            <div class="btn-group">
                                <button @click="fetchData" class="btn-secondary-outline">
                                    <RefreshCw :size="16" />
                                    Actualizar
                                </button>
                            </div>
                        </div>
                        <div class="table-container">
                            <table class="modern-table">
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
                                        <td><span class="id-pill">#{{ order.id }}</span></td>
                                        <td>{{ new Date(order.timestamp || order.date).toLocaleDateString() }}</td>
                                        <td class="user-cell">{{ order.userName || 'Usuario' }}</td>
                                        <td class="amount-cell">{{ formatPrice(order.total) }}</td>
                                        <td>
                                            <div class="status-select-wrapper">
                                                <select 
                                                    :value="order.status" 
                                                    @change="updateOrderStatus(order, $event.target.value)"
                                                    class="modern-select" :class="order.status"
                                                >
                                                    <option value="pendiente">Pendiente</option>
                                                    <option value="atendido">Atendido</option>
                                                    <option value="cancelado">Cancelado</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Inventory Tab -->
                <div v-if="activeTab === 'inventory'" class="tab-content animator-fade-in">
                    <div class="section-card shadow-premium">
                        <div class="section-header">
                            <h2>Catálogo de Productos</h2>
                            <button class="btn-primary-admin" @click="isEditing = true; currentProduct = { ...emptyProduct }">
                                <Plus :size="18" />
                                Nuevo Postre
                            </button>
                        </div>
                        <div class="table-container">
                            <table class="compact-table">
                                <thead>
                                    <tr>
                                        <th class="col-img">Img</th>
                                        <th class="col-name">Nombre del Producto</th>
                                        <th class="col-price">Precio</th>
                                        <th class="col-cat">Categoría</th>
                                        <th class="col-feat">Estado</th>
                                        <th class="col-actions">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="p in products" :key="p.id" class="product-row">
                                        <td class="col-img">
                                            <div class="compact-thumb">
                                                <img :src="getImgUrl(p.image)" @error="$event.target.src = '/assets/postreejemplo.jpg'">
                                            </div>
                                        </td>
                                        <td class="col-name">
                                            <div class="product-info-compact">
                                                <span class="p-title">{{ p.title }}</span>
                                                <span class="p-id">ID: #{{ p.id }}</span>
                                            </div>
                                        </td>
                                        <td class="col-price">
                                            <span class="p-price">{{ formatPrice(p.price) }}</span>
                                        </td>
                                        <td class="col-cat">
                                            <span class="compact-cat-pill">{{ p.category }}</span>
                                        </td>
                                        <td class="col-feat">
                                            <div v-if="p.is_featured || p.isFeatured" class="status-indicator featured" title="Destacado">
                                                <Pin :size="12" />
                                                <span>Destacado</span>
                                            </div>
                                            <div v-else class="status-indicator normal">
                                                <span>Normal</span>
                                            </div>
                                        </td>
                                        <td class="col-actions">
                                            <div class="row-actions">
                                                <button @click="currentProduct = { ...p }; isEditing = true" class="mini-action-btn edit" title="Editar">
                                                    <Pencil :size="14" />
                                                </button>
                                                <button @click="deleteProduct(p.id)" class="mini-action-btn delete" title="Eliminar">
                                                    <Trash2 :size="14" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Users Tab -->
                <div v-if="activeTab === 'users'" class="tab-content animator-fade-in">
                     <div class="section-card shadow-premium">
                        <div class="section-header">
                            <h2>Directorio de Usuarios</h2>
                        </div>
                        <div class="table-container">
                            <table class="modern-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Acceso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="u in users" :key="u.id">
                                        <td class="bold-cell">{{ (u.first_name && u.last_name) ? (u.first_name + ' ' + u.last_name) : (u.first_name || u.name || u.username) }}</td>
                                        <td>{{ u.email || u.username }}</td>
                                        <td>
                                            <span :class="['role-pill', u.role === '1' || u.role === 1 || u.role === 'admin' ? 'admin' : 'customer']">
                                                {{ u.role === '1' || u.role === 1 || u.role === 'admin' ? 'Admin' : 'Cliente' }}
                                            </span>
                                        </td>
                                        <td><span class="active-dot"></span> Online</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Reviews Tab -->
                <div v-if="activeTab === 'reviews'" class="tab-content animator-fade-in">
                    <div class="section-card shadow-premium">
                        <div class="section-header">
                            <h2>Reseñas de Clientes</h2>
                            <div class="search-bar-inline">
                                <Search :size="16" class="search-icon" />
                                <input v-model="reviewsSearch" placeholder="Buscar autor..." class="premium-inline-input">
                            </div>
                        </div>
                        <div class="table-container">
                            <table class="modern-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Comentario</th>
                                        <th>Rating</th>
                                        <th>Fijar</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="r in testimonials" :key="r.id">
                                        <td class="bold-cell">{{ r.name }}</td>
                                        <td class="comment-cell">{{ r.text }}</td>
                                        <td class="stars-cell">
                                            <div class="star-rating">
                                                <svg v-for="i in 5" :key="i" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" :class="{ 'star-filled': i <= (r.stars || 5), 'star-empty': i > (r.stars || 5) }"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                            </div>
                                        </td>
                                        <td>
                                            <button @click="toggleTestimonialSelection(r)" :class="{ pinned: r.is_pinned }" class="pin-btn">
                                                <Pin :size="16" />
                                                <span>{{ r.is_pinned ? "Destacado" : "Fijar" }}</span>
                                            </button>
                                        </td>
                                        <td>
                                            <button @click="deleteTestimonial(r.id)" class="action-btn delete">
                                                <Trash2 :size="16" />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                    </div>
                </div>
            </div>

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
                                <select v-model="currentProduct.is_featured">
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
    </div>
</template>

<style scoped>
.admin-page-container {
    background-color: var(--bg-color);
    padding-bottom: 80px;
}

/* ── Integrated Horizontal Navigation ──────────────────────── */
.admin-horizontal-nav {
    background: white;
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0; /* Adjust if your main header is also sticky */
    z-index: 100;
    box-shadow: 0 4px 12px var(--shadow-color);
    margin-bottom: 40px;
}

.nav-tabs-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.nav-tabs-wrapper button {
    background: transparent;
    border: none;
    padding: 20px 16px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    transition: all 0.25s ease;
}

.nav-tabs-wrapper button:hover {
    color: var(--primary-color);
    background: rgba(44, 85, 48, 0.03);
}

.nav-tabs-wrapper button.active {
    color: var(--primary-color);
}

.nav-tabs-wrapper button.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--primary-color);
    border-radius: 4px 4px 0 0;
}

.admin-brand-mini {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 20px;
}

.admin-brand-mini span {
    font-family: 'Playfair Display', serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--primary-color);
}

.tabs-group {
    display: flex;
    gap: 4px;
}

.admin-header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.user-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-color);
    padding: 4px 12px 4px 4px;
    border-radius: 50px;
    border: 1px solid var(--border-color);
}

.avatar-xs {
    width: 24px;
    height: 24px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.7rem;
}

.user-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-color);
}

/* ── Dashboard Content ─────────────────────────────────────── */
.dashboard-section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 30px;
}

.breadcrumb-mini {
    font-size: 0.85rem;
    color: var(--text-light);
    letter-spacing: 0.5px;
}

.breadcrumb-mini strong {
    color: var(--primary-color);
    font-weight: 800;
}

.quick-actions {
    display: flex;
    gap: 12px;
}

.search-box-premium {
    position: relative;
    display: flex;
    align-items: center;
}

.search-box-premium svg {
    position: absolute;
    left: 14px;
    color: var(--text-light);
}

.mini-search {
    padding: 10px 15px 10px 42px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    font-size: 0.85rem;
    width: 200px;
    transition: 0.3s;
}

.mini-search:focus {
    width: 260px;
    border-color: var(--primary-color);
    outline: none;
}

.refresh-pill {
    background: white;
    border: 1px solid var(--border-color);
    padding: 10px 18px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: var(--text-muted);
    transition: 0.3s;
}

.refresh-pill:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--bg-color);
}

/* ── Dashboard Content ─────────────────────────────────────── */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 30px;
}

.metric-card {
    background: white; border-radius: 20px; padding: 24px;
    display: flex; align-items: center; gap: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.metric-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.metric-icon.orders { background: #eef2ff; color: #4338ca; }
.metric-icon.revenue { background: #f0fdf4; color: #15803d; }
.metric-icon.products { background: #fff7ed; color: #c2410c; }
.metric-icon.clients { background: #faf5ff; color: #7e22ce; }

.m-label { display: block; font-size: 0.75rem; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
.m-value { font-size: 1.6rem; font-weight: 800; color: #234027; font-family: 'Playfair Display', serif; }

.dashboard-grid-dual {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 30px;
}

.chart-box, .activity-box {
    background: white; border-radius: 24px; padding: 30px;
}

.box-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 25px; }
.box-header h3 { font-size: 1.2rem; margin: 0; color: #234027; }
.box-header span { font-size: 0.8rem; color: #999; }

.activity-list { display: flex; flex-direction: column; gap: 15px; }
.activity-item { display: flex; align-items: center; gap: 15px; padding-bottom: 15px; border-bottom: 1px solid #f9f9f9; }
.activity-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.activity-icon.atendido { background: #e6fffa; color: #38b2ac; }
.activity-icon.pendiente { background: #fffaf0; color: #ed8936; }
.activity-details { flex: 1; }
.activity-details p { margin: 0; font-size: 0.85rem; }
.activity-details span { font-size: 0.75rem; color: #999; }
.activity-amount { font-weight: 700; color: #234027; }

/* ── Modern Table ──────────────────────────────────────────── */
.section-card { background: white; border-radius: 24px; padding: 40px; margin-bottom: 40px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.section-header h2 { font-size: 1.8rem; font-family: 'Playfair Display', serif; margin: 0; }

.modern-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
.modern-table th { padding: 15px 20px; text-align: left; font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 1px; }
.modern-table tbody tr { background: #fff; transition: 0.2s; }
.modern-table tbody tr:hover { transform: scale(1.01); box-shadow: 0 8px 25px rgba(0,0,0,0.05); }
.modern-table td { padding: 12px 20px; border-top: 1px solid #f5f5f5; border-bottom: 1px solid #f5f5f5; }
.modern-table td:first-child { border-left: 1px solid #f5f5f5; border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
.modern-table td:last-child { border-right: 1px solid #f5f5f5; border-top-right-radius: 16px; border-bottom-right-radius: 16px; }

.id-pill { background: #f0f0f0; padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; }
.feat-pill { background: #f0f0f0; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
.feat-pill.pinned { background: #fef3c7; color: #d97706; }

.action-btn { width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; transition: 0.2s; background: #f9f9f9; color: #666; }
.action-btn:hover { background: #234027; color: white; }
.action-btn.delete:hover { background: #e76f51; }

.status-select-wrapper select { border: none; background: transparent; font-weight: 700; outline: none; cursor: pointer; }
.status-select-wrapper select.atendido { color: #38b2ac; }
.status-select-wrapper select.pendiente { color: #ed8936; }

.img-preview-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    overflow: hidden;
    background: #f0f0f0;
}

.img-preview-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* ── Compact Table (Inventory) ───────────────────────────── */
.compact-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 4px;
}

.compact-table th {
    padding: 10px 15px;
    text-align: left;
    font-size: 0.7rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #eee;
}

.product-row {
    background: white;
    transition: background 0.2s;
}

.product-row:hover {
    background: #fdfdfd;
}

.product-row td {
    padding: 8px 15px;
    border-bottom: 1px solid #f9f9f9;
    vertical-align: middle;
}

.compact-thumb {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
    background: #f0f0f0;
    border: 1px solid #eee;
}

.compact-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-info-compact {
    display: flex;
    flex-direction: column;
}

.p-title {
    font-weight: 700;
    color: #234027;
    font-size: 0.9rem;
}

.p-id {
    font-size: 0.7rem;
    color: #aaa;
}

.p-price {
    font-weight: 700;
    color: #15803d;
    font-size: 0.85rem;
}

.compact-cat-pill {
    font-size: 0.7rem;
    padding: 2px 8px;
    background: #f0f4f0;
    color: #234027;
    border-radius: 4px;
    font-weight: 600;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-indicator.featured {
    color: #d97706;
}

.status-indicator.normal {
    color: #888;
}

.row-actions {
    display: flex;
    gap: 6px;
}

.mini-action-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid #eee;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.2s;
    color: #666;
}

.mini-action-btn:hover {
    background: #234027;
    color: white;
    border-color: #234027;
}

.mini-action-btn.delete:hover {
    background: #e76f51;
    border-color: #e76f51;
}

/* ── Modal & Fixes ─────────────────────────────────────────── */
.modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-card { background: white; width: 700px; padding: 50px; border-radius: 32px; box-shadow: 0 30px 80px rgba(0,0,0,0.2); }

/* ── Inputs & Selects Premium ─────────────────────────────── */
.premium-inline-input, .top-search-input {
    width: 100%;
    border: 1.5px solid var(--border-color, #eee);
    padding: 10px 14px 10px 40px;
    border-radius: 12px;
    background: #fff;
    font-size: 0.9rem;
    color: #1C1917;
    transition: 0.3s;
}

.premium-inline-input:focus, .top-search-input:focus {
    border-color: #234027;
    box-shadow: 0 0 0 4px rgba(35, 64, 39, 0.08);
    outline: none;
}

.modern-select {
    appearance: none;
    -webkit-appearance: none;
    background: #f9f9f9;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 16px;
    padding: 8px 30px 8px 12px;
    border: 1px solid #eee;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
    transition: 0.3s;
}

.modern-select:hover { border-color: #234027; background-color: #fff; }

.star-rating { display: flex; gap: 2px; }
.star-filled { color: #e9c46a; }
.star-empty { color: #eee; }

.btn-secondary-outline {
    background: white; border: 1.5px solid #234027; color: #234027;
    padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 0.85rem;
    cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px;
}
.btn-secondary-outline:hover { background: #234027; color: white; }

.search-bar-inline { position: relative; width: 250px; }
.search-bar-inline svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #ccc; pointer-events: none; }
.search-bar-inline input { width: 100%; padding: 10px 15px 10px 40px; border: 1.5px solid #eee; border-radius: 10px; outline: none; font-size: 0.85rem; }
.search-bar-inline input:focus { border-color: #234027; }

.animator-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.btn-primary-admin {
    background: #234027; color: white; border: none; padding: 12px 24px;
    border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px;
    transition: 0.3s;
}
.btn-primary-admin:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(35, 64, 39, 0.2); }
</style>
