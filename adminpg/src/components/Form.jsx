import React, { useState } from "react";

function Formulario({ titulo, campos, textoBoton, onClick }) {
    const [valores, setValores] = useState({});

    const manejarCambio = (e) => {
        setValores({
            ...valores,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl/30 w-full max-w-md border border-gray-200">
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
            <button
                type="button"
                onClick={() => onClick(valores)}
                className="w-full mt-8 bg-blue-600 shadow-lg shadow-blue-600/50 text-white font-semibold py-2.5 cursor-pointer rounded-lg shadow-md hover:bg-blue-800 transition-all duration-300"
            >
                {textoBoton}
            </button>
        </div>
    );
}

export default Formulario;
