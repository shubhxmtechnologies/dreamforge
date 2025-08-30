import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignUp from './components/Auth/Signup.jsx'
import LoginPage from './components/Auth/Login.jsx'
import Gallery from './components/Gallery.jsx'
import { AuthProvider } from './utils/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter >
    <AuthProvider>
      <Routes>
        <Route element={<App />} path='/' />
        <Route element={<SignUp />} path='/signup' />
        <Route element={<LoginPage />} path='/login' />
        <Route element={<Gallery />} path='/gallery' />
      </Routes>
      <ToastContainer />
    </AuthProvider>
  </BrowserRouter>

)
