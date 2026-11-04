import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CarsPage from './pages/CarsPage'
import RegisterCarPage from './pages/RegisterCarPage'

function HomeRoute() {
  return sessionStorage.getItem('authToken')
    ? <Navigate to="/cars" replace />
    : <LandingPage />
}

function LoginRoute() {
  return sessionStorage.getItem('authToken')
    ? <Navigate to="/cars" replace />
    : <LoginPage />
}

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return sessionStorage.getItem('authToken')
    ? children
    : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/cars"
          element={<AuthenticatedRoute><CarsPage /></AuthenticatedRoute>}
        />
        <Route
          path="/cars/register"
          element={<AuthenticatedRoute><RegisterCarPage /></AuthenticatedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
