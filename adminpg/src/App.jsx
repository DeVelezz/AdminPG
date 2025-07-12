import './App.css'
import Swal from 'sweetalert2'
import PageRegistro from './components/PageRegistro'
import { Routes, Route } from 'react-router-dom'
import  Index  from './components'



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
    <>
      <div>
        <Routes>
          <Route path='/' element={
            <>
              <Index/>
            </>
          }/>

          <Route path='/registro' element={
            <>
              <PageRegistro/>
            </>
          }
          
          />

        </Routes>

      </div>
    </>

  )
}

export default App
