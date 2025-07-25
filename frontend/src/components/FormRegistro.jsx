import React, { use, useState } from "react";
import Formulario from "./Form"; // tu componente
import Swal from "sweetalert2";
import useService from "../services/useService";

export default function Registro(onSave, onCancel) {
    const [paso, setPaso] = useState(1);
    const [rolSeleccionado, setRolSeleccionado] = useState("");
    const [datosUsuario, setDatosUsuario] = useState({});

    const camposUsuario = [
        { nombre: "nombre", label: "Nombre", tipo: "text", placeholder: "Tu nombre", requerido: true },
        { nombre: "email", label: "Correo electrónico", tipo: "email", placeholder: "tucorreo@mail.com", requerido: true },
        { nombre: "contraseña", label: "Contraseña", tipo: "password", placeholder: "********", requerido: true },
        { nombre: "rol", label: "Rol", tipo: "text", placeholder: "residente o administrador", requerido: true },
    ];

    const camposResidente = [
        { nombre: "telefono", label: "Teléfono", tipo: "text", placeholder: "Ej: 3214567890", requerido: true },
        { nombre: "propiedad_id", label: "Propiedad ID", tipo: "text", placeholder: "Ej: 1", requerido: true },
    ];

    const camposAdministrador = [
        { nombre: "telefono", label: "Teléfono", tipo: "text", placeholder: "Ej: 3214567890", requerido: true },
        { nombre: "cargo", label: "Cargo", tipo: "text", placeholder: "Ej: Administrador general", requerido: true },
        { nombre: "direccion_oficina", label: "Dirección de oficina", tipo: "text", placeholder: "Ej: Calle 123", requerido: false },
    ];


    const volverPaso1 = () => {
        setPaso(1);
    };

    const manejarPaso1 = (valores) => {
        setDatosUsuario(valores);
        setRolSeleccionado(valores.rol);
        setPaso(2);
    };

    const manejarPaso2 = async (datosRol) => {
        const datosCompletos = { ...datosUsuario, ...datosRol };

        // Aquí podrías hacer el fetch al backend
        const handleSubmit = async (e) => {
            e.preventDefault();

            if(!datosCompletos.nombre || !datosCompletos.email || !datosCompletos.contraseña || !datosCompletos.rol) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Por favor completa todos los campos requeridos.',
                    confirmButtonText: 'Aceptar',
                    timer: 3000,
                    timerProgressBar: true,
                });
                return;
            }
            try{
                await useService.createUser(datosCompletos);
                Swal.fire({
                    icon: 'success',
                    title: 'Registro exitoso',
                    text: 'Usuario registrado correctamente.',
                    timer: 3000,
                    timerProgressBar: true,
                });
                onSave(); // Llama a la función onSave pasada como prop
            }
            catch(error){
                console.error("Error al registrar usuario:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al registrar',
                    text: error.response?.data?.message || "Error desconocido al registrar usuario",
                    confirmButtonText: 'Aceptar',
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            {paso === 1 && (
                <Formulario
                    titulo="Registro - Paso 1"
                    campos={camposUsuario}
                    textoBoton="Continuar"
                    onClick={manejarPaso1}
                />
            )}
            {paso === 2 && rolSeleccionado === "residente" && (
                <Formulario
                    titulo="Datos del Residente"
                    campos={camposResidente}
                    textoBoton="Registrar"
                    onClick={manejarPaso2}
                    onVolver={volverPaso1}
                />
            )}
            {paso === 2 && rolSeleccionado === "administrador" && (
                <Formulario
                    titulo="Datos del Administrador"
                    campos={camposAdministrador}
                    textoBoton="Registrar"
                    onClick={manejarPaso2}
                    onVolver={volverPaso1}
                />
            )}
        </div>
    );
}