import React, { useState, useEffect } from "react";
import useService from '../services/useService';
import Swal from 'sweetalert2';
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import { getUsuario, saveSession } from '../utils/sessionManager';

export default function PageActualizarInfo() {
    // Estado para los campos y la página actual
    const [page, setPage] = useState(1);
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        telefono: '',
        actual: '',
        nueva: '',
        confirmar: ''
    });

    useEffect(() => {
        // Intentar cargar usuario desde sessionStorage/localStorage
        try {
            const u = getUsuario();
            if (u) {
                setForm(form => ({ ...form, nombre: u.nombre || '', email: u.email || '', telefono: u.telefono || '' }));
            }
        } catch {
            // no hay usuario guardado
        }
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.nueva && form.nueva !== form.confirmar) {
            return Swal.fire({ icon: 'warning', title: 'Contraseñas', text: 'La nueva contraseña y su confirmación no coinciden.' });
        }

        try {
            const u = getUsuario() || {};
            const id = u.id;
            if (!id) return Swal.fire({ icon: 'error', title: 'Error', text: 'No hay usuario identificado.' });

            const body = {
                nombre: form.nombre,
                email: form.email,
                telefono: form.telefono,
            };
            if (form.nueva) body.password = form.nueva;

            await useService.updateUser(id, body);
            
            // actualizar sesión con los nuevos datos
            const updatedUser = { ...u, nombre: form.nombre, email: form.email, telefono: form.telefono };
            const currentToken = localStorage.getItem('token'); // Mantener el token actual
            saveSession(currentToken, updatedUser);
            
            // Notificar a otras pestañas que se ha actualizado el usuario
            localStorage.setItem('userUpdated', JSON.stringify({
                userId: id,
                timestamp: Date.now()
            }));
            
            // Mostrar mensaje de éxito y redirigir
            await Swal.fire({ 
                icon: 'success', 
                title: 'Listo', 
                text: 'Información actualizada correctamente.',
                timer: 1500,
                showConfirmButton: false
            });
            
            // Redirigir a la página de admin
            window.location.href = '/admin';
        } catch (err) {
            console.error('Error actualizando info:', err);
            Swal.fire({ icon: 'error', title: 'Error', text: typeof err === 'string' ? err : 'No se pudo actualizar la información.' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* HEADER */}
            <SectionHeader>
                <Logo />
                <BotonSecundary textoBtn="Volver" onClick={() => window.location.href = "/admin"} />
            </SectionHeader>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 relative">
                <ImgFondo>
                    <img
                        src="/img/imagen.png"
                        alt="Imagen de fondo"
                        className="w-full h-full object-cover brightness-75 absolute inset-0"
                    />

                    {/* FORMULARIO CENTRADO SIN SCROLL */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30vw] max-w-xl">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-full">
                            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">Editar Perfil</h2>
                            <form onSubmit={handleSubmit}>
                                {/* Paso 1: Datos personales */}
                                {page === 1 && (
                                    <>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={form.nombre}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={form.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                            <input
                                                type="tel"
                                                name="telefono"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={form.telefono}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </>
                                )}
                                {/* Paso 2: Contraseñas y botones */}
                                {page === 2 && (
                                    <>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                                            <input
                                                type="password"
                                                name="actual"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={form.actual}
                                                onChange={handleChange}
                                                placeholder="Ingresa tu contraseña actual"
                                                required
                                            />
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                                            <input
                                                type="password"
                                                name="nueva"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={form.nueva}
                                                onChange={handleChange}
                                                placeholder="Dejar vacío para mantener actual"
                                            />
                                        </div>
                                        <div className="mb-8">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                                            <input
                                                type="password"
                                                name="confirmar"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={form.confirmar}
                                                onChange={handleChange}
                                                placeholder="Confirma la nueva contraseña"
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors shadow-sm"
                                            >
                                                Guardar Cambios
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium transition-colors shadow-sm"
                                                onClick={() => window.location.href = "/admin"}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </>
                                )}
                                {/* Controles de paginación */}
                                <div className="flex justify-between mt-8">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Anterior
                                    </button>
                                    <span className="font-semibold">Paso {page} de 2</span>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === 2}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ImgFondo>
            </main>

            {/* FOOTER */}
            <SectionFooter />
        </div>
    );
}