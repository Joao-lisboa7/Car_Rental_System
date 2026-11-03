import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CarsPage from './pages/CarsPage'
import RegisterCarPage from './pages/RegisterCarPage'

function App() {
  const isAuthenticated = Boolean(sessionStorage.getItem('authToken'))

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/cars" replace /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/cars" replace /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/cars"
          element={isAuthenticated ? <CarsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/cars/register"
          element={isAuthenticated ? <RegisterCarPage /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/cars' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
