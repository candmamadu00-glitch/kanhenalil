import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Download, Share } from 'lucide-react'; 
import { supabase } from '../supabase'; 

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // Estados para instalação do App
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Escuta Android para mostrar o botão de instalar
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e); 
    });

    // 2. Detecta se é um iPhone/iPad e se ainda NÃO está instalado
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = ('standalone' in window.navigator) && window.navigator.standalone;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }
  }, []);

  const instalarAppAndroid = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null); 
    }
  };

  const fazerLoginAdmin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) {
        setErro('Credenciais inválidas. Acesso não autorizado.');
      } else {
        navigate('/admin');
      }
    } catch (error) {
      setErro('Erro de conexão. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Guinea-Bissau.svg')" }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
      
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-[#F97316] relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-[#F97316]/20 p-4 rounded-full">
            <ShieldCheck size={48} className="text-[#F97316]" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Acesso Restrito
        </h1>
        <p className="text-center text-gray-400 mb-6 font-medium text-sm">
          Apenas para o Administrador do Kanhen Alil
        </p>

        {/* 👇 BOTÃO DE INSTALAÇÃO - ANDROID 👇 */}
        {installPrompt && (
          <button 
            onClick={instalarAppAndroid}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mb-6 shadow-md transition-all animate-bounce"
          >
            <Download size={20} />
            Instalar App do Painel
          </button>
        )}

        {/* 👇 AVISO DE INSTALAÇÃO - IPHONE / IOS 👇 */}
        {isIOS && (
          <div className="bg-blue-900/30 border border-blue-500/50 text-blue-200 p-4 rounded-lg mb-6 text-sm text-center">
            <p className="font-bold mb-1">Para instalar no iPhone:</p>
            <p className="flex items-center justify-center gap-1">
              Toque em <Share size={16} className="text-blue-400 mx-1" /> e escolha <br/> 
              <strong>"Adicionar à Tela de Início"</strong>
            </p>
          </div>
        )}

        {erro && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm text-center font-semibold">
            {erro}
          </div>
        )}
        
        <form onSubmit={fazerLoginAdmin} className="space-y-5">
          <div>
            <label className="block text-gray-300 font-semibold mb-2">E-mail do Administrador</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition" 
              placeholder="Insira o e-mail" 
            />
          </div>
          
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Senha</label>
            <input 
              type="password" 
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition" 
              placeholder="Insira a senha" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={carregando}
            className={`w-full font-bold py-3 rounded-lg transform transition shadow-lg flex justify-center items-center space-x-2 
              ${carregando ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-[#F97316] text-white hover:bg-orange-600 hover:scale-[1.02] shadow-orange-500/30'}`}
          >
            <span>{carregando ? 'A verificar...' : 'Entrar no Sistema'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}