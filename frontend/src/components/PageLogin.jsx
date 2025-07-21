import BotonSecundary from './BotonSecundary'
import SectionHeader from './SectionHeader'
import SectionImg from './SectionImg'
import Logo from './Logo'
import ImgFondo from './ImgFondo'
import imagen from '../../public/img/imagen.png'
import SectionFooter from './SectionFooter'

export default function PageLogin() {
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