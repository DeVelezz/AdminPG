import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Formulario from "./Form";
import Swal from "sweetalert2";
import useService from "../services/useService";

export default function Registro() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [datosUsuario, setDatosUsuario] = useState({});

    // Campos para el paso 1: datos del usuario
    const camposUsuario = [
        { nombre: "nombre", label: "Nombre", tipo: "text", placeholder: "Tu nombre", requerido: true },
        { nombre: "email", label: "Correo electrónico", tipo: "email", placeholder: "tucorreo@mail.com", requerido: true },
        { nombre: "contraseña", label: "Contraseña", tipo: "password", placeholder: "********", requerido: true },
    ];

    // Campos para el paso 2: datos del residente (corregidos)
    const camposResidente = [
        { nombre: "telefono", label: "Teléfono", tipo: "text", placeholder: "Ej: 3214567890", requerido: true },
        { nombre: "torre", label: "Torre", tipo: "text", placeholder: "Ej: A, B, C", requerido: true },
        { nombre: "apartamento", label: "Apartamento", tipo: "text", placeholder: "Ej: 101, 202", requerido: true },
        { 
            nombre: "genero", 
            label: "Género", 
            tipo: "select", 
            placeholder: "Selecciona tu género", 
            requerido: true,
            opciones: [
                { value: "masculino", label: "Masculino" },
                { value: "femenino", label: "Femenino" },
                { value: "otro", label: "Otro" }
            ]
        },
    ];

    const volverPaso1 = () => {
        setPaso(1);
    };

    const manejarPaso1 = (valores) => {
        setDatosUsuario(valores);
        setPaso(2);
    };

    const manejarPaso2 = async (datosRol) => {
        const datosCompletos = {
            ...datosUsuario,
            ...datosRol
        };

        try {
            await useService.createUser(datosCompletos);
            
            await Swal.fire({
                icon: 'success',
                title: 'Registro exitoso',
                text: 'Residente registrado correctamente.',
                timer: 2000,
                timerProgressBar: true,
            });
            
            // Redirigir al login
            navigate('/login');
            
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
                />
            )}
        </div>
    );
}