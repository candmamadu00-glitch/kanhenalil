import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Utensils, Phone, Lock, LogIn, Download, Share } from 'lucide-react';
import { supabase } from '../supabase';

export default function ClientLogin() {
  const navigate = useNavigate();
  
  const [celular, setCelular] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para instalação do App
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Escuta Android para mostrar o botão de instalar
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e); 
    });

    // 2. Detecta se é um iPhone/iPad
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = ('standalone' in window.navigator) && window.navigator.standalone;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }
  }, []);

  const instalarApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null); 
    }
  };

  const fazerLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    if (!celular || !senha) {
      setErro('Por favor, preencha o seu celular e senha.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('celular', celular)
        .eq('senha', senha)
        .maybeSingle();

      if (error || !data) {
        setErro('Celular ou palavra-passe incorretos! Tente novamente.');
      } else {
        localStorage.setItem('clienteNome', data.nome);
        localStorage.setItem('clienteCelular', data.celular);
        localStorage.setItem('clienteEndereco', data.endereco);
        navigate('/cardapio');
      }
    } catch (err) {
      setErro('Erro ao ligar. Verifique a sua internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
      // 👇 Link oficial e permanente da bandeira da Guiné-Bissau
      style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Guinea-Bissau.svg')" }}
    >
      {/* Película escura para dar destaque ao formulário branco */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
      
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full relative z-10 border border-white/20">
        
        <div className="flex justify-center mb-4 mt-2">
          <div className="bg-[#E53E3E] p-4 rounded-full shadow-lg flex items-center justify-center w-16 h-16">
            <Utensils size={32} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-center text-[#1E293B] mb-1 tracking-tight">
          KANHEN ALIL
        </h1>
        <p className="text-center text-[#F97316] font-semibold mb-6 text-xs uppercase tracking-wider">
          O Melhor Sabor da Guiné
        </p>

        {/* 👇 BOTÃO DE INSTALAÇÃO - ANDROID 👇 */}
        {installPrompt && (
          <button 
            onClick={instalarApp}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl mb-6 shadow-md transition-all animate-bounce"
          >
            <Download size={20} />
            Instalar App no Celular
          </button>
        )}

        {/* 👇 AVISO DE INSTALAÇÃO - IPHONE / IOS 👇 */}
        {isIOS && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl mb-6 text-sm text-center">
            <p className="font-bold mb-1">Para instalar no iPhone:</p>
            <p className="flex items-center justify-center gap-1">
              Toque em <Share size={16} className="text-blue-600 mx-1" /> e escolha <br/> 
              <strong>"Adicionar à Tela de Início"</strong>
            </p>
          </div>
        )}

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
             <span>{erro}</span>
          </div>
        )}
        
        <form onSubmit={fazerLogin} className="space-y-5">
          <div>
            <label className="block text-[#475569] font-bold mb-1.5 text-sm">Nº de Celular</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input 
                type="tel" 
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 pl-10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E53E3E] transition-all text-sm" 
                placeholder="Ex: 955XXXXXX" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[#475569] font-bold mb-1.5 text-sm">Palavra-passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type="password" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 pl-10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E53E3E] transition-all text-sm" 
                placeholder="Insira a sua senha" 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 ${loading ? 'bg-gray-400' : 'bg-[#E53E3E] hover:bg-red-700 active:scale-[0.98]'}`}
          >
            {loading ? 'A entrar...' : (
              <>
                <span>Entrar no Cardápio</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="text-[#F97316] font-bold hover:underline transition-all">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}