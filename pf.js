document.addEventListener("DOMContentLoaded", () => {
    const usuarioActivo = localStorage.getItem("usuarioActivo");
    const imgElement = document.getElementById("avatar-menu");
    const btnAvatar = document.getElementById("btn-avatar");
    const dropdown = document.getElementById("user-dropdown");
    const btnLogout = document.getElementById("btn-logout");


    if (imgElement) {
        if (usuarioActivo) { 
            imgElement.src = `./${usuarioActivo}.png`;
            imgElement.style.display = "block";
            imgElement.style.width = "5dvh";
            imgElement.style.height = "5dvh";
            imgElement.style.borderRadius = "50%";
            imgElement.style.objectFit = "cover";
        } else {
            window.location.href = "./ins.html"; 
        }
    }


    if (btnAvatar && dropdown) {
        btnAvatar.addEventListener("click", (e) => {
            e.stopPropagation(); 
            dropdown.classList.toggle("show");
        });


        document.addEventListener("click", () => {
            if (dropdown.classList.contains("show")) {
                dropdown.classList.remove("show");
            }
        });
    }

    
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {

            localStorage.removeItem("usuarioActivo");
            localStorage.removeItem("fotoUsuario");

            Swal.fire({
                icon: 'info',
                title: 'Sesión cerrada',
                text: 'Has salido del sistema correctamente.',
                showConfirmButton: false,
                timer: 1500,
                background: '#1a1a1a',
                color: '#fff'
            }).then(() => {
                window.location.href = "./ins.html"; 
            });
        });
    }
});
