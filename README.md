# Dulce Fé - Aplicación Web

Este proyecto ha sido migrado de una Landing Page estática a una **Aplicación Web moderna construida con Vue 3 y Vite**, siguiendo una arquitectura basada en **Domain-Driven Design (DDD)** para garantizar escalabilidad, orden y facilidad de mantenimiento.

## 📂 Estructura del Proyecto

La organización del código está diseñada para separar las "responsabilidades del negocio" (dominios) de los "componentes reutilizables" (shared).

### 1. `src/domains/` (Lógica de Negocio)
Aquí vive el núcleo de tu aplicación. Cada carpeta representa un área específica de tu negocio. Si en el futuro quieres añadir "Ventas" o "Reservas", crearías nuevas carpetas aquí sin afectar lo demás.

*   **`marketing/`**: Todo lo relacionado con atraer la atención del cliente.
    *   `Hero.vue`: La sección principal de bienvenida con la imagen de fondo.
    *   `Marquee.vue`: La cinta de texto en movimiento ("Descubre el mundo dulce...").
*   **`brand/`**: La identidad de tu marca.
    *   `AboutSection.vue`: La sección "Sobre Nosotros" o "Nuestra Historia".
*   **`catalog/`**: Tus productos y servicios.
    *   `ServicesSection.vue`: Muestra el listado de servicios/postres con sus precios.
*   **`contact/`**: Cómo te contactan los clientes.
    *   `ContactForm.vue`: El formulario de contacto funcional.

### 2. `src/shared/` (Reutilizable)
Aquí están los elementos que **no** son específicos de un solo dominio, sino que se usan en toda la aplicación o sirven de base.

*   **`layout/`**: Estructuras principales de la página.
    *   `Header.vue`: La barra de navegación superior (se mantiene fija y cambia de color al hacer scroll).
    *   `Footer.vue`: El pie de página con información legal y de contacto.
*   **`ui/`**: Componentes de Interfaz de Usuario genéricos.
    *   `Modal.vue`: La "Ventana Flotante" que se abre al dar clic en "Leer más". Es dinámica y puede mostrar contenido diferente según quién la llame.

### 3. Archivos Raíz Importantes
*   **`App.vue`**: Es el "Director de Orquesta". Importa todos los componentes de los dominios y el layout (Header/Footer) y los ensambla en la página final. También controla el estado global del Modal.
*   **`main.js`**: El punto de entrada de Vue.
*   **`style.css`**: Estilos globales, variables de colores (Beige, Terracotta, Dark) y resets CSS.

### 4. Otras Carpetas
*   **`public/`**: Archivos estáticos que no cambian, como imágenes (`assets/ejemplo.avif`).
*   **`_old_landing/`**: Una copia de seguridad completa de tu antigua página estática (HTML/CSS puro) por si necesitas consultar cómo era antes.

---

## 🚀 Cómo Funciona

1.  **Componentes**: Cada parte de la web es un archivo `.vue` independiente. Esto significa que si quieres cambiar el "Hero", solo tocas `Hero.vue` y no rompes el resto de la página.
2.  **Reactividad**: El `Header` detecta automáticamente cuando bajas la página para cambiar su transparencia. El `Modal` espera una señal (`emit`) desde cualquier botón para abrirse con la información correcta.
3.  **Escalabilidad**: Gracias a esta estructura, cuando quieras agregar un **Carrito de Compras**, simplemente crearemos `src/domains/sales/` y ahí pondremos toda la lógica de ventas, manteniendo todo ordenado.

## 🛠 Comandos Disponibles

*   `npm run dev`: Inicia el servidor de desarrollo (para trabajar localmente).
*   `npm run build`: Construye la aplicación optimizada para producción (para subir a internet).
