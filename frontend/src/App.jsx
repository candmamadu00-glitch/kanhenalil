import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação das nossas páginas (certifique-se de que os nomes estão corretos)
import ClientLogin from './pages/ClientLogin';
import Register from './pages/Register';
import ClientMenu from './pages/ClientMenu';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin'; // A nova página de segurança

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas (Clientes) */}
        <Route path="/" element={<ClientLogin />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/cardapio" element={<ClientMenu />} />

        {/* Rota Oculta (Administrador) */}
        {/* O cliente normal não sabe que este link existe */}
        <Route path="/acesso-restrito-admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Se alguém tentar aceder a um link que não existe, volta ao login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;