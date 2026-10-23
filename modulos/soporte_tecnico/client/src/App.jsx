import { AuthProvider } from './context/AuthContext.jsx'
import { ToastContainer } from 'react-toastify'
import AppRoutes from './router/AppRoutes.jsx'

export default function App () {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  )
}
