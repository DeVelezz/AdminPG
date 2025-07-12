import React from "react";

function BotonSecundary({ textoBtn, onClick }) {
    return (
        <button
            onClick={onClick}
            className="text-blue-600 font-semibold px-4 py-2 rounded-md border-2 border-blue-600 transition-colors duration-300 bg-white hover:bg-blue-600 hover:text-white">
            {textoBtn}
        </button>
    );
}

export default BotonSecundary;