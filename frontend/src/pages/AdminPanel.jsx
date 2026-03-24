import { useState, useEffect } from 'react';
import { LayoutDashboard, Utensils, ShoppingBag, Edit, Trash, Clock, Check, Plus, X, LogOut, UploadCloud, MessageCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [idEditando, setIdEditando] = useState(null); // Para saber se estamos criando ou editando
  const [novoPrato, setNovoPrato] = useState({ nome: '', preco: '', descricao: '', imagem: '', status: 'Disponível' });
  const [arquivoImagem, setArquivoImagem] = useState(null); // Para guardar a foto selecionada
  
  useEffect(() => {
    buscarDados();

    // MÁGICA 1: Fica escutando novos pedidos em tempo real
    const canalPedidos = supabase
      .channel('novos-pedidos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          // Quando chega um pedido novo...
          console.log('Chegou um pedido novo!', payload);
          
          // Toca um som de campainha de restaurante!
          const somCampainha = new Audio('https://actions.google.com/sounds/v1/alarms/ding_dong_bell.ogg');
          somCampainha.play().catch(e => console.log('O navegador bloqueou o som. Interaja com a página primeiro.'));

          // Adiciona o pedido no topo da lista sem precisar atualizar a página
          setPedidos((pedidosAtuais) => [payload.new, ...pedidosAtuais]);
        }
      )
      .subscribe();

    // Quando o admin sair do painel, desliga o "espião" para não gastar internet
    return () => {
      supabase.removeChannel(canalPedidos);
    };
  }, []);
  const buscarDados = async () => {
    setCarregando(true);
    try {
      const { data: dadosPedidos, error: erroPedidos } = await supabase.from('pedidos').select('*').order('id', { ascending: false });
      if (erroPedidos) throw erroPedidos;
      setPedidos(dadosPedidos);

      const { data: dadosProdutos, error: erroProdutos } = await supabase.from('produtos').select('*').order('id', { ascending: true });
      if (erroProdutos) throw erroProdutos;
      setProdutos(dadosProdutos);
    } catch (error) {
      console.error("Erro ao buscar dados:", error.message);
    } finally {
      setCarregando(false);
    }
  };

  const mudarStatusPedido = async (id, novoStatus) => {
    try {
      const { error } = await supabase.from('pedidos').update({ status: novoStatus }).eq('id', id);
      if (error) throw error;
      setPedidos(pedidos.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    } catch (error) {
      alert("Erro ao atualizar status!");
    }
  };
const avisarClienteWhatsApp = (nomeCliente, telefoneCliente, status) => {
    // Limpa o número para tirar espaços ou traços que o cliente possa ter digitado
    const numeroLimpo = telefoneCliente.replace(/\D/g, ''); 
    
    let mensagem = `Olá, ${nomeCliente}! 🍲 Aqui é do Kanhen Alil.\n\n`;
    
    if (status === 'Em Preparação') {
      mensagem += `O seu pedido já foi para a cozinha e está sendo preparado com muito carinho! Em breve sai para entrega.`;
    } else if (status === 'Entregue') {
      mensagem += `O seu pedido acabou de sair para entrega! Fique de olho 🛵💨`;
    } else {
      mensagem += `O seu pedido está atualizado para: ${status}.`;
    }

    const linkWhatsapp = `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    window.open(linkWhatsapp, '_blank');
  };
  const apagarPrato = async (id) => {
    if (!window.confirm("Tem certeza que deseja apagar este prato para sempre?")) return;
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      setProdutos(produtos.filter(p => p.id !== id));
    } catch (error) {
      alert("Erro ao apagar prato.");
    }
  };

  const mudarStatusPrato = async (id, statusAtual) => {
    const novoStatus = statusAtual === 'Disponível' ? 'Esgotado' : 'Disponível';
    try {
      const { error } = await supabase.from('produtos').update({ status: novoStatus }).eq('id', id);
      if (error) throw error;
      setProdutos(produtos.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    } catch (error) {
      alert("Erro ao mudar status.");
    }
  };

  // Funções para abrir e fechar o modal corretamente
  const abrirModalNovo = () => {
    setIdEditando(null);
    setNovoPrato({ nome: '', preco: '', descricao: '', imagem: '', status: 'Disponível' });
    setArquivoImagem(null);
    setIsModalAberto(true);
  };

  const abrirModalEditar = (prato) => {
    setIdEditando(prato.id);
    setNovoPrato(prato);
    setArquivoImagem(null);
    setIsModalAberto(true);
  };

  // Função para fazer Upload da imagem para o Supabase
  const fazerUploadImagem = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`; // Nome aleatório para não repetir
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('imagens_produtos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Pega o link público da imagem que acabou de subir
    const { data } = supabase.storage.from('imagens_produtos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const salvarPrato = async (e) => {
    e.preventDefault();
    setAdicionando(true);
    try {
      let urlDaImagem = novoPrato.imagem;

      // Se o usuário selecionou um arquivo novo, fazemos o upload
      if (arquivoImagem) {
        urlDaImagem = await fazerUploadImagem(arquivoImagem);
      }

      const dadosParaSalvar = {
        nome: novoPrato.nome, 
        preco: Number(novoPrato.preco), 
        descricao: novoPrato.descricao,
        imagem: urlDaImagem || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
        status: novoPrato.status
      };

      if (idEditando) {
        // EDITAR PRATO EXISTENTE
        const { error } = await supabase.from('produtos').update(dadosParaSalvar).eq('id', idEditando);
        if (error) throw error;
      } else {
        // CRIAR NOVO PRATO
        const { error } = await supabase.from('produtos').insert([dadosParaSalvar]);
        if (error) throw error;
      }

      setIsModalAberto(false);
      buscarDados();
    } catch (error) {
      alert("Erro ao salvar prato. Verifique se configurou o Storage no Supabase.");
      console.error(error);
    } finally {
      setAdicionando(false);
    }
  };

  const fazerLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
// === CÁLCULOS DO DASHBOARD ===
  const totalPedidos = pedidos.length;
  const pedidosPendentes = pedidos.filter(p => p.status === 'Pendente').length;
  const pratosDisponiveis = produtos.filter(p => p.status === 'Disponível').length;
  return (
    <div className="min-h-screen bg-secondary flex pb-16 md:pb-0">
      <aside className="w-64 bg-primary text-white hidden md:flex flex-col shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold">KaSnhen Alil</h2>
          <p className="text-red-200 text-sm">Painel do Chefe</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => setAbaAtiva('pedidos')} className={`w-full flex items-center space-x-3 p-3 rounded-lg font-medium transition ${abaAtiva === 'pedidos' ? 'bg-red-800' : 'hover:bg-red-700'}`}>
            <ShoppingBag size={20} /><span>Pedidos Recebidos</span>
          </button>
          <button onClick={() => setAbaAtiva('produtos')} className={`w-full flex items-center space-x-3 p-3 rounded-lg font-medium transition ${abaAtiva === 'produtos' ? 'bg-red-800' : 'hover:bg-red-700'}`}>
            <Utensils size={20} /><span>Meu Cardápio</span>
          </button>
        </nav>
        <div className="p-4 border-t border-red-800">
          <button onClick={fazerLogout} className="w-full flex items-center justify-center space-x-2 bg-red-800 hover:bg-red-900 p-3 rounded-lg transition font-bold text-red-100">
            <LogOut size={20} /> <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 w-full bg-primary text-white flex justify-around p-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button onClick={() => setAbaAtiva('pedidos')} className={`flex flex-col items-center p-2 rounded-lg ${abaAtiva === 'pedidos' ? 'text-white' : 'text-red-300'}`}>
          <ShoppingBag size={24} /><span className="text-xs font-bold mt-1">Pedidos</span>
        </button>
        <button onClick={() => setAbaAtiva('produtos')} className={`flex flex-col items-center p-2 rounded-lg ${abaAtiva === 'produtos' ? 'text-white' : 'text-red-300'}`}>
          <Utensils size={24} /><span className="text-xs font-bold mt-1">Cardápio</span>
        </button>
        <button onClick={fazerLogout} className="flex flex-col items-center p-2 rounded-lg text-red-300 hover:text-white">
          <LogOut size={24} /><span className="text-xs font-bold mt-1">Sair</span>
        </button>
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {abaAtiva === 'pedidos' ? 'Gestão de Pedidos' : 'Gestão de Cardápio'}
          </h1>
          <div className="flex gap-2 w-full sm:w-auto">
            {abaAtiva === 'produtos' && (
              <button onClick={abrirModalNovo} className="flex-1 sm:flex-none bg-accent text-white px-4 py-2 rounded-lg shadow-md font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2">
                <Plus size={20} /> Novo Prato
              </button>
            )}
            <button onClick={buscarDados} className="bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Atualizar
            </button>
          </div>
        </header>
        {/* DASHBOARD DE ESTATÍSTICAS */}
        {abaAtiva === 'pedidos' && !carregando && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-800">{totalPedidos}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Aguardando Preparo</p>
                <p className="text-2xl font-bold text-gray-800">{pedidosPendentes}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <Utensils size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pratos Disponíveis</p>
                <p className="text-2xl font-bold text-gray-800">{pratosDisponiveis}</p>
              </div>
            </div>
          </div>
        )}
        {carregando ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {abaAtiva === 'pedidos' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="p-4 font-semibold">Cliente</th>
                      <th className="p-4 font-semibold hidden md:table-cell">Endereço</th>
                      <th className="p-4 font-semibold">Itens</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((pedido) => (
                      <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{pedido.nome_cliente}</p>
                          <p className="text-xs text-gray-500 md:hidden">{pedido.celular_cliente}</p>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <p className="text-sm font-medium text-gray-800">{pedido.celular_cliente}</p>
                          <p className="text-xs text-gray-500">{pedido.endereco_entrega}</p>
                          
                          {/* AQUI ESTÁ O LUGAR CORRETO DO PAGAMENTO! */}
                          <div className="mt-2 inline-block">
                            {pedido.metodo_pagamento === 'Orange Money' ? (
                              <div className="bg-orange-50 border border-orange-200 px-2 py-1.5 rounded text-xs">
                                <span className="font-bold text-orange-700 block mb-0.5">Pagamento: Orange Money</span>
                                <span className="text-orange-600 font-mono">TXN: {pedido.codigo_transacao}</span>
                              </div>
                            ) : (
                              <div className="bg-gray-100 border border-gray-200 px-2 py-1.5 rounded text-xs text-gray-700">
                                <span className="font-bold">Pagamento:</span> Dinheiro na Entrega
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 max-w-[150px] truncate" title={pedido.itens_comprados}>{pedido.itens_comprados}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${pedido.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : pedido.status === 'Em Preparação' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {pedido.status}
                          </span>
                        </td>
                        <td className="p-4 flex flex-col gap-2">
                          {pedido.status === 'Pendente' && (
                            <button onClick={() => {
                                mudarStatusPedido(pedido.id, 'Em Preparação');
                                avisarClienteWhatsApp(pedido.nome_cliente, pedido.celular_cliente, 'Em Preparação');
                              }} 
                              className="text-xs bg-blue-500 text-white px-2 py-1.5 rounded hover:bg-blue-600 flex items-center justify-center gap-1">
                              <Clock size={14}/> <span className="hidden sm:inline">Preparar e Avisar</span>
                            </button>
                          )}
                          {pedido.status === 'Em Preparação' && (
                            <button onClick={() => {
                                mudarStatusPedido(pedido.id, 'Entregue');
                                avisarClienteWhatsApp(pedido.nome_cliente, pedido.celular_cliente, 'Entregue');
                              }} 
                              className="text-xs bg-green-500 text-white px-2 py-1.5 rounded hover:bg-green-600 flex items-center justify-center gap-1">
                              <Check size={14}/> <span className="hidden sm:inline">Entregar e Avisar</span>
                            </button>
                          )}
                          
                          {/* Botão extra só para chamar no WhatsApp a qualquer momento */}
                          <button onClick={() => avisarClienteWhatsApp(pedido.nome_cliente, pedido.celular_cliente, 'Contato')} className="text-xs bg-gray-100 text-gray-700 px-2 py-1.5 rounded hover:bg-green-100 hover:text-green-700 flex items-center justify-center gap-1 mt-1 border border-gray-200">
                            <MessageCircle size={14}/> <span>WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {abaAtiva === 'produtos' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap sm:whitespace-normal">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="p-4 font-semibold">Prato</th>
                      <th className="p-4 font-semibold">Preço</th>
                      <th className="p-4 font-semibold hidden sm:table-cell">Status</th>
                      <th className="p-4 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((prato) => (
                      <tr key={prato.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img src={prato.imagem} className="w-12 h-12 object-cover rounded-lg shadow-sm" alt="Prato"/>
                          <div>
                            <p className="font-bold text-gray-800">{prato.nome}</p>
                            <button onClick={() => mudarStatusPrato(prato.id, prato.status)} className={`mt-1 sm:hidden px-2 py-0.5 rounded-full text-[10px] font-bold ${prato.status === 'Disponível' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{prato.status}</button>
                          </div>
                        </td>
                        <td className="p-4 text-primary font-bold">{prato.preco} CFA</td>
                        <td className="p-4 hidden sm:table-cell">
                          <button onClick={() => mudarStatusPrato(prato.id, prato.status)} className={`px-3 py-1 rounded-full text-xs font-bold ${prato.status === 'Disponível' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{prato.status}</button>
                        </td>
                        <td className="p-4 flex justify-center space-x-2">
                          <button onClick={() => abrirModalEditar(prato)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition" title="Editar Prato"><Edit size={18} /></button>
                          <button onClick={() => apagarPrato(prato.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition" title="Apagar Prato"><Trash size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {isModalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">{idEditando ? 'Editar Prato' : 'Novo Prato'}</h3>
              <button onClick={() => setIsModalAberto(false)}><X size={20}/></button>
            </div>
            <form onSubmit={salvarPrato} className="p-6 space-y-4">
              <input required type="text" placeholder="Nome do Prato" value={novoPrato.nome} onChange={e => setNovoPrato({...novoPrato, nome: e.target.value})} className="w-full border p-2.5 rounded-lg"/>
              <input required type="number" placeholder="Preço (CFA)" value={novoPrato.preco} onChange={e => setNovoPrato({...novoPrato, preco: e.target.value})} className="w-full border p-2.5 rounded-lg"/>
              
              {/* CAMPO DE UPLOAD DE FOTO AQUI */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setArquivoImagem(e.target.files[0])} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <UploadCloud size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 font-medium">
                    {arquivoImagem ? arquivoImagem.name : (idEditando ? 'Clique para trocar a foto' : 'Clique para anexar uma foto')}
                  </span>
                </div>
              </div>

              <textarea required placeholder="Descrição do Prato (ingredientes, etc)" value={novoPrato.descricao} onChange={e => setNovoPrato({...novoPrato, descricao: e.target.value})} className="w-full border p-2.5 rounded-lg h-24"></textarea>
              <button type="submit" disabled={adicionando} className="w-full text-white font-bold py-3 rounded-xl bg-accent hover:bg-orange-600">
                {adicionando ? 'A Salvar...' : (idEditando ? 'Atualizar Prato' : 'Adicionar ao Cardápio')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}