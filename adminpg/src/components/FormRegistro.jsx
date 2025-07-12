
import React from "react";
import Formulario from "./Form";

function FormRegistro() {
    return (
        <Formulario
            titulo="Registro"
            textoBoton="Crear Cuenta"
            campos={[
                { nombre: "nombre", label: "Nombre", tipo: "text", placeholder: "Tu nombre completo", requerido: true },
                { nombre: "correo", label: "Correo", tipo: "email", placeholder: "ejemplo@correo.com", requerido: true },
                { nombre: "clave", label: "Contraseña", tipo: "password", placeholder: "Tu contraseña", requerido: true }
            ]}
            onClick={(datos) => {
                console.log("Registro con:", datos);
                // Aquí va tu lógica para registrar al usuario
            }} 
        />
    );
}

export default FormRegistro;
