import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Importando a conexão com o banco!

export default function Register() {
  const navigate = useNavigate();

  // "Gavetas" temporárias para guardar o que o cliente digita
  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  
  // Para mostrar avisos de erro ou carregamento na tela
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Função que roda quando o cliente clica em Cadastrar
  const fazerCadastro = async (e) => {
    e.preventDefault(); // Evita que a página recarregue
    setErro('');
    setLoading(true);

    // Verifica se o cliente preencheu tudo
    if (!nome || !celular || !endereco || !senha) {
      setErro('Por favor, preencha todos os campos!');
      setLoading(false);
      return;
    }

    try {
      // Aqui é a mágica: Enviando para a tabela 'clientes' no Supabase
      const { error } = await supabase
        .from('clientes')
        .insert([
          { nome: nome, celular: celular, endereco: endereco, senha: senha }
        ]);

      if (error) {
        // Se o celular já existir no banco, ele avisa
        if (error.code === '23505') { 
          setErro('Este número de celular já está cadastrado.');
        } else {
          setErro('Erro ao criar conta. Tente novamente.');
        }
      } else {
        // Sucesso! Salva os dados no navegador para não precisar logar de novo agora
        localStorage.setItem('clienteAtivo', celular);
        localStorage.setItem('nomeCliente', nome);
        
        alert('Cadastro realizado com sucesso! Bem-vindo ao Kanhen Alil.');
        navigate('/cardapio'); // Manda o cliente direto para ver os pratos
      }
    } catch (err) {
      setErro('Erro de conexão com o servidor.');
    } finally {
      setLoading(false); // Desliga o botão de carregamento
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Guinea-Bissau.svg')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-accent relative z-10">
        
        <div className="flex justify-center mb-6">
          <div className="bg-accent/10 p-4 rounded-full">
            <UserPlus size={40} className="text-accent" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Criar sua Conta
        </h1>
        <p className="text-center text-gray-500 mb-6 font-medium text-sm">
          Preencha seus dados para pedir no Kanhen Alil
        </p>

        {/* Mostra mensagem de erro se houver */}
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm font-semibold text-center">
            {erro}
          </div>
        )}
        
        <form onSubmit={fazerCadastro} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Nome Completo</label>
            <input 
              type="text" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition" 
              placeholder="Ex: João Silva" 
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Número de Celular</label>
            <input 
              type="tel" 
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition" 
              placeholder="Seu número em Guiné-Bissau" 
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Endereço de Entrega</label>
            <input 
              type="text" 
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition" 
              placeholder="Bairro, Rua, Ponto de Referência" 
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition" 
              placeholder="Crie uma senha forte" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-bold py-3 mt-4 rounded-lg transform transition shadow-lg ${loading ? 'bg-gray-400' : 'bg-accent hover:bg-orange-600 hover:scale-[1.02] shadow-accent/30'}`}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar e Fazer Pedido'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Já tem uma conta? <span onClick={() => navigate('/')} className="text-primary font-bold cursor-pointer hover:underline">Faça Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}