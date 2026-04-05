import { useState, useEffect } from 'react';
import { LayoutDashboard, Utensils, ShoppingBag, Edit, Trash, Clock, Check, Plus, X, LogOut, UploadCloud, MessageCircle, Briefcase, PhoneCall, Users, UserCheck, UserX } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]); // 👈 NOVO: Estado para clientes
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal de Produtos
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [idEditando, setIdEditando] = useState(null); 
  const [novoPrato, setNovoPrato] = useState({ nome: '', preco: '', descricao: '', imagem: '', status: 'Disponível' });
  const [arquivoImagem, setArquivoImagem] = useState(null); 
  
  useEffect(() => {
    buscarDados();

    // Escutando novos pedidos em tempo real
    const canalPedidos = supabase
      .channel('novos-pedidos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          const somCampainha = new Audio('https://actions.google.com/sounds/v1/alarms/ding_dong_bell.ogg');
          somCampainha.play().catch(e => console.log('O navegador bloqueou o som. Interaja com a página primeiro.'));
          setPedidos((pedidosAtuais) => [payload.new, ...pedidosAtuais]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalPedidos);
    };
  }, []);

  const buscarDados = async () => {
    setCarregando(true);
    try {
      // Busca Pedidos
      const { data: dadosPedidos, error: erroPedidos } = await supabase.from('pedidos').select('*').order('id', { ascending: false });
      if (erroPedidos) throw erroPedidos;
      setPedidos(dadosPedidos);

      // Busca Produtos
      const { data: dadosProdutos, error: erroProdutos } = await supabase.from('produtos').select('*').order('id', { ascending: true });
      if (erroProdutos) throw erroProdutos;
      setProdutos(dadosProdutos);

      // 👈 NOVO: Busca Clientes
      const { data: dadosClientes, error: erroClientes } = await supabase.from('clientes').select('*').order('id', { ascending: false });
      if (erroClientes) throw erroClientes;
      // Garante que clientes antigos que não tenham status fiquem como "Ativo" na tela
      const clientesAjustados = dadosClientes.map(c => ({...c, status: c.status || 'Ativo'}));
      setClientes(clientesAjustados);

    } catch (error) {
      console.error("Erro ao buscar dados:", error.message);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // FUNÇÕES DE PEDIDOS
  // ==========================================
  const atualizarStatusPedido = async (id, novoStatus) => {
    try {
      const { error } = await supabase.from('pedidos').update({ status: novoStatus }).eq('id', id);
      if (error) throw error;
      setPedidos(pedidos.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    } catch (error) {
      alert("Erro ao atualizar status!");
    }
  };

  // 👈 NOVO: Função para apagar pedido permanentemente
  const apagarPedido = async (id) => {
    if (!window.confirm("Tem certeza que deseja apagar este pedido permanentemente? Isso não pode ser desfeito.")) return;
    try {
      const { error } = await supabase.from('pedidos').delete().eq('id', id);
      if (error) throw error;
      setPedidos(pedidos.filter(p => p.id !== id));
      alert("Pedido excluído com sucesso.");
    } catch (error) {
      alert("Erro ao excluir pedido.");
    }
  };

  const avisarClienteWhatsApp = (nomeCliente, telefoneCliente, itens, tipoAviso) => {
    const numeroLimpo = telefoneCliente.replace(/\D/g, ''); 
    const isServico = itens.includes('[SERVIÇO]');
    
    let mensagem = `Olá, ${nomeCliente}! 🍲 Aqui é do Kanhen Alil.\n\n`;
    
    if (isServico) {
      mensagem = `Olá ${nomeCliente}, tudo bem? Sou do *Kanhen Alil*. Recebemos sua solicitação de orçamento para serviços. Podemos conversar sobre os detalhes?`;
    } else {
      if (tipoAviso === 'Em Preparação') {
        mensagem += `O seu pedido já foi para a cozinha e está sendo preparado com muito carinho! Em breve sai para entrega.`;
      } else if (tipoAviso === 'Entregue') {
        mensagem += `O seu pedido acabou de sair para entrega! Fique de olho 🛵💨`;
      } else {
        mensagem += `Gostaríamos de falar sobre o seu pedido.`;
      }
    }

    const linkWhatsapp = `https://wa.me/245${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    window.open(linkWhatsapp, '_blank');
  };

  // ==========================================
  // 👈 NOVO: FUNÇÕES DE CLIENTES
  // ==========================================
  const mudarStatusCliente = async (id, statusAtual) => {
    const novoStatus = statusAtual === 'Desativado' ? 'Ativo' : 'Desativado';
    const confirmacao = window.confirm(`Deseja realmente ${novoStatus === 'Desativado' ? 'BLOQUEAR' : 'DESBLOQUEAR'} este cliente?`);
    if (!confirmacao) return;

    try {
      const { error } = await supabase.from('clientes').update({ status: novoStatus }).eq('id', id);
      if (error) throw error;
      setClientes(clientes.map(c => c.id === id ? { ...c, status: novoStatus } : c));
    } catch (error) {
      alert("Erro ao mudar status do cliente.");
    }
  };

  const apagarCliente = async (id) => {
    if (!window.confirm("⚠️ ATENÇÃO! Tem certeza que deseja excluir o cadastro deste cliente PERMANENTEMENTE?")) return;
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
      setClientes(clientes.filter(c => c.id !== id));
      alert("Cliente excluído do sistema.");
    } catch (error) {
      alert("Erro ao apagar cliente. Verifique se ele possui pedidos vinculados.");
    }
  };

  // ==========================================
  // FUNÇÕES DE GERENCIAMENTO DO CARDÁPIO
  // ==========================================
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

  const fazerUploadImagem = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`; 
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('imagens_produtos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('imagens_produtos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const salvarPrato = async (e) => {
    e.preventDefault();
    setAdicionando(true);
    try {
      let urlDaImagem = novoPrato.imagem;

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
        const { error } = await supabase.from('produtos').update(dadosParaSalvar).eq('id', idEditando);
        if (error) throw error;
      } else {
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

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* MENU LATERAL ESCURO */}
      <aside className="w-64 bg-[#0F172A] text-white hidden md:flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="bg-[#F97316] p-2 rounded-lg"><LayoutDashboard size={24} className="text-white"/></div>
          <h2 className="text-xl font-black tracking-wider">PAINEL ADMIN</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setAbaAtiva('pedidos')} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold ${abaAtiva === 'pedidos' ? 'bg-[#F97316] text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <ShoppingBag size={20} /> Pedidos & Serviços
            {pedidos.filter(p => p.status === 'Pendente').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                {pedidos.filter(p => p.status === 'Pendente').length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setAbaAtiva('produtos')} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold ${abaAtiva === 'produtos' ? 'bg-[#F97316] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Utensils size={20} /> Gerir Cardápio
          </button>

          {/* 👈 NOVO: MENU DE CLIENTES */}
          <button 
            onClick={() => setAbaAtiva('clientes')} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold ${abaAtiva === 'clientes' ? 'bg-[#F97316] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users size={20} /> Base de Clientes
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={fazerLogout} className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold">
            <LogOut size={18} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* MENU MOBILE */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#0F172A] text-white flex justify-around p-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button onClick={() => setAbaAtiva('pedidos')} className={`flex flex-col items-center p-2 rounded-lg ${abaAtiva === 'pedidos' ? 'text-[#F97316]' : 'text-gray-400'}`}>
          <ShoppingBag size={24} /><span className="text-xs font-bold mt-1">Pedidos</span>
        </button>
        <button onClick={() => setAbaAtiva('produtos')} className={`flex flex-col items-center p-2 rounded-lg ${abaAtiva === 'produtos' ? 'text-[#F97316]' : 'text-gray-400'}`}>
          <Utensils size={24} /><span className="text-xs font-bold mt-1">Cardápio</span>
        </button>
        <button onClick={() => setAbaAtiva('clientes')} className={`flex flex-col items-center p-2 rounded-lg ${abaAtiva === 'clientes' ? 'text-[#F97316]' : 'text-gray-400'}`}>
          <Users size={24} /><span className="text-xs font-bold mt-1">Clientes</span>
        </button>
      </nav>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-gray-50">
        
        {/* CABEÇALHO */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            {abaAtiva === 'pedidos' ? 'Caixa de Entrada' : abaAtiva === 'clientes' ? 'Gestão de Clientes' : 'Gestão de Cardápio'}
          </h1>
          <div className="flex gap-2 w-full sm:w-auto">
            {abaAtiva === 'produtos' && (
              <button onClick={abrirModalNovo} className="flex-1 sm:flex-none bg-[#F97316] text-white px-4 py-2 rounded-xl shadow-md font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2">
                <Plus size={20} /> Novo Prato
              </button>
            )}
            <button onClick={buscarDados} className="bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Atualizar Dados
            </button>
          </div>
        </header>

        {carregando ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F97316]"></div>
          </div>
        ) : (
          <>
            {/* ========================================= */}
            {/* TELA DE PEDIDOS */}
            {/* ========================================= */}
            {abaAtiva === 'pedidos' && (
              <div className="animate-fade-in max-w-6xl mx-auto">
                <p className="text-gray-500 mb-6 font-medium">Acompanhe e aceite pedidos de comida e solicitações de serviços em tempo real.</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pedidos.map((pedido) => {
                    const isServico = pedido.itens_comprados.includes('[SERVIÇO]');
                    
                    return (
                      <div key={pedido.id} className={`rounded-3xl shadow-md border overflow-hidden transition-all hover:shadow-xl ${isServico ? 'bg-gradient-to-br from-indigo-900 to-[#1E293B] border-indigo-700 text-white' : 'bg-white border-gray-200'}`}>
                        
                        <div className={`p-5 border-b ${isServico ? 'border-indigo-800/50' : 'border-gray-100'} flex justify-between items-start`}>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {isServico ? <Briefcase size={18} className="text-indigo-300"/> : <ShoppingBag size={18} className="text-[#F97316]"/>}
                              <h3 className={`font-black text-lg ${isServico ? 'text-white' : 'text-[#1E293B]'}`}>#{pedido.id} - {pedido.nome_cliente}</h3>
                            </div>
                            <p className={`text-sm flex items-center gap-1 font-medium ${isServico ? 'text-indigo-300' : 'text-gray-500'}`}>
                              <MessageCircle size={14} /> {pedido.celular_cliente}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${pedido.status === 'Pendente' ? 'bg-yellow-400 text-yellow-900 animate-pulse' : pedido.status === 'Em Preparação' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                              {pedido.status}
                            </span>
                            
                            {/* 👈 NOVO: BOTÃO DE APAGAR PEDIDO */}
                            <button onClick={() => apagarPedido(pedido.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-lg transition" title="Apagar Pedido Permanente">
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className={`p-4 rounded-2xl mb-4 ${isServico ? 'bg-indigo-950/50 text-indigo-100' : 'bg-gray-50 text-gray-700 border border-gray-100'}`}>
                            <p className="text-sm font-medium leading-relaxed">{pedido.itens_comprados.replace('[SERVIÇO] ', '')}</p>
                          </div>
                          
                          <div className="flex justify-between items-end mb-6">
                            <div>
                              <p className={`text-[10px] uppercase font-bold mb-1 ${isServico ? 'text-indigo-300' : 'text-gray-400'}`}>Endereço / Local</p>
                              <p className={`font-semibold text-sm ${isServico ? 'text-white' : 'text-gray-800'}`}>{pedido.endereco_entrega}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-[10px] uppercase font-bold mb-1 ${isServico ? 'text-indigo-300' : 'text-gray-400'}`}>Total</p>
                              <p className={`text-xl font-black ${isServico ? 'text-indigo-300' : 'text-[#E53E3E]'}`}>
                                {pedido.valor_total === 0 ? 'A Combinar' : `${pedido.valor_total} CFA`}
                              </p>
                            </div>
                          </div>

                          {pedido.metodo_pagamento === 'Orange Money' && (
                            <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-bold flex flex-col ${isServico ? 'bg-indigo-800 text-indigo-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                              <span>Pago via Orange Money</span>
                              <span className="font-mono text-sm">TXN: {pedido.codigo_transacao}</span>
                            </div>
                          )}

                          <button 
                            onClick={() => avisarClienteWhatsApp(pedido.nome_cliente, pedido.celular_cliente, pedido.itens_comprados, 'Contato')}
                            className="w-full mb-3 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all active:scale-95"
                          >
                            <PhoneCall size={18} /> Contactar Cliente
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            {pedido.status === 'Pendente' && (
                              <>
                                <button onClick={() => {
                                  atualizarStatusPedido(pedido.id, 'Em Preparação');
                                  if(!isServico) avisarClienteWhatsApp(pedido.nome_cliente, pedido.celular_cliente, pedido.itens_comprados, 'Em Preparação');
                                }} className="flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition">
                                  <Check size={16} /> Aceitar
                                </button>
                                <button onClick={() => atualizarStatusPedido(pedido.id, 'Cancelado')} className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-sm font-bold transition ${isServico ? 'bg-indigo-800 text-indigo-300 hover:bg-indigo-700' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                                  <X size={16} /> Recusar
                                </button>
                              </>
                            )}
                            {pedido.status === 'Em Preparação' && (
                              <button onClick={() => {
                                atualizarStatusPedido(pedido.id, 'Entregue');
                                if(!isServico) avisarClienteWhatsApp(pedido.nome_cliente, pedido.celular_cliente, pedido.itens_comprados, 'Entregue');
                              }} className="col-span-2 flex items-center justify-center gap-1 bg-green-500 text-white px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 shadow-md transition">
                                <Check size={16} /> Marcar como Concluído
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* TELA DO CARDÁPIO */}
            {/* ========================================= */}
            {abaAtiva === 'produtos' && (
              <div className="animate-fade-in bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                          <td className="p-4 text-[#F97316] font-bold">{prato.preco} CFA</td>
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
              </div>
            )}

            {/* ========================================= */}
            {/* 👈 NOVO: TELA DE CLIENTES */}
            {/* ========================================= */}
            {abaAtiva === 'clientes' && (
              <div className="animate-fade-in bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-orange-50 border-b border-orange-100 text-sm text-orange-800 font-medium">
                  Controle o acesso dos seus clientes. Clientes desativados não poderão fazer login ou enviar pedidos.
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap sm:whitespace-normal">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <tr>
                        <th className="p-4 font-semibold">Cliente</th>
                        <th className="p-4 font-semibold">Contato</th>
                        <th className="p-4 font-semibold">Endereço Principal</th>
                        <th className="p-4 font-semibold hidden sm:table-cell">Acesso</th>
                        <th className="p-4 font-semibold text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhum cliente cadastrado ainda.</td></tr>
                      ) : (
                        clientes.map((cliente) => (
                          <tr key={cliente.id} className={`border-b border-gray-100 transition ${cliente.status === 'Desativado' ? 'bg-red-50/50 opacity-80' : 'hover:bg-gray-50'}`}>
                            <td className="p-4">
                              <p className="font-bold text-gray-800">{cliente.nome}</p>
                            </td>
                            <td className="p-4 text-gray-600 font-medium">{cliente.celular}</td>
                            <td className="p-4 text-gray-500 text-sm max-w-[200px] truncate" title={cliente.endereco}>{cliente.endereco}</td>
                            <td className="p-4 hidden sm:table-cell">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${cliente.status === 'Desativado' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                {cliente.status}
                              </span>
                            </td>
                            <td className="p-4 flex justify-center space-x-2">
                              {/* Botão de Bloquear/Desbloquear */}
                              <button 
                                onClick={() => mudarStatusCliente(cliente.id, cliente.status)} 
                                className={`p-2 rounded-lg transition ${cliente.status === 'Desativado' ? 'text-green-600 hover:bg-green-100' : 'text-orange-500 hover:bg-orange-100'}`} 
                                title={cliente.status === 'Desativado' ? 'Ativar Cadastro' : 'Bloquear Cadastro'}
                              >
                                {cliente.status === 'Desativado' ? <UserCheck size={18} /> : <UserX size={18} />}
                              </button>
                              
                              {/* Botão de Lixeira */}
                              <button onClick={() => apagarCliente(cliente.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition" title="Excluir Permanentemente">
                                <Trash size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL DO CARDÁPIO */}
      {isModalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="bg-[#1E293B] p-5 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">{idEditando ? 'Editar Prato' : 'Novo Prato'}</h3>
              <button onClick={() => setIsModalAberto(false)} className="hover:bg-white/10 p-1.5 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={salvarPrato} className="p-6 space-y-4">
              <input required type="text" placeholder="Nome do Prato" value={novoPrato.nome} onChange={e => setNovoPrato({...novoPrato, nome: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none"/>
              <input required type="number" placeholder="Preço (CFA)" value={novoPrato.preco} onChange={e => setNovoPrato({...novoPrato, preco: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none"/>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative bg-gray-50/50">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setArquivoImagem(e.target.files[0])} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <UploadCloud size={28} className="text-[#F97316] mb-2" />
                  <span className="text-sm text-gray-700 font-bold">
                    {arquivoImagem ? arquivoImagem.name : (idEditando ? 'Clique para trocar a foto' : 'Clique para anexar uma foto')}
                  </span>
                  {!arquivoImagem && <span className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</span>}
                </div>
              </div>

              <textarea required placeholder="Descrição do Prato (ingredientes, etc)" value={novoPrato.descricao} onChange={e => setNovoPrato({...novoPrato, descricao: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl h-24 focus:ring-2 focus:ring-[#F97316] outline-none"></textarea>
              <button type="submit" disabled={adicionando} className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md ${adicionando ? 'bg-gray-400' : 'bg-[#F97316] hover:bg-orange-600 active:scale-95'}`}>
                {adicionando ? 'A Salvar...' : (idEditando ? 'Atualizar Prato' : 'Adicionar ao Cardápio')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}