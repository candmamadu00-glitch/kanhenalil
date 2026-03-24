import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase'; // Importamos o Supabase para fazer a verificação segura

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const fazerLoginAdmin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(''); // Limpa erros antigos

    try {
      // Pede para o Supabase verificar se o e-mail e a senha existem/estão corretos
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) {
        // Se o Supabase disser que tem erro, mostramos a mensagem
        setErro('Credenciais inválidas. Acesso não autorizado.');
      } else {
        // Se der tudo certo, entra no painel!
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
      
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-accent relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-accent/20 p-4 rounded-full">
            <ShieldCheck size={48} className="text-accent" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Acesso Restrito
        </h1>
        <p className="text-center text-gray-400 mb-8 font-medium text-sm">
          Apenas para o Administrador do Kanhen Alil
        </p>

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
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition" 
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
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition" 
              placeholder="Insira a senha" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={carregando}
            className={`w-full font-bold py-3 rounded-lg transform transition shadow-lg flex justify-center items-center space-x-2 
              ${carregando ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-accent text-white hover:bg-orange-600 hover:scale-[1.02] shadow-accent/30'}`}
          >
            <span>{carregando ? 'A verificar...' : 'Entrar no Sistema'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}