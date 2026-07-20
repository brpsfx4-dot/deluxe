// --- VALIDACIÓN EXCLUSIVA PARA ANGEL (DUEÑO) ---
const nombreLimpio = (datosUser.usuario || "").trim().toLowerCase();
const rolLimpio = (datosUser.rol || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Comprobamos que el usuario sea exactamente "angel" y su rol sea "dueno"
const esAngelDueno = nombreLimpio === "angel" && rolLimpio === "dueno";

// Opción alternativa más directa (agrega el enlace al final del dropdown):
if (esAngelDueno && dropdown) {
    if (!document.getElementById("btn-control-cuentas")) {
        const linkControl = document.createElement("a");
        linkControl.href = "./ctrl.html";
        linkControl.id = "btn-control-cuentas";
        linkControl.textContent = "Control de cuentas";

        // Si existe btnLogout, lo pone antes; si no, lo añade al final del dropdown
        if (btnLogout && dropdown.contains(btnLogout)) {
            dropdown.insertBefore(linkControl, btnLogout);
        } else {
            dropdown.appendChild(linkControl);
        }
    }
}
