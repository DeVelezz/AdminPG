import './App.css';
import Swal from 'sweetalert2';
import PageRegistro from './components/PageRegistro';
import { Routes, Route } from 'react-router-dom';
import  Index  from './components/Index';
import  PageLogin  from './components/PageLogin';
import PageAdmin from './components/PageAdmin';
import PageActualizarInfo from './components/PageActualizarInfo';
import PageMora from './components/PageMora';


function App() {
  // const manejarClick = () => {
  //   Swal.fire({
  //     title: 'Buen trabajo',
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
          }/>

          <Route path='/login' element={
            <>
              <PageLogin/>
            </>
          }/>

          <Route path='/admin' element={
            <>
              <PageAdmin/>
            </>
          }/>

          <Route path='/actualizar' element={
            <>
              <PageActualizarInfo/>
            </>
          }/>

          <Route path='/mora' element={
            <>
              <PageMora/>
            </>
          }/>

        </Routes>

      </div>
    </>

  )
}

export default App
