import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Importante para as notificações!

// Nossas páginas
import Home from './pages/Home'; 
import ClientLogin from './pages/ClientLogin';
import Register from './pages/Register';
import ClientMenu from './pages/ClientMenu';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <Router>
      {/* Componente que mostra as notificações elegantes no ecrã todo */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '12px',
          },
        }} 
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<ClientLogin />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/cardapio" element={<ClientMenu />} />
        <Route path="/acesso-restrito-admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;