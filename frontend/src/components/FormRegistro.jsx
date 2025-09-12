import React, { useState } from "react";
import Formulario from "./Form"; // tu componente
import Swal from "sweetalert2";
import useService from "../services/useService";

export default function Registro({ onSave, onCancel }) {
    const [paso, setPaso] = useState(1);
    const [datosUsuario, setDatosUsuario] = useState({});
    const [datosResidente, setDatosResidente] = useState({});

    // Campos solo para usuario residente
    const camposUsuario = [
        { nombre: "nombre", label: "Nombre", tipo: "text", placeholder: "Tu nombre", requerido: true },
        { nombre: "email", label: "Correo electrónico", tipo: "email", placeholder: "tucorreo@mail.com", requerido: true },
        { nombre: "contraseña", label: "Contraseña", tipo: "password", placeholder: "********", requerido: true },
    ];

    const camposResidente = [
        { nombre: "telefono", label: "Teléfono", tipo: "text", placeholder: "Ej: 3214567890", requerido: true },
        { nombre: "propiedad_id", label: "Propiedad ID", tipo: "text", placeholder: "Ej: 1", requerido: true },
    ];

    const volverPaso1 = () => {
        setPaso(1);
    };

    const manejarPaso1 = (valores) => {
        setDatosUsuario(valores);
        setPaso(2);
        const datosResidenteIniciales = {
            telefono: "",
            propiedad_id: ""
        };
        setDatosResidente(datosResidenteIniciales);
    };


    const manejarPaso2 = async (datosRol) => {

        const datosCompletos = {
            ...datosUsuario,
            ...datosRol
        };

        try {
            await useService.createUser(datosCompletos);
            Swal.fire({
                icon: 'success',
                title: 'Registro exitoso',
                text: 'Residente registrado correctamente.',
                timer: 3000,
                timerProgressBar: true,
            });
            onSave(); // Llama a la función onSave pasada como prop
        } catch (error) {

            if (error === "Email ya registrado") {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de registro',
                    text: 'El correo electrónico ya está registrado. Por favor, usa otro.',
                    confirmButtonText: 'Aceptar',
                    timer: 3000,
                    timerProgressBar: true,
                });
                return;
            }

            if (error === "Faltan campos requeridos") {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de registro',
                    text: 'Por favor completa todos los campos requeridos.',
                    confirmButtonText: 'Aceptar',
                    timer: 3000,
                    timerProgressBar: true,
                });
                return;
            }


            console.error("Error al registrar residente:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al registrar',
                text: error.response?.data?.message || "Error desconocido al registrar residente",
                confirmButtonText: 'Aceptar',
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            {paso === 1 && (
                <Formulario
                    titulo="Registro - Paso 1"
                    campos={camposUsuario}
                    textoBoton="Continuar"
                    onSubmit={manejarPaso1}
                    valoresIniciales={datosUsuario}
                />
            )}
            {paso === 2 && (
                <Formulario
                    titulo="Datos del Residente"
                    campos={camposResidente}
                    textoBoton="Registrar"
                    onSubmit={manejarPaso2}
                    onVolver={volverPaso1}
                // valoresIniciales={}
                />
            )}
        </div>
    );
}
