import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

const COSTO_BOLETO_BASE = 175.00; 
let porcentajeComisionUsuario = 0.0; 

let idCoincidenciaActiva = null;
let porcentajeComisionCoincidencia = 0.0;

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

const formRegistro = document.querySelector('form.login-formbl:not([onsubmit])');
const selectPrepa = document.getElementById('Prepa');
const inputNombre = document.getElementById('nmcl');
const inputCantidad = document.getElementById('ctnbl');
const selectMetodoPago = document.getElementById('mtdpg');
const inputCostoTotal = document.getElementById('ctnbl_tot');
const inputComision = document.getElementById('cmsn');

const selectPrepa2 = document.getElementById('prp2');
const inputNombre2 = document.getElementById('nmcl2');
const inputCantidad2 = document.getElementById('ctnbl2');
const selectMetodoPago2 = document.getElementById('mtdpg2');
const inputCostoTotal2 = document.getElementById('ctnbl_tot2');
const inputComision2 = document.getElementById('cmsn2');
const inputUsuario2 = document.getElementById('usuario2');

const btnEditar = document.getElementById('btn-editar-coincidencia');
const btnEliminar = document.getElementById('btn-eliminar-coincidencia');

document.addEventListener("DOMContentLoaded", async () => {
    const usuarioActivo = localStorage.getItem("usuarioActivo");
    if (usuarioActivo) {
        try {
            const usuariosRef = collection(db, "usuarios");
            const q = query(usuariosRef, where("usuario", "==", usuarioActivo.trim()));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const datosUser = querySnapshot.docs[0].data();
                porcentajeComisionUsuario = parseFloat(datosUser.comision) || 0.0;
                console.log(`Comisión cargada para ${usuarioActivo}: ${porcentajeComisionUsuario * 100}%`);
            } else {
                console.warn(`El usuario "${usuarioActivo}" no se encontró en la base de datos.`);
            }
        } catch (error) {
            console.error("Error al obtener la comisión del usuario:", error);
        }
    }
});

function calcularValores() {
    const cantidad = parseInt(inputCantidad.value) || 0;
    
    if (cantidad <= 0) {
        inputCostoTotal.value = "";
        inputComision.value = "";
        return;
    }

    const total = cantidad * COSTO_BOLETO_BASE;
    const comisionCalculada = total * porcentajeComisionUsuario;

    inputCostoTotal.value = total.toFixed(2);
    inputComision.value = comisionCalculada.toFixed(2);
}

function calcularValoresCoincidencia() {
    const cantidad = parseInt(inputCantidad2.value) || 0;
    
    if (cantidad <= 0) {
        inputCostoTotal2.value = "";
        inputComision2.value = "";
        return;
    }

    const total = cantidad * COSTO_BOLETO_BASE;
    const comisionCalculada = total * porcentajeComisionCoincidencial;

    inputCostoTotal2.value = total.toFixed(2);
    inputComision2.value = comisionCalculada.toFixed(2);
}

if (inputCantidad) {
    inputCantidad.addEventListener('input', calcularValores);
}

if (inputCantidad2) {
    inputCantidad2.addEventListener('input', () => {
        // Al editar la cantidad en coincidencias, recalculamos en tiempo real
        const cantidad = parseInt(inputCantidad2.value) || 0;
        const total = cantidad * COSTO_BOLETO_BASE;
        const comisionCalculada = total * porcentajeComisionCoincidencia;
        inputCostoTotal2.value = total.toFixed(2);
        inputComision2.value = comisionCalculada.toFixed(2);
    });
}

if (inputNombre) {
    let timeoutBusqueda = null;

    inputNombre.addEventListener('input', () => {
        clearTimeout(timeoutBusqueda);
        const nombreABuscar = inputNombre.value.trim();

        if (nombreABuscar.length < 3) {
            limpiarFormularioCoincidencias();
            return;
        }

        timeoutBusqueda = setTimeout(async () => {
            try {
                const boletosRef = collection(db, "boletos");
                const q = query(boletosRef, where("nombreCliente", "==", nombreABuscar));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docActivo = querySnapshot.docs[0];
                    idCoincidenciaActiva = docActivo.id; // Almacenamos el ID de Firebase
                    const datosCoincidentes = docActivo.data();
                    
                    if (selectPrepa2) selectPrepa2.value = datosCoincidentes.prepa || "";
                    if (inputNombre2) inputNombre2.value = datosCoincidentes.nombreCliente || "";
                    if (inputCantidad2) inputCantidad2.value = datosCoincidentes.cantidadBoletos || "0";
                    if (selectMetodoPago2) selectMetodoPago2.value = datosCoincidentes.metodoPago || ""; 
                    if (inputCostoTotal2) inputCostoTotal2.value = parseFloat(datosCoincidentes.costoTotal).toFixed(2) || "0.00";
                    if (inputComision2) inputComision2.value = parseFloat(datosCoincidentes.comision).toFixed(2) || "0.00";
                    if (inputUsuario2) inputUsuario2.value = datosCoincidentes.usuario || "";

                    const totalBoletoVal = parseFloat(datosCoincidentes.costoTotal) || 1;
                    const comisionVal = parseFloat(datosCoincidentes.comision) || 0;
                    porcentajeComisionCoincidencia = comisionVal / totalBoletoVal;

                    if (btnEditar) btnEditar.disabled = false;
                    if (btnEliminar) btnEliminar.disabled = false;

                    Swal.fire({
                        icon: 'info',
                        title: 'Coincidencia en base de datos',
                        text: `Se encontró un registro activo para "${nombreABuscar}".`,
                        background: '#1a1a1a',
                        color: '#fff',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                } else {
                    limpiarFormularioCoincidencias();
                }
            } catch (error) {
                console.error("Error al buscar coincidencias en Firestore:", error);
            }
        }, 600);
    });
}

function limpiarFormularioCoincidencias() {
    idCoincidenciaActiva = null;
    porcentajeComisionCoincidencia = 0.0;
    
    if (selectPrepa2) {
        selectPrepa2.value = "";
        selectPrepa2.disabled = true;
    }
    if (inputNombre2) {
        inputNombre2.value = "";
        inputNombre2.readOnly = true;
    }
    if (inputCantidad2) {
        inputCantidad2.value = "";
        inputCantidad2.readOnly = true;
    }
    if (selectMetodoPago2) {
        selectMetodoPago2.value = "";
        selectMetodoPago2.disabled = true;
    }
    if (inputCostoTotal2) inputCostoTotal2.value = "";
    if (inputComision2) inputComision2.value = "";
    if (inputUsuario2) inputUsuario2.value = "";

    if (btnEditar) {
        btnEditar.textContent = "Editar";
        btnEditar.disabled = true;
    }
    if (btnEliminar) btnEliminar.disabled = true;
}

if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const prepa = selectPrepa.value;
        const nombre = inputNombre.value.trim();
        const cantidad = parseInt(inputCantidad.value);
        const metodoPago = selectMetodoPago.value;
        
        const costoTotal = parseFloat(inputCostoTotal.value) || 0;
        const comision = parseFloat(inputComision.value) || 0;
        const usuarioActivo = localStorage.getItem("usuarioActivo") || "Anonimo";

        if (!prepa || prepa === "slcc" || !metodoPago || metodoPago === "slcc" || nombre === "" || isNaN(cantidad) || cantidad <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, selecciona una preparatoria, un método de pago y llena todos los datos del cliente.',
                confirmButtonColor: '#d33',
                background: '#1a1a1a',
                color: '#fff'
            });
            return;
        }

        try {
            const boletosRef = collection(db, "boletos");
            const qDuplicado = query(
                boletosRef, 
                where("nombreCliente", "==", nombre),
                where("prepa", "==", prepa)
            );
            const checkSnapshot = await getDocs(qDuplicado);

            if (!checkSnapshot.empty) {
                Swal.fire({
                    icon: 'error',
                    title: 'Coincidencia ya existente',
                    text: `Ya existe un registro con el nombre de "${nombre}" para la preparatoria seleccionada.`,
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#d33',
                    background: '#1a1a1a',
                    color: '#fff'
                });
                return;
            }

            const nuevoBoleto = {
                prepa: prepa,
                nombreCliente: nombre,
                cantidadBoletos: cantidad,
                metodoPago: metodoPago,
                costoTotal: costoTotal,
                comision: comision,
                usuario: usuarioActivo,
                fechaRegistro: serverTimestamp()
            };

            await addDoc(collection(db, "boletos"), nuevoBoleto);

            Swal.fire({
                icon: 'success',
                title: 'Registro Exitoso',
                text: `El boleto de ${nombre} ha sido ingresado correctamente.`,
                background: '#1a1a1a',
                color: '#fff'
            });

            formRegistro.reset();
            limpiarFormularioCoincidencias();

        } catch (error) {
            console.error("Error al dar de alta el boleto:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Red',
                text: 'No se pudo conectar con Firebase para procesar el registro.',
                background: '#1a1a1a',
                color: '#fff'
            });
        }
    });
}

if (btnEditar) {
    btnEditar.addEventListener('click', async () => {
        if (!idCoincidenciaActiva) return;

        if (btnEditar.textContent === "Editar") {
            selectPrepa2.disabled = false;
            inputNombre2.readOnly = false;
            inputCantidad2.readOnly = false;
            selectMetodoPago2.disabled = false;
            
            btnEditar.textContent = "Guardar";
            btnEditar.style.border = "1px solid #00ff66";
            btnEditar.style.color = "#00ff66";
        } else {
            const prepaEditada = selectPrepa2.value;
            const nombreEditado = inputNombre2.value.trim();
            const cantidadEditada = parseInt(inputCantidad2.value);
            const metodoPagoEditado = selectMetodoPago2.value;
            const costoTotalEditado = parseFloat(inputCostoTotal2.value) || 0;
            const comisionEditada = parseFloat(inputComision2.value) || 0;

            if (!prepaEditada || !metodoPagoEditado || nombreEditado === "" || isNaN(cantidadEditada) || cantidadEditada <= 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos inválidos',
                    text: 'Por favor complete correctamente todos los campos antes de guardar la edición.',
                    background: '#1a1a1a',
                    color: '#fff'
                });
                return;
            }

            try {
                const boletoDocRef = doc(db, "boletos", idCoincidenciaActiva);
                await updateDoc(boletoDocRef, {
                    prepa: prepaEditada,
                    nombreCliente: nombreEditado,
                    cantidadBoletos: cantidadEditada,
                    metodoPago: metodoPagoEditado,
                    costoTotal: costoTotalEditado,
                    comision: comisionEditada
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Registro Actualizado',
                    text: 'Los datos del boleto se han modificado con éxito.',
                    background: '#1a1a1a',
                    color: '#fff'
                });

                limpiarFormularioCoincidencias();
                if (formRegistro) formRegistro.reset();

            } catch (error) {
                console.error("Error al actualizar boleto:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: 'No se pudieron guardar los cambios en la base de datos.',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        }
    });
}

if (btnEliminar) {
    btnEliminar.addEventListener('click', async () => {
        if (!idCoincidenciaActiva) return;

        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción eliminará el registro de boleto permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const boletoDocRef = doc(db, "boletos", idCoincidenciaActiva);
                    await deleteDoc(boletoDocRef);

                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El boleto ha sido borrado correctamente.',
                        background: '#1a1a1a',
                        color: '#fff'
                    });

                    limpiarFormularioCoincidencias();
                    if (formRegistro) formRegistro.reset();

                } catch (error) {
                    console.error("Error al eliminar boleto:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de Red',
                        text: 'No se pudo eliminar el boleto de Firestore.',
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                }
            }
        });
    });
}