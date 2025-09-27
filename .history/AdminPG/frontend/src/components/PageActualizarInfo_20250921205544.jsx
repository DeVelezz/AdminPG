import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";

export default function PageActualizarInfo() {
    // Estado para los campos y la página actual
    const [page, setPage] = useState(1);
    const [form, setForm] = useState({
        nombre: "Admin Principal",
        email: "admin@adminpg.com",
        telefono: "321-555-0100",
        actual: "",
        nueva: "",
        confirmar: ""
    });

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = e => {
        e.preventDefault();
        alert("Información actualizada");
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
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-112">
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
                                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded shadow hover:bg-gray-600 font-medium"
                                            >
                                                Guardar Cambios
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded shadow hover:bg-gray-600 font-medium"
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
                                        className="px-4 py-2 bg-blue-300 text-black-700 rounded shadow hover:bg-gray-400"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Anterior
                                    </button>
                                    <span className="font-semibold">Paso {page} de 2</span>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-blue-300 text-black-700 rounded shadow hover:bg-gray-400"
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