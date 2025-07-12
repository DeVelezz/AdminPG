import './App.css'
import Swal from 'sweetalert2'
import Header from './components/Header'
import SectionImg from './components/SectionImg'
import Footer from './components/SectionFooter'
import FormRegistro from './components/FormRegistro'
import BotonSecundary from './components/BotonSecundary'
import PageRegistro from './components/PageRegistro'

function App() {
  // const manejarClick = () => {
  //   Swal.fire({
  //     title: 'Buen traabjo',
  //     text: 'Has hecho clic en el botón',
  //     icon: 'success',
  //     confirmButtonText: 'Aceptar',
  //     confirmButtonColor: '#3085d6',
  //   });
  // }

  return (
    <div> 
      <Header/>
      <section>
        <SectionImg/>
      </section>
      <section>
        <Footer/>
      </section>
      <section>
      <PageRegistro/>
        {/* <FormRegistro/> */}
      </section>
      {/* <BotonSecundary textoBtn="ola" onClick={() => Swal.fire('Hola', 'Has hecho clic en el botón', 'success')} /> */}

    </div>
    
  )
}

export default App
