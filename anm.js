import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const usuarioInput = document.getElementById('usuario');
const passwordInput = document.getElementById('password');
const botonEnviar = document.querySelector('.login-form .btinc');
const txt1 = document.querySelector('.login-form .input-group label');

function verificarCampos() {
    if (usuarioInput.value.trim() !== "" && passwordInput.value.trim() !== "") {
        botonEnviar.classList.add('active');
        if (txt1) txt1.classList.add('active');
    } else {
        botonEnviar.classList.remove('active');
        if (txt1) txt1.classList.remove('active');
    }
}

usuarioInput.addEventListener('input', verificarCampos);
passwordInput.addEventListener('input', verificarCampos);

botonEnviar.addEventListener('click', (e) => {
    e.preventDefault();

    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value.trim();

    if (usuario === "" || password === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, llena todos los campos.',
            confirmButtonColor: '#d33',
            background: '#1a1a1a',
            color: '#fff'
        });
        return;
    }

    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("usuario", "==", usuario), where("password", "==", password));

    getDocs(q)
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const datosUsuario = querySnapshot.docs[0].data();
                
                localStorage.setItem("usuarioActivo", datosUsuario.usuario);
                localStorage.setItem("fotoUsuario", datosUsuario.foto || "https://via.placeholder.com/150");

                Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido, ${usuario}!`,
                    text: 'Acceso concedido con éxito.',
                    showConfirmButton: false,
                    timer: 1500,
                    background: '#1a1a1a',
                    color: '#fff',
                }).then(() => {
                    window.location.href = "./s1.html";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de acceso',
                    text: 'Usuario o contraseña incorrectos.',
                    confirmButtonColor: '#d33',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        })
        .catch((error) => {
            console.error("Error al consultar la base de datos:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error interno',
                text: 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#d33',
                background: '#1a1a1a',
                color: '#fff'
            });
        });
});

