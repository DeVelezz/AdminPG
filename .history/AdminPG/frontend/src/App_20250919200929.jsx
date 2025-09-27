import './App.css';
import Swal from 'sweetalert2';
import PageRegistro from './components/PageRegistro';
import { Routes, Route } from 'react-router-dom';
import  Index  from './components/Index';
import  PageLogin  from './components/PageLogin';
import PageAdmin from './components/PageAdmin';


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

        </Routes>

      </div>
    </>

  )
}

export default App
