import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAgTZgWQ8NgtApamTSbEXqyQiWMjnAx4fM",
  authDomain: "deluxemx-74336.firebaseapp.com",
  projectId: "deluxemx-74336",
  storageBucket: "deluxemx-74336.firebasestorage.app",
  messagingSenderId: "10726894454",
  appId: "1:10726894454:web:5dfa3534679fe6a435a857",
  measurementId: "G-R2R94N3J55"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Diccionarios de traducción
const traducciónPrepas = {
    "enp1": "ENP 1", "enp2": "ENP 2", "enp3": "ENP 3", "enp4": "ENP 4",
    "enp5": "ENP 5", "enp6": "ENP 6", "enp7": "ENP 7", "enp8": "ENP 8",
    "enp9": "ENP 9", "cch_azc": "CCH Azcapotzalco", "cch_nau": "CCH Naucalpan",
    "cch_oriente": "CCH Oriente", "cch_sur": "CCH Sur", "cch_vallejo": "CCH Vallejo"
};

const traducciónMetodos = {
    "trj": "Tarjeta",
    "fct": "Efectivo"
};

// Instancias globales de las gráficas
let chartPrepasInstance = null;
let chartMetodosInstance = null;
let chartHorariosInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    // Obtener el usuario directamente del localStorage manejado por pf.js
    const usuarioActivo = localStorage.getItem("usuarioActivo");

    if (!usuarioActivo) {
        // pf.js ya redirige si detecta que no hay usuario, pero mantenemos una salvaguarda limpia
        return;
    }

    // Mostrar el nombre del usuario activo en el encabezado
    const displayElement = document.getElementById("nombre-usuario-display");
    if (displayElement) {
        displayElement.textContent = usuarioActivo;
    }

    // Cargar estadísticas filtradas por el usuario activo
    cargarEstadisticasUsuario(usuarioActivo);
});

function cargarEstadisticasUsuario(usuario) {
    const boletosRef = collection(db, "boletos");
    
    // Consulta filtrada en Firestore por el campo "usuario"
    const q = query(boletosRef, where("usuario", "==", usuario));

    onSnapshot(q, (snapshot) => {
        let totalTransacciones = 0;
        let totalBoletos = 0;
        const prepasContador = {};
        const metodosContador = { "Tarjeta": 0, "Efectivo": 0 };
        const horasContador = Array(24).fill(0);

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const cantidad = Number(data.cantidadBoletos) || 0;
            
            totalTransacciones++;
            totalBoletos += cantidad;

            // Conteo por escuela / prepa
            const prepaNombre = traducciónPrepas[data.prepa] || data.prepa || "N/A";
            prepasContador[prepaNombre] = (prepasContador[prepaNombre] || 0) + cantidad;

            // Conteo por método de pago
            const metodoNombre = traducciónMetodos[data.metodoPago] || "Otros";
            if (metodosContador[metodoNombre] !== undefined) {
                metodosContador[metodoNombre] += cantidad;
            } else {
                metodosContador[metodoNombre] = cantidad;
            }

            // Conteo por hora de registro
            if (data.fechaRegistro && data.fechaRegistro.toDate) {
                const hora = data.fechaRegistro.toDate().getHours();
                horasContador[hora]++;
            }
        });

        // Actualizar Tarjetas KPI
        const elTransacciones = document.getElementById("kpi-transacciones");
        const elBoletos = document.getElementById("kpi-boletos-totales");
        const elTotalBadge = document.getElementById("total-registros-user");
        const elTopPrepa = document.getElementById("kpi-top-prepa");
        const elTopMetodo = document.getElementById("kpi-top-metodo");

        if (elTransacciones) elTransacciones.textContent = totalTransacciones;
        if (elBoletos) elBoletos.textContent = totalBoletos;
        if (elTotalBadge) elTotalBadge.textContent = `Estatus: ${totalBoletos} boletos registrados`;

        // Escuela más registrada
        const topPrepaKey = Object.keys(prepasContador).reduce((a, b) => 
            prepasContador[a] > prepasContador[b] ? a : b, "");
        if (elTopPrepa) {
            elTopPrepa.textContent = topPrepaKey !== "" ? topPrepaKey : "Sin registros";
        }

        // Método de pago favorito
        if (elTopMetodo) {
            if (totalTransacciones === 0) {
                elTopMetodo.textContent = "Sin registros";
            } else {
                elTopMetodo.textContent = metodosContador["Tarjeta"] >= metodosContador["Efectivo"] ? "Tarjeta" : "Efectivo";
            }
        }

        // Renderizar o actualizar las gráficas
        renderizarGraficaPrepas(prepasContador);
        renderizarGraficaMetodos(metodosContador);
        renderizarGraficaHorarios(horasContador);
    }, (error) => {
        console.error("Error al obtener estadísticas del usuario:", error);
    });
}

// Configuración global de estilos para Chart.js
Chart.defaults.color = '#ffffff';
Chart.defaults.font.family = 'Montserrat';

function renderizarGraficaPrepas(datosPrepa) {
    const canvas = document.getElementById('chartPrepas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (chartPrepasInstance) chartPrepasInstance.destroy();

    chartPrepasInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(datosPrepa),
            datasets: [{
                label: 'Boletos Registrados',
                data: Object.values(datosPrepa),
                backgroundColor: 'rgba(233, 198, 0, 0.6)',
                borderColor: 'rgb(233, 198, 0)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderizarGraficaMetodos(datosMetodo) {
    const canvas = document.getElementById('chartMetodos');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (chartMetodosInstance) chartMetodosInstance.destroy();

    chartMetodosInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(datosMetodo),
            datasets: [{
                data: Object.values(datosMetodo),
                backgroundColor: ['#64b5f6', '#81c784'],
                borderColor: ['#2196f3', '#4caf50'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15 } }
            }
        }
    });
}

function renderizarGraficaHorarios(datosHoras) {
    const canvas = document.getElementById('chartHorarios');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (chartHorariosInstance) chartHorariosInstance.destroy();

    const horasLabels = Array.from({length: 24}, (_, i) => `${i}:00`);

    chartHorariosInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: horasLabels,
            datasets: [{
                label: 'Frecuencia de Registros',
                data: datosHoras,
                fill: true,
                backgroundColor: 'rgba(233, 198, 0, 0.15)',
                borderColor: 'rgb(233, 198, 0)',
                tension: 0.3,
                pointBackgroundColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
        }
    });
}