import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Nossas páginas
import Home from './pages/Home'; // O NOVO SITE DESLUMBRANTE
import ClientLogin from './pages/ClientLogin';
import Register from './pages/Register';
import ClientMenu from './pages/ClientMenu';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <Router>
      <Routes>
        {/* O site principal de apresentação */}
        <Route path="/" element={<Home />} />

        {/* Rotas do Sistema de Clientes */}
        <Route path="/login" element={<ClientLogin />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/cardapio" element={<ClientMenu />} />

        {/* Rota Oculta (Administrador) */}
        <Route path="/acesso-restrito-admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Se alguém tentar aceder a um link que não existe, volta para a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;