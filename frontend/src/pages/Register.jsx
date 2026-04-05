import { useState } from 'react';
import { UserPlus, ArrowLeft, Phone, User, MapPin, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; 
import toast from 'react-hot-toast';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [captchaToken, setCaptchaToken] = useState(null);

  const fazerCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    
    if (!captchaToken) {
      setErro('Por favor, aguarde a verificação de segurança ou marque a caixa.');
      return;
    }

    if (!nome || !celular || !endereco || !senha) {
      setErro('Por favor, preencha todos os campos!');
      return;
    }

    // 👇 VALIDAÇÃO INTELIGENTE DO NÚMERO DA GUINÉ-BISSAU
    const celularLimpo = celular.replace(/\D/g, ''); // Remove espaços, letras e símbolos (como o +)
    let celularFinal = celularLimpo;

    // Se o cliente digitar 245 na frente (ex: 245 95 123 4567), limpamos o 245 para guardar só o número
    if (celularLimpo.startsWith('245') && celularLimpo.length === 12) {
      celularFinal = celularLimpo.substring(3);
    }

    // Verifica se sobrou exatamente 9 dígitos e se começa com o número 9
    if (celularFinal.length !== 9 || !celularFinal.startsWith('9')) {
      setErro('Insira um número válido da Guiné-Bissau com 9 dígitos (Ex: 95XXXXXXX).');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('clientes')
        // 👇 Guardamos o número já limpo e validado no banco de dados
        .insert([{ nome, celular: celularFinal, endereco, senha }]);

      if (error) {
        if (error.code === '23505') { 
          setErro('Este número de celular já está cadastrado.');
        } else {
          setErro('Erro ao criar conta. Verifique se o banco de dados está liberado.');
        }
      } else {
        localStorage.setItem('clienteNome', nome);
        localStorage.setItem('clienteCelular', celularFinal);
        localStorage.setItem('clienteEndereco', endereco);
        
        toast.success('Cadastro realizado com sucesso! Bem-vindo!');
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
      style={{ backgroundImage: "url('/kanhenalil.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"></div>
      
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full relative z-10 border border-white/20">
        
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 text-gray-400 hover:text-[#E53E3E] transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex justify-center mb-4">
          <img 
            src="/logo.jpeg" 
            alt="Logo Kanhen Alil" 
            className="w-24 h-24 rounded-full shadow-xl border-4 border-[#F97316] object-cover relative -mt-12"
          />
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
            <p className="text-[10px] text-gray-400 mt-1 ml-1">Apenas números da Guiné-Bissau (9 dígitos)</p>
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
          
          <div className="flex justify-center py-2">
            <Turnstile
              siteKey="0x4AAAAAAC0yBAA2GO4d0UUy"
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => setErro('Erro ao verificar segurança. Tente atualizar a página.')}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !captchaToken}
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-2 ${loading || !captchaToken ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F97316] hover:bg-orange-600 active:scale-95'}`}
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