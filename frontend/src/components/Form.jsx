import React, { useState } from "react";

export default function Formulario({ titulo, campos, textoBoton, onClick, onVolver }) {
    const [valores, setValores] = useState({});

    const manejarCambio = (e) => {
        setValores({
            ...valores,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="bg-white p-10 rounded-2xl shadow-xl/30 w-xl max-w-3xl min-h-[500px] mx-auto border border-gray-200 flex flex-col justify-between">
            <h2 className="text-3xl font-bold text-blue-600 text-center cursor-pointer mb-8">{titulo}</h2>
            <div className="space-y-6">
                {campos.map((campo, i) => (
                    <div key={i} className="relative">
                        <label
                            htmlFor={campo.nombre}
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            {campo.label}
                        </label>
                        <input
                            type={campo.tipo}
                            name={campo.nombre}
                            placeholder={campo.placeholder}
                            value={valores[campo.nombre] || ""}
                            onChange={manejarCambio}
                            required={campo.requerido}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-end items-center mt-6 space-x-4">
                {onVolver && (
                    <button
                        type="button"
                        onClick={onVolver}
                        className="px-4 py-2.5 bg-gray-300 text-gray-800 shadow-lg rounded-lg cursor-pointer font-semibold hover:bg-gray-400 transition-all duration-300">
                        Volver
                    </button>
                )}


                <button
                    type="button"
                    onClick={() => onClick(valores)}
                    className="px-4 bg-blue-600 shadow-lg shadow-blue-600/50 text-white font-semibold py-2.5 cursor-pointer rounded-lg hover:bg-blue-800 transition-all duration-300">
                    {textoBoton}
                </button>
            </div>
        </div>
    );
}
