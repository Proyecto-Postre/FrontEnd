<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => [
      { nombre: 'Red Velvet', ventas: 45 },
      { nombre: 'Chocolate Intenso', ventas: 30 },
      { nombre: 'Cheesecake Frutos', ventas: 25 },
      { nombre: 'Tarta de Limón', ventas: 18 }
    ]
  }
});

const chartData = computed(() => ({
  labels: props.data.map(d => d.nombre),
  datasets: [
    {
      label: 'Ventas por Producto',
      backgroundColor: '#2C5530', // Forest Green
      borderRadius: 12,
      data: props.data.map(d => d.ventas)
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#F8F4EE',
      titleColor: '#1C1917',
      bodyColor: '#1C1917',
      borderColor: '#2C5530',
      borderWidth: 1,
      padding: 12,
      displayColors: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11
        }
      }
    }
  }
};
</script>

<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 300px;
  width: 100%;
}
</style>
