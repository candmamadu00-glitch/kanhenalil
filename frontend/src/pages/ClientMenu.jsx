import { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, X, Trash2, CheckCircle2, ClipboardList, Search, MessageCircle, Wallet, Briefcase, Utensils, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
// 👇 Importamos as Notificações e a Proteção do Cloudflare
import toast from 'react-hot-toast';
import { Turnstile } from '@marsidev/react-turnstile';

export default function ClientMenu() {
  const navigate = useNavigate();

  // Estados Gerais
  const [abaAtiva, setAbaAtiva] = useState('cardapio'); 
  const [carregando, setCarregando] = useState(true);
  
  // Estados do Cardápio e Carrinho
  const [pratos, setPratos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Estados do Cliente
  const [nomeCliente, setNomeCliente] = useState(localStorage.getItem('clienteNome') || '');
  const [celularCliente, setCelularCliente] = useState(localStorage.getItem('clienteCelular') || '');
  const [enderecoEntrega, setEnderecoEntrega] = useState(localStorage.getItem('clienteEndereco') || '');
  
  // Pagamento e Envios
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');
  const [codigoTransacao, setCodigoTransacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Status e Histórico
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [telefoneBusca, setTelefoneBusca] = useState(localStorage.getItem('clienteCelular') || '');
  const [meusPedidos, setMeusPedidos] = useState([]);
  const [buscandoPedidos, setBuscandoPedidos] = useState(false);

  // Estados para Modal de Serviço
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [detalhesServico, setDetalhesServico] = useState('');
  const [dataServico, setDataServico] = useState('');

  // 👇 Estados de Proteção Anti-Robôs
  const [captchaTokenComida, setCaptchaTokenComida] = useState(null);
  const [captchaTokenServico, setCaptchaTokenServico] = useState(null);

  const listaServicos = [
    { nome: 'Culinária & Restaurante', desc: 'Buffet completo, cozinheiros e preparo de refeições no local.' },
    { nome: 'Serviços Domésticos', desc: 'Limpeza, organização e manutenção da sua casa com confiança.' },
    { nome: 'Suporte de Eventos', desc: 'Equipe completa, garçons, e logística para o seu evento.' },
    { nome: 'Coffee Break', desc: 'Pausas corporativas com lanches frescos e de alta qualidade.' },
    { nome: 'Seminários', desc: 'Apoio logístico e alimentar para reuniões e conferências.' },
    { nome: 'Casamentos', desc: 'Assessoria de buffet e serviços premium para o seu grande dia.' },
  ];

  useEffect(() => {
    const buscarPratos = async () => {
      try {
        const { data, error } = await supabase.from('produtos').select('*').eq('status', 'Disponível');
        if (error) throw error;
        setPratos(data);
      } catch (error) {
        toast.error("Erro ao carregar cardápio.");
      } finally {
        setCarregando(false);
      }
    };
    buscarPratos();
  }, []);

  const handleSair = () => navigate('/');

  const adicionarAoCarrinho = (prato) => {
    setCarrinho([...carrinho, prato]);
    setSucesso(false); 
    toast.success(`${prato.nome} adicionado!`);
  };

  const removerDoCarrinho = (indexParaRemover) => {
    setCarrinho(carrinho.filter((_, index) => index !== indexParaRemover));
  };

  const valorTotal = carrinho.reduce((total, prato) => {
    const numeroLimpo = String(prato.preco).replace(/\D/g, "");
    return total + Number(numeroLimpo);
  }, 0);

  // Finalizar Comida (Carrinho)
  const finalizarPedido = async (e) => {
    e.preventDefault();
    
    // Verificações de segurança
    if (!captchaTokenComida) {
      toast.error("Por favor, verifique a segurança do Cloudflare!");
      return;
    }
    
    if (metodoPagamento === 'Orange Money' && codigoTransacao.trim() === '') {
      toast.error("Digite o código da transação do Orange Money.");
      return;
    }
    
    setEnviando(true);
    const nomesDosItens = carrinho.map(item => item.nome).join(', ');
    const celularLimpoParaOBanco = celularCliente.replace(/\D/g, '');

    try {
      const { error } = await supabase.from('pedidos').insert([
        { 
          nome_cliente: nomeCliente, 
          celular_cliente: celularLimpoParaOBanco,
          endereco_entrega: enderecoEntrega, 
          itens_comprados: nomesDosItens, 
          valor_total: valorTotal, 
          status: 'Pendente',
          metodo_pagamento: metodoPagamento,
          codigo_transacao: metodoPagamento === 'Orange Money' ? codigoTransacao : null
        }
      ]);
      if (error) throw error;
      
      setCarrinho([]); setIsCartOpen(false); setSucesso(true);
      setTelefoneBusca(celularLimpoParaOBanco); setCodigoTransacao('');
      setCaptchaTokenComida(null); // Reseta o captcha após o sucesso
      
      toast.success("Pedido enviado com sucesso!");
      setTimeout(() => setIsStatusOpen(true), 1500); 
    } catch (error) {
      toast.error("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  // Solicitar Serviço Diretamente
  const solicitarServico = async (e) => {
    e.preventDefault();
    
    // Verificação de segurança
    if (!captchaTokenServico) {
      toast.error("Por favor, verifique a segurança do Cloudflare!");
      return;
    }

    setEnviando(true);
    const celularLimpo = celularCliente.replace(/\D/g, '');
    const descricaoPedido = `[SERVIÇO] ${servicoSelecionado.nome} | Data: ${dataServico} | Detalhes: ${detalhesServico}`;

    try {
      const { error } = await supabase.from('pedidos').insert([
        { 
          nome_cliente: nomeCliente, 
          celular_cliente: celularLimpo,
          endereco_entrega: enderecoEntrega, 
          itens_comprados: descricaoPedido, 
          valor_total: 0, 
          status: 'Pendente',
          metodo_pagamento: 'Orçamento (A Combinar)'
        }
      ]);
      if (error) throw error;
      
      setIsServiceModalOpen(false);
      setDetalhesServico(''); setDataServico('');
      setSucesso(true);
      setTelefoneBusca(celularLimpo);
      setCaptchaTokenServico(null); // Reseta o captcha
      
      toast.success("Serviço solicitado com sucesso!");
      setTimeout(() => setIsStatusOpen(true), 1500);
    } catch (error) {
      toast.error("Erro ao solicitar serviço.");
    } finally {
      setEnviando(false);
    }
  };

  const buscarMeusPedidos = async (e) => {
    e.preventDefault();
    setBuscandoPedidos(true);
    const buscaLimpa = telefoneBusca.replace(/\D/g, '');
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('celular_cliente', buscaLimpa)
        .order('id', { ascending: false });
      if (error) throw error;
      setMeusPedidos(data);
    } catch (error) {
      toast.error("Erro ao buscar pedidos.");
    } finally {
      setBuscandoPedidos(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-[#F97316] selection:text-white">
      {/* CABEÇALHO PREMIUM */}
      <header className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white pt-6 pb-20 px-4 rounded-b-[40px] shadow-2xl relative">
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Guinea-Bissau.svg')] bg-cover bg-center opacity-5 rounded-b-[40px]"></div>
        <div className="max-w-4xl mx-auto flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-[#F97316] shadow-lg" />
            <div>
              <h1 className="text-xl font-black tracking-tight leading-tight">KANHEN ALIL</h1>
              <p className="text-[#F97316] text-xs font-bold tracking-widest uppercase">Multiserviços</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsStatusOpen(true)} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition shadow-lg">
              <ClipboardList size={22} className="text-white" />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-[#F97316] hover:bg-orange-600 rounded-xl transition shadow-lg shadow-orange-500/30">
              <ShoppingCart size={22} className="text-white" />
              {carrinho.length > 0 && <span className="absolute -top-2 -right-2 bg-white text-[#F97316] text-xs font-black rounded-full h-6 w-6 flex items-center justify-center shadow-md animate-bounce">{carrinho.length}</span>}
            </button>
            <button onClick={handleSair} className="p-2.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-xl transition">
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="max-w-md mx-auto -mt-8 relative z-20 px-4">
        <div className="bg-white p-1.5 rounded-2xl shadow-xl border border-gray-100 flex gap-2">
          <button 
            onClick={() => setAbaAtiva('cardapio')} 
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${abaAtiva === 'cardapio' ? 'bg-[#1E293B] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Utensils size={18} /> Cardápio
          </button>
          <button 
            onClick={() => setAbaAtiva('servicos')} 
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${abaAtiva === 'servicos' ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Briefcase size={18} /> Serviços
          </button>
        </div>
      </div>

      {sucesso && (
        <div className="max-w-4xl mx-auto mt-6 px-4 animate-fade-in">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-green-100">
            <CheckCircle2 size={28} className="text-green-500" />
            <div>
              <p className="font-bold text-sm">Solicitação enviada com sucesso!</p>
              <p className="text-xs opacity-80">Nossa equipe entrará em contato em breve.</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto p-4 mt-6">
        
        {/* ABA: CARDÁPIO */}
        {abaAtiva === 'cardapio' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-black text-[#1E293B] mb-6 flex items-center gap-2">
              <span className="bg-[#E53E3E] w-2 h-8 rounded-full"></span> Pratos de Hoje
            </h2>
            
            {carregando ? (
              <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#F97316] mx-auto"></div></div>
            ) : pratos.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"><p className="text-gray-500 font-medium">Nenhum prato disponível no momento.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pratos.map((prato) => (
                  <div key={prato.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden flex flex-row transition-all duration-300 group">
                    <div className="relative w-32 sm:w-40 overflow-hidden">
                      <img src={prato.imagem} alt={prato.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 leading-tight">{prato.nome}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">{prato.descricao}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-black text-[#E53E3E] text-lg">{prato.preco} <span className="text-xs">CFA</span></span>
                        <button onClick={() => adicionarAoCarrinho(prato)} className="bg-[#1E293B] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#F97316] active:scale-95 transition-all shadow-md">Add +</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: SERVIÇOS */}
        {abaAtiva === 'servicos' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-black text-[#1E293B] mb-6 flex items-center gap-2">
              <span className="bg-[#F97316] w-2 h-8 rounded-full"></span> Solicite um Serviço
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listaServicos.map((servico, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all group cursor-pointer" onClick={() => { setServicoSelecionado(servico); setIsServiceModalOpen(true); }}>
                  <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center text-[#F97316] mb-4 group-hover:bg-[#F97316] group-hover:text-white transition-colors">
                    <Briefcase size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{servico.nome}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{servico.desc}</p>
                  <button className="text-[#F97316] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Solicitar Orçamento <span className="text-lg">→</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE SOLICITAÇÃO DE SERVIÇO */}
      {isServiceModalOpen && servicoSelecionado && (
        <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-[#0F172A]/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-[#F97316] to-orange-500 p-6 text-white relative">
              <button onClick={() => setIsServiceModalOpen(false)} className="absolute top-4 right-4 bg-white/20 p-1.5 rounded-full hover:bg-white/40 transition"><X size={20}/></button>
              <Briefcase size={32} className="mb-2 opacity-80" />
              <h2 className="text-2xl font-black">{servicoSelecionado.nome}</h2>
              <p className="text-orange-100 text-sm mt-1">Solicite um orçamento sem compromisso.</p>
            </div>
            
            <form onSubmit={solicitarServico} className="p-6 space-y-4 bg-gray-50 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Desejada</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input required type="date" value={dataServico} onChange={(e) => setDataServico(e.target.value)} className="w-full border border-gray-200 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none text-sm bg-white"/>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detalhes do Pedido</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <textarea required placeholder="Ex: Preciso de serviço..." value={detalhesServico} onChange={(e) => setDetalhesServico(e.target.value)} className="w-full border border-gray-200 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none text-sm min-h-[100px] bg-white"></textarea>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="text-xs text-orange-800 font-medium">Enviaremos em nome de: <strong>{nomeCliente}</strong></p>
                <p className="text-xs text-orange-800 font-medium">Celular de contato: <strong>{celularCliente}</strong></p>
              </div>

              {/* 👇 PROTEÇÃO DO CLOUDFLARE PARA OS SERVIÇOS */}
              <div className="flex justify-center py-2">
                <Turnstile
                  siteKey="0x4AAAAAAC0yBAA2GO4d0UUy"
                  onSuccess={(token) => setCaptchaTokenServico(token)}
                  onError={() => toast.error('Erro de segurança. Tente atualizar a página.')}
                />
              </div>

              <button 
                type="submit" 
                disabled={enviando || !captchaTokenServico} 
                className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-2 ${enviando || !captchaTokenServico ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1E293B] hover:bg-black active:scale-95'}`}
              >
                {enviando ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DO CARRINHO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-5 bg-[#1E293B] text-white flex justify-between items-center shadow-md">
              <h2 className="text-xl font-black flex items-center gap-2"><ShoppingCart size={24} className="text-[#F97316]"/> Seu Pedido</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {carrinho.length === 0 ? (
                <div className="text-center text-gray-500 mt-20"><p>O seu carrinho está vazio.</p></div>
              ) : (
                <div className="space-y-3">
                  {carrinho.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                      <div><p className="font-bold text-gray-800">{item.nome}</p><p className="text-[#E53E3E] font-black text-sm">{item.preco} CFA</p></div>
                      <button onClick={() => removerDoCarrinho(index)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrinho.length > 0 && (
              <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] overflow-y-auto max-h-[60vh]">
                <div className="flex justify-between items-center mb-6"><span className="text-gray-500 font-bold uppercase text-xs">Total a pagar</span><span className="text-3xl font-black text-[#1E293B]">{valorTotal} <span className="text-sm">CFA</span></span></div>
                
                <form onSubmit={finalizarPedido} className="space-y-3">
                  <input required type="text" placeholder="O seu Nome" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} className="w-full border bg-gray-50 p-3.5 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none text-sm font-medium"/>
                  <input required type="tel" placeholder="Seu Celular" value={celularCliente} onChange={(e) => setCelularCliente(e.target.value)} className="w-full border bg-gray-50 p-3.5 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none text-sm font-medium"/>
                  <input required type="text" placeholder="Endereço de Entrega" value={enderecoEntrega} onChange={(e) => setEnderecoEntrega(e.target.value)} className="w-full border bg-gray-50 p-3.5 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none text-sm font-medium"/>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="font-bold text-[#1E293B] mb-3 text-sm flex items-center gap-2 uppercase tracking-wide"><Wallet size={16} className="text-[#F97316]"/> Forma de Pagamento</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button type="button" onClick={() => setMetodoPagamento('Dinheiro')} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${metodoPagamento === 'Dinheiro' ? 'bg-[#1E293B] text-white border-[#1E293B]' : 'bg-white text-gray-500 border-gray-200'}`}>Dinheiro</button>
                      <button type="button" onClick={() => setMetodoPagamento('Orange Money')} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${metodoPagamento === 'Orange Money' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200'}`}>Orange Money</button>
                    </div>

                    {metodoPagamento === 'Orange Money' && (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-4 animate-fade-in">
                        <p className="text-sm text-orange-800 mb-2">1. Transfira <strong>{valorTotal} CFA</strong> para: <br/><span className="font-black text-xl tracking-wider text-[#F97316]">667 1866</span></p>
                        <p className="text-sm text-orange-800 mb-1 font-bold mt-4">2. Código da transação:</p>
                        <input required={metodoPagamento === 'Orange Money'} type="text" placeholder="Ex: PP2304..." value={codigoTransacao} onChange={(e) => setCodigoTransacao(e.target.value)} className="w-full border-2 border-orange-300 p-3 rounded-xl focus:border-orange-500 outline-none text-sm font-mono uppercase bg-white"/>
                      </div>
                    )}
                  </div>

                  {/* 👇 PROTEÇÃO DO CLOUDFLARE PARA O CARRINHO */}
                  <div className="flex justify-center py-2">
                    <Turnstile
                      siteKey="0x4AAAAAAC0yBAA2GO4d0UUy"
                      onSuccess={(token) => setCaptchaTokenComida(token)}
                      onError={() => toast.error('Erro de segurança. Tente atualizar a página.')}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={enviando || !captchaTokenComida} 
                    className={`w-full text-white font-black py-4 rounded-xl shadow-lg transition-all mt-4 ${enviando || !captchaTokenComida ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E53E3E] hover:bg-red-700 active:scale-95'}`}
                  >
                    {enviando ? 'Processando...' : 'Finalizar Pedido'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE STATUS DOS PEDIDOS */}
      {isStatusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-sm p-4">
          <div className="bg-gray-50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1E293B] p-5 flex justify-between items-center text-white">
              <h3 className="font-black text-lg flex items-center gap-2"><ClipboardList size={22} className="text-[#F97316]"/> Histórico</h3>
              <button onClick={() => setIsStatusOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition"><X size={20}/></button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={buscarMeusPedidos} className="mb-6 flex gap-2">
                <input required type="tel" placeholder="Seu celular cadastrado..." value={telefoneBusca} onChange={(e) => setTelefoneBusca(e.target.value)} className="flex-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#F97316] outline-none font-medium"/>
                <button type="submit" disabled={buscandoPedidos} className="bg-[#1E293B] text-white px-5 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center shadow-md">
                  {buscandoPedidos ? '...' : <Search size={20}/>}
                </button>
              </form>

              {meusPedidos.length === 0 && !buscandoPedidos && telefoneBusca !== '' && (
                <p className="text-center text-gray-500 font-medium bg-white p-4 rounded-xl border border-dashed border-gray-300">Nenhum pedido/serviço encontrado.</p>
              )}

              <div className="space-y-4">
                {meusPedidos.map((pedido) => {
                  const isServico = pedido.itens_comprados.includes('[SERVIÇO]');
                  return (
                    <div key={pedido.id} className={`border rounded-2xl p-5 relative overflow-hidden shadow-sm ${isServico ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-100'}`}>
                      {isServico && <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider">Serviço</div>}
                      
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-black text-[#1E293B]"># {pedido.id}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${pedido.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : pedido.status === 'Em Preparação' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {pedido.status}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 font-medium leading-relaxed ${isServico ? 'text-indigo-900' : 'text-gray-600'}`}>{pedido.itens_comprados.replace('[SERVIÇO] ', '')}</p>
                      
                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-200/50">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Total</p>
                          <p className={`text-lg font-black ${isServico ? 'text-indigo-600' : 'text-[#E53E3E]'}`}>{pedido.valor_total === 0 ? 'A Combinar' : `${pedido.valor_total} CFA`}</p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600">
                          {pedido.metodo_pagamento}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão de WhatsApp Flutuante */}
      <a href="https://wa.me/2456671866?text=Olá!%20Estou%20no%20sistema%20e%20preciso%20de%20ajuda." target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-[0_8px_30px_rgb(34,197,94,0.4)] hover:bg-green-600 hover:scale-110 transition-transform duration-300 z-40 flex items-center justify-center">
        <MessageCircle size={32} />
      </a>
    </div>
  );
}