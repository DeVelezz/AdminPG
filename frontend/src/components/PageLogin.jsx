import BotonSecundary from './BotonSecundary'
import SectionHeader from './SectionHeader'
import SectionImg from './SectionImg'
import Logo from './Logo'
import ImgFondo from './ImgFondo'
import imagen from '../../public/img/imagen.png'
import SectionFooter from './SectionFooter'
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Form from './Form';

export default function PageLogin({ onLogin }) {

    const campos = [
        { nombre: "correo", label: "Correo", tipo: "email", placeholder: "Tu correo", requerido: true },
        { nombre: "password", label: "Contraseña", tipo: "password", placeholder: "Tu contraseña", requerido: true }
    ];

    const { email, setEmail } = useState('');
    const [contraseña, setContraseña] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:3000/api/login', { email, contraseña });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('Usuario', JSON.stringify(res.data.usuario));

            onLogin(res.data.usuario);

        } catch (error) {
            if (error === 'Usuario no encontrado') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de login',
                    text: 'Usuario no encontrado',
                    timer: 3000,
                    timerProgressBar: true,
                });
            }

            if (error === 'Faltan campos requeridos') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de login',
                    text: 'Faltan campos requeridos',
                    timer: 3000,
                    timerProgressBar: true,
                });
            }

            console.error(err.response?.data?.msg || "Error en login");
        }

    }

    return (
        <>
            <SectionHeader>
                <div className="ml-2">
                    <Logo />
                </div>
                <div className="flex space-x-2">
                    <BotonSecundary textoBtn="Inicio" onClick={() => window.location.href = "/"} />
                    <BotonSecundary textoBtn="Registrate" onClick={() => window.location.href = "/registro"} />                </div>
            </SectionHeader>
            <ImgFondo>
                <img src={imagen} alt="Imagen de fondo" className="w-full h-screen object-cover brightness-75" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

                </div>
            </ImgFondo>

            {/* <SectionFooter /> */}
        </>
    )
}