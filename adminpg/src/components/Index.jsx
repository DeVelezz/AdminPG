import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import ImgFondo from "./ImgFondo";
import SectionHeader from "./SectionHeader";
import SectionHeader from "./SectionHeader";
import SectionImg from "./SectionImg";
import imagen from '../../public/img/imagen.png'


export function Index() {
    return (
        <>
            <SectionHeader>
                <div className="ml-2">
                    <Logo />
                </div>

                <div className="flex space-x-6">
                    <Link to="/registro" className="font-medium hover:text-blue-600 hover:underline ease-in-out duration-300" >
                        Registrate
                    </Link>
                    <Link to="/login" className="font-medium hover:text-blue-600 hover:underline ease-in-out duration-300" >
                        Inicia Sesion
                    </Link>
                </div>
            </SectionHeader>

            <SectionImg>
                <ImgFondo>
                    <img src={imagen} alt={"Imagen de fondo"} className="w-full h-full object-cover " />
                    <div className="absolute text-center text-white">
                        <h1 className="text-3xl font-bold">¡Bienvenido a AdminPG!</h1>
                        <p className="text-xl font-semibold">Tu plataforma de administración</p>
                    </div>
                </ImgFondo>
            </SectionImg>
        </>
    )
}