import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import CreateProject from './pages/CreateProject'
import Dashboard from './pages/Dashboard'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return isAuthenticated ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return !isAuthenticated ? children : <Navigate to="/dashboard" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/create-project" element={
          <ProtectedRoute><CreateProject /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}