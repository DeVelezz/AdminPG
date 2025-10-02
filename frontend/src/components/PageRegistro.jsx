import React from "react";
import ImgFondo from "./ImgFondo";
import FormRegistro from "./FormRegistro";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import SectionFooter from "./SectionFooter";
import SectionImg from "./SectionImg";

function PageRegistro() {
    return (
        <>
            <SectionHeader>
                <div className="ml-2">
                    <Logo />
                </div>
                <div className="flex space-x-2">
                    <BotonSecundary textoBtn="Inicio" onClick={() => window.location.href = "/"} />
                    <BotonSecundary textoBtn="Iniciar sesión" onClick={() => window.location.href = "/login"} />
                </div>
            </SectionHeader>

            <ImgFondo>
                <img src="/img/imagen.png" alt="Imagen de fondo" className="w-full h-screen object-cover brightness-75" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {/* handleRegistroExitoso integrado para evitar console.log inline */}
                    <FormRegistro onSave={() => { alert('Registro exitoso'); window.location.href = '/login'; }} />
                </div>
            </ImgFondo>

            {/* <SectionFooter /> */}
        </>
    );
}

export default PageRegistro;