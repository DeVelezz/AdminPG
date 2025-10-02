import React, { useState } from "react";

export default function Formulario({ titulo, campos, textoBoton, onSubmit, onVolver, valoresIniciales = {} }) {
    const [valores, setValores] = useState(valoresIniciales);

    const handleChange = (e) => {
        setValores({
            ...valores,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(valores);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-xl/30 w-xl max-w-3xl min-h-[500px] mx-auto border border-gray-200 flex flex-col justify-between">
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
                        
                        {campo.tipo === "select" ? (
                            <select
                                name={campo.nombre}
                                onChange={handleChange}
                                required={campo.requerido}
                                value={valores[campo.nombre] || ""}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                            >
                                <option value="" disabled>
                                    {campo.placeholder}
                                </option>
                                {campo.opciones?.map((opcion, idx) => (
                                    <option key={idx} value={opcion.value}>
                                        {opcion.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={campo.tipo}
                                name={campo.nombre}
                                placeholder={campo.placeholder}
                                onChange={handleChange}
                                required={campo.requerido}
                                value={valores[campo.nombre] || ""}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        )}
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
                    type="submit"
                    className="px-4 bg-blue-600 shadow-lg shadow-blue-600/50 text-white font-semibold py-2.5 cursor-pointer rounded-lg hover:bg-blue-800 transition-all duration-300">
                    {textoBoton}
                </button>
            </div>
        </form>
    );
}