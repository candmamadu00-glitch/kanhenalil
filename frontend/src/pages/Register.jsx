import { useState } from 'react';
import { UserPlus, ArrowLeft, Phone, User, MapPin, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; 

export default function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const fazerCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    if (!nome || !celular || !endereco || !senha) {
      setErro('Por favor, preencha todos os campos!');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('clientes')
        .insert([{ nome, celular, endereco, senha }]);

      if (error) {
        if (error.code === '23505') { 
          setErro('Este número de celular já está cadastrado.');
        } else {
          setErro('Erro ao criar conta. Verifique se o banco de dados está liberado.');
        }
      } else {
        localStorage.setItem('clienteNome', nome);
        localStorage.setItem('clienteCelular', celular);
        localStorage.setItem('clienteEndereco', endereco);
        
        alert('Cadastro realizado com sucesso! Bem-vindo ao Kanhen Alil.');
        navigate('/cardapio'); 
      }
    } catch (err) {
      setErro('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
      // Se quiser a bandeira rústica, troque para: https://i.imgur.com/8Q9Z5bQ.jpeg
      style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Guinea-Bissau.svg')" }}
    >
      {/* Camada escura para dar foco ao formulário */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full relative z-10 border border-white/20">
        
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 text-gray-400 hover:text-[#E53E3E] transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex justify-center mb-4">
          <div className="bg-[#F97316] p-4 rounded-full shadow-lg">
            <UserPlus size={32} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-center text-[#1E293B] mb-1">
          CRIAR CONTA
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm font-medium">
          Junte-se ao Kanhen Alil
        </p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm font-bold text-center">
            {erro}
          </div>
        )}
        
        <form onSubmit={fazerCadastro} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-1 text-xs uppercase">Nome Completo</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none text-sm" 
                placeholder="Ex: Mamadu Balde" 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1 text-xs uppercase">Nº de Celular</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="tel" 
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none text-sm" 
                placeholder="95XXXXXXX" 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1 text-xs uppercase">Endereço de Entrega</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none text-sm" 
                placeholder="Bairro e Ponto de Referência" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-1 text-xs uppercase">Palavra-passe</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="password" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none text-sm" 
                placeholder="Crie uma senha" 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-2 ${loading ? 'bg-gray-400' : 'bg-[#F97316] hover:bg-orange-600 active:scale-95'}`}
          >
            {loading ? 'A processar...' : 'FINALIZAR CADASTRO'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Já tem conta? <span onClick={() => navigate('/')} className="text-[#E53E3E] font-black cursor-pointer hover:underline">ENTRAR AGORA</span>
          </p>
        </div>
      </div>
    </div>
  );
}