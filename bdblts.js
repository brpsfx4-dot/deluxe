import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    query, 
    orderBy, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const traducciónPrepas = {
    "enp1": "ENP 1 - Gabino Barreda",
    "enp2": "ENP 2 - Erasmo Castellanos Quinto",
    "enp3": "ENP 3 - Justo Sierra",
    "enp4": "ENP 4 - Vidal Alcocer",
    "enp5": "ENP 5 - José Vasconcelos",
    "enp6": "ENP 6 - Antonio Caso",
    "enp7": "ENP 7 - Ezequiel A. Chávez",
    "enp8": "ENP 8 - Miguel E. Schulz",
    "enp9": "ENP 9 - Pedro de Alba",
    "cch_azc": "CCH Azcapotzalco",
    "cch_nau": "CCH Naucalpan",
    "cch_oriente": "CCH Oriente",
    "cch_sur": "CCH Sur",
    "cch_vallejo": "CCH Vallejo"
};

const traducciónMetodos = {
    "trj": "Tarjeta",
    "fct": "Efectivo"
};

let todosLosBoletos = [];

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("tabla-boletos-body");
    const contadorRegistros = document.getElementById("total-registros");

    const inputSearch = document.getElementById("filter-search");
    const selectPrepa = document.getElementById("filter-prepa");
    const selectMetodo = document.getElementById("filter-metodo");
    const inputUsuario = document.getElementById("filter-usuario");
    const btnReset = document.getElementById("btn-reset-filters");

    if (!tbody) return;

    const boletosRef = collection(db, "boletos");
    const q = query(boletosRef, orderBy("fechaRegistro", "desc"));

    onSnapshot(q, (snapshot) => {
        todosLosBoletos = [];
        let index = 1;

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Formatear Fecha
            let fechaTexto = "Sin fecha";
            if (data.fechaRegistro && data.fechaRegistro.toDate) {
                const fechaObj = data.fechaRegistro.toDate();
                fechaTexto = fechaObj.toLocaleDateString("es-MX", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            todosLosBoletos.push({
                numeroRegistro: index++,
                id: docSnap.id,
                cliente: data.nombreCliente || 'Sin nombre',
                cantidadBoletos: data.cantidadBoletos || 0,
                prepaKey: data.prepa || '',
                prepaTexto: traducciónPrepas[data.prepa] || data.prepa || "N/A",
                metodoKey: data.metodoPago || '',
                metodoTexto: traducciónMetodos[data.metodoPago] || data.metodoPago || "N/A",
                usuario: data.usuario || 'Anónimo',
                fechaTexto: fechaTexto
            });
        });

        aplicarFiltros();
    }, (error) => {
        console.error("Error al obtener boletos:", error);
        tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">Error al consultar los registros.</td></tr>`;
    });

    function renderizarTabla(lista) {
        tbody.innerHTML = "";

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">No se encontraron resultados.</td></tr>`;
            if (contadorRegistros) contadorRegistros.textContent = `Mostrando: 0 de ${todosLosBoletos.length}`;
            return;
        }

        if (contadorRegistros) {
            contadorRegistros.textContent = `Mostrando: ${lista.length} de ${todosLosBoletos.length}`;
        }

        lista.forEach((item) => {
            const claseMetodo = item.metodoKey === "trj" ? "tarjeta" : "efectivo";
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.numeroRegistro}</td>
                <td><strong>${item.cliente}</strong></td>
                <td>${item.cantidadBoletos}</td>
                <td>${item.prepaTexto}</td>
                <td><span class="badge-metodo ${claseMetodo}">${item.metodoTexto}</span></td>
                <td>${item.usuario}</td>
                <td>${item.fechaTexto}</td>
            `;

            tbody.appendChild(row);
        });
    }

    function aplicarFiltros() {
        const valSearch = inputSearch ? inputSearch.value.trim().toLowerCase() : "";
        const valPrepa = selectPrepa ? selectPrepa.value : "";
        const valMetodo = selectMetodo ? selectMetodo.value : "";
        const valUsuario = inputUsuario ? inputUsuario.value.trim().toLowerCase() : "";

        const resultado = todosLosBoletos.filter((item) => {
            const coincideSearch = valSearch === "" || 
                item.cliente.toLowerCase().includes(valSearch) || 
                item.numeroRegistro.toString().includes(valSearch);

            const coincidePrepa = valPrepa === "" || item.prepaKey === valPrepa;

            const coincideMetodo = valMetodo === "" || item.metodoKey === valMetodo;

            const coincideUsuario = valUsuario === "" || item.usuario.toLowerCase().includes(valUsuario);

            return coincideSearch && coincidePrepa && coincideMetodo && coincideUsuario;
        });

        renderizarTabla(resultado);
    }

    inputSearch?.addEventListener("input", aplicarFiltros);
    selectPrepa?.addEventListener("change", aplicarFiltros);
    selectMetodo?.addEventListener("change", aplicarFiltros);
    inputUsuario?.addEventListener("input", aplicarFiltros);

    btnReset?.addEventListener("click", () => {
        if (inputSearch) inputSearch.value = "";
        if (selectPrepa) selectPrepa.value = "";
        if (selectMetodo) selectMetodo.value = "";
        if (inputUsuario) inputUsuario.value = "";
        aplicarFiltros();
    });
});