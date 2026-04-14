import { reactive } from 'vue';

export const workshopStore = reactive({
    items: [
        {
            id: 1,
            title: "Masterclass: Decoración de Tortas",
            date: "20 Diciembre, 2024",
            time: "10:00 AM - 2:00 PM",
            price: "S/ 150.00",
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            description: "Aprende técnicas avanzadas de alisado, bordes perfectos y uso de boquillas. Descubrirás los secretos para lograr un acabado profesional en cada piso de tus tortas. Incluye todos los materiales, recetario impreso y certificado de participación."
        },
        {
            id: 2,
            title: "Taller de Barismo en Casa",
            date: "28 Diciembre, 2024",
            time: "4:00 PM - 7:00 PM",
            price: "S/ 80.00",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            description: "Descubre cómo preparar el café perfecto sin máquinas costosas y sorprende a todos en casa. Aprenderemos sobre distintos tipos de granos, métodos de filtrado manual, y las bases del texturizado de leche con prensas francesas."
        }
    ],
    
    getWorkshopById(id) {
        return this.items.find(w => w.id === parseInt(id));
    }
});
