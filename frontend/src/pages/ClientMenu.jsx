import { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, X, Trash2, CheckCircle2, ClipboardList, Search, MessageCircle, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function ClientMenu() {
  const navigate = useNavigate();

  const [pratos, setPratos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carrinho, setCarrinho] = useState([]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [nomeCliente, setNomeCliente] = useState(localStorage.getItem('clienteNome') || '');
  const [celularCliente, setCelularCliente] = useState(localStorage.getItem('clienteCelular') || '');
  const [enderecoEntrega, setEnderecoEntrega] = useState(localStorage.getItem('clienteEndereco') || '');
  
  // NOVOS ESTADOS PARA O PAGAMENTO
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');
  const [codigoTransacao, setCodigoTransacao] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [telefoneBusca, setTelefoneBusca] = useState(localStorage.getItem('clienteCelular') || '');
  const [meusPedidos, setMeusPedidos] = useState([]);
  const [buscandoPedidos, setBuscandoPedidos] = useState(false);

  useEffect(() => {
    const buscarPratos = async () => {
      try {
        const { data, error } = await supabase.from('produtos').select('*').eq('status', 'Disponível');
        if (error) throw error;
        setPratos(data);
      } catch (error) {
        console.error("Erro:", error.message);
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
  };

  const removerDoCarrinho = (indexParaRemover) => {
    setCarrinho(carrinho.filter((_, index) => index !== indexParaRemover));
  };

  const valorTotal = carrinho.reduce((total, prato) => {
    const numeroLimpo = String(prato.preco).replace(/\D/g, "");
    return total + Number(numeroLimpo);
  }, 0);

  const finalizarPedido = async (e) => {
    e.preventDefault();
    
    // Validação extra para o Orange Money
    if (metodoPagamento === 'Orange Money' && codigoTransacao.trim() === '') {
      alert("Por favor, digite o código da transação do Orange Money.");
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
          metodo_pagamento: metodoPagamento, // Enviando o método
          codigo_transacao: metodoPagamento === 'Orange Money' ? codigoTransacao : null // Enviando o código se for Orange
        }
      ]);
      if (error) throw error;

      localStorage.setItem('clienteNome', nomeCliente);
      localStorage.setItem('clienteCelular', celularLimpoParaOBanco);
      localStorage.setItem('clienteEndereco', enderecoEntrega);

      setCarrinho([]); 
      setIsCartOpen(false); 
      setSucesso(true);
      setTelefoneBusca(celularLimpoParaOBanco);
      setCodigoTransacao(''); // Limpa o código para a próxima compra
      
    } catch (error) {
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const buscarMeusPedidos = async (e) => {
    e.preventDefault();
    setBuscandoPedidos(true);
    const buscaLimpaNoBanco = telefoneBusca.replace(/\D/g, '');

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('celular_cliente', buscaLimpaNoBanco)
        .order('id', { ascending: false });

      if (error) throw error;
      setMeusPedidos(data);
    } catch (error) {
      alert("Erro ao buscar pedidos.");
    } finally {
      setBuscandoPedidos(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary pb-20 relative">
      <header className="bg-primary text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <h1 className="text-xl font-bold tracking-wider">KANHEN ALIL</h1>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button onClick={() => setIsStatusOpen(true)} className="flex items-center gap-1.5 bg-red-800 hover:bg-red-700 px-3 py-2 rounded-lg transition text-sm font-medium">
              <ClipboardList size={18} /> <span className="hidden sm:inline">Meus Pedidos</span>
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-red-800 rounded-full hover:bg-red-700 transition">
              <ShoppingCart size={24} />
              {carrinho.length > 0 && <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md animate-bounce">{carrinho.length}</span>}
            </button>
            <button onClick={handleSair} className="flex items-center gap-2 bg-red-800 hover:bg-red-700 px-3 py-2 rounded-lg transition">
              <LogOut size={18} /> <span className="font-medium hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {sucesso && (
        <div className="max-w-4xl mx-auto mt-4 p-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-pulse">
            <CheckCircle2 size={24} />
            <p className="font-bold">Pedido enviado com sucesso! Acompanhe o status em "Meus Pedidos".</p>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-4 mt-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nosso Cardápio</h2>
        {carregando ? (
          <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div></div>
        ) : pratos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100"><p className="text-gray-500">Nenhum prato disponível no momento.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pratos.map((prato) => (
              <div key={prato.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-row hover:shadow-lg transition-all duration-300">
                <img src={prato.imagem} alt={prato.nome} className="w-32 sm:w-40 object-cover" />
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">{prato.nome}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1.5">{prato.descricao}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-extrabold text-primary text-lg">{prato.preco} CFA</span>
                    <button onClick={() => adicionarAoCarrinho(prato)} className="bg-accent text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 active:scale-95 transition-all">Adicionar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DO CARRINHO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-4 bg-primary text-white flex justify-between items-center shadow-md">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={24} /> Seu Pedido</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-red-800 rounded-full transition"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {carrinho.length === 0 ? (
                <div className="text-center text-gray-500 mt-20"><p>O seu carrinho está vazio.</p></div>
              ) : (
                <div className="space-y-4">
                  {carrinho.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded-xl shadow-sm border flex justify-between items-center">
                      <div><p className="font-bold text-gray-800">{item.nome}</p><p className="text-primary font-semibold text-sm">{item.preco} CFA</p></div>
                      <button onClick={() => removerDoCarrinho(index)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrinho.length > 0 && (
              <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] overflow-y-auto max-h-[60vh]">
                <div className="flex justify-between items-center mb-4"><span className="text-gray-600 font-semibold">Total a pagar:</span><span className="text-2xl font-black text-primary">{valorTotal} CFA</span></div>
                
                <form onSubmit={finalizarPedido} className="space-y-3">
                  <input required type="text" placeholder="O seu Nome" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 outline-none text-sm"/>
                  <input required type="tel" placeholder="Seu Celular" value={celularCliente} onChange={(e) => setCelularCliente(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 outline-none text-sm"/>
                  <input required type="text" placeholder="Endereço de Entrega" value={enderecoEntrega} onChange={(e) => setEnderecoEntrega(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 outline-none text-sm"/>
                  
                  {/* SEÇÃO DE PAGAMENTO */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-1"><Wallet size={16}/> Forma de Pagamento</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button type="button" onClick={() => setMetodoPagamento('Dinheiro')} className={`p-2 rounded-lg border text-sm font-semibold transition-all ${metodoPagamento === 'Dinheiro' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-300'}`}>Dinheiro (Na Entrega)</button>
                      <button type="button" onClick={() => setMetodoPagamento('Orange Money')} className={`p-2 rounded-lg border text-sm font-semibold transition-all flex items-center justify-center gap-1 ${metodoPagamento === 'Orange Money' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-300'}`}>Orange Money</button>
                    </div>

                    {/* CAIXA DE INSTRUÇÕES DO ORANGE MONEY */}
                    {metodoPagamento === 'Orange Money' && (
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl mb-3 animate-fade-in">
                        <p className="text-xs text-orange-800 mb-2">
                          1. Transfira <strong>{valorTotal} CFA</strong> para o número: <br/>
                          <span className="font-bold text-lg tracking-wider text-orange-600">667 1866</span>
                        </p>
                        <p className="text-xs text-orange-800 mb-1">2. Digite o código da transação abaixo:</p>
                        <input 
                          type="text" 
                          required={metodoPagamento === 'Orange Money'}
                          placeholder="Ex: PP2304..." 
                          value={codigoTransacao} 
                          onChange={(e) => setCodigoTransacao(e.target.value)} 
                          className="w-full border border-orange-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-mono uppercase"
                        />
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={enviando} className={`w-full text-white font-bold py-3.5 rounded-xl transition-all mt-2 ${enviando ? 'bg-gray-400' : 'bg-accent hover:bg-orange-600'}`}>
                    {enviando ? 'A enviar...' : 'Confirmar e Enviar Pedido'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL STATUS DO PEDIDO */}
      {isStatusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2"><ClipboardList size={20}/> Meus Pedidos</h3>
              <button onClick={() => setIsStatusOpen(false)} className="hover:bg-red-800 p-1 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={buscarMeusPedidos} className="mb-6 flex gap-2">
                <input required type="tel" placeholder="Digite seu celular..." value={telefoneBusca} onChange={(e) => setTelefoneBusca(e.target.value)} className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none"/>
                <button type="submit" disabled={buscandoPedidos} className="bg-accent text-white px-4 rounded-lg font-bold hover:bg-orange-600 flex items-center justify-center">
                  {buscandoPedidos ? '...' : <Search size={20}/>}
                </button>
              </form>

              {meusPedidos.length === 0 && !buscandoPedidos && telefoneBusca !== '' && (
                <p className="text-center text-gray-500 text-sm">Nenhum pedido encontrado.</p>
              )}

              <div className="space-y-4">
                {meusPedidos.map((pedido) => (
                  <div key={pedido.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-800 text-sm">Pedido #{pedido.id}</p>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${pedido.status === 'Pendente' ? 'bg-yellow-200 text-yellow-800' : pedido.status === 'Em Preparação' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                        {pedido.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{pedido.itens_comprados}</p>
                    <div className="flex justify-between items-end mt-3">
                      <p className="text-sm font-black text-primary">{pedido.valor_total} CFA</p>
                      
                      {/* MOSTRA O STATUS DO PAGAMENTO NO HISTÓRICO */}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${pedido.metodo_pagamento === 'Orange Money' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                        {pedido.metodo_pagamento || 'Dinheiro'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <a href="https://wa.me/2456671866?text=Olá!%20Estou%20no%20cardápio%20e%20preciso%20de%20ajuda." target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 hover:scale-110 transition-transform duration-300 z-40 flex items-center justify-center">
        <MessageCircle size={32} />
      </a>
    </div>
  );
}