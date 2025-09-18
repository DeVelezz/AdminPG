import React from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";

export default function PageActualizarInfo() {
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

                    {/* FORMULARIO CENTRADO CON SCROLL ELEGANTE */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-112 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">Editar Perfil</h2>
                            
                            <form>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue="Admin Principal"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue="admin@adminpg.com"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue="321-555-0100"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ingresa tu contraseña actual"
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Dejar vacío para mantener actual"
                                    />
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Confirma la nueva contraseña"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-medium"
                                        onClick={() => alert("Información actualizada")}
                                    >
                                        Guardar Cambios
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 px-4 py-3 bg-gray-500 text-white rounded shadow hover:bg-gray-600 font-medium"
                                        onClick={() => window.location.href = "/admin"}
                                    >
                                        Cancelar
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