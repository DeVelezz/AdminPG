import React from "react";
import ImgFondo from "./ImgFondo";
import imagen from "../../public/img/imagen.png";

function SectionImg(){
    return(
        <ImgFondo>
            <img src={imagen} alt={"Imagen de fondo"} className="w-full h-full object-cover " />
            <div className="absolute text-center text-white">
                <h1 className="text-3xl font-bold">¡Bienvenido a AdminPG!</h1>
                <p className="text-xl font-semibold">Tu plataforma de administración</p>
            </div>
        </ImgFondo>
    );
}

export default SectionImg;