import React from "react";

function BotonSecundary({ textoBtn, onClick }) {
    return (
        <button
            onClick={onClick}
            className="text-blue-600 font-semibold px-4 py-2 rounded-md border-2 border-blue-600 bg-white hover:bg-blue-600 hover:text-white hover:shadow-xl/20 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
            {textoBtn}
        </button>
    );
}

export default BotonSecundary;