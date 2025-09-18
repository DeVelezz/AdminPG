import React from "react";

function Logo({ redirectTo = "/admin" }) {
    const handleLogoClick = () => {
        window.location.href = redirectTo;
    };

    return (
        <p 
            className="text-blue-600 font-bold text-3xl cursor-pointer hover:text-blue-800 transition-colors"
            onClick={handleLogoClick}
        >
            ¡AdminPG!
        </p>
    );
}

export default Logo;