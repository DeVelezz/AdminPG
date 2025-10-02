import React from "react";

function BotonSecundary({ textoBtn, onClick, withBackground = false }) {
    // Si se solicita el fondo, renderizamos un wrapper que usa la misma imagen de fondo
    // que otros modales/páginas para mantener consistencia visual.
    if (withBackground) {
        const fondoUrl = new URL('/img/imagen.png', import.meta.url).href;
        return (
            <div className="relative inline-block rounded-md overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center brightness-75"
                    style={{ backgroundImage: `url('${fondoUrl}')`, backgroundColor: '#0b1220' }}
                    aria-hidden="true"
                />
                <button
                    onClick={onClick}
                    className="relative z-10 text-white font-semibold px-4 py-2 rounded-md border-2 border-blue-600 bg-blue-600/80 hover:bg-blue-700/80 transition delay-150 duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[1.03]"
                >
                    {textoBtn}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            className="text-blue-600 font-semibold px-4 py-2 rounded-md border-2 border-blue-600 bg-white hover:bg-blue-600 hover:text-white hover:shadow-xl/20 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
            {textoBtn}
        </button>
    );
}

export default BotonSecundary;