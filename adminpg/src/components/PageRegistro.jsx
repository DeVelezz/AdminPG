import React from "react";
import ImgFondo from "./ImgFondo";
import FormRegistro from "./FormRegistro";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import imagen from "../../public/img/imagen.png";

function PageRegistro() {
    return (
        <>
            <SectionHeader>
                <div className="ml-2">
                    <Logo />
                </div>
                <div className="flex space-x-2">
                    <BotonSecundary textoBtn="Inicio" onClick={()=> window.location.href="/"}/>
                    <BotonSecundary textoBtn="Iniciar sesión" onClick={() => window.location.href = "/login"} />
                </div>
            </SectionHeader>

            <ImgFondo>
                <img src={imagen} alt="Imagen de fondo" className="w-full h-screen object-cover brightness-75" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <FormRegistro />
                </div>
            </ImgFondo>
        </>
    );
}

export default PageRegistro;