import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { 
  Utensils, 
  Home as HomeIcon, 
  PartyPopper, 
  Coffee, 
  Briefcase, 
  Heart, 
  ArrowRight, 
  Phone,
  ChevronDown,
  ShoppingCart
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [pratos, setPratos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarPratos = async () => {
      try {
        const { data, error } = await supabase.from('produtos').select('*').eq('status', 'Disponível');
        if (error) throw error;
        setPratos(data);
      } catch (error) {
        console.error("Erro ao buscar pratos:", error.message);
      } finally {
        setCarregando(false);
      }
    };
    buscarPratos();
  }, []);

  const servicos = [
    { nome: 'Culinária & Restaurante', icone: <Utensils size={32} />, desc: 'O melhor sabor da Guiné para a sua mesa.' },
    { nome: 'Serviços Domésticos', icone: <HomeIcon size={32} />, desc: 'Limpeza e organização profissional para sua casa.' },
    { nome: 'Suporte de Eventos', icone: <PartyPopper size={32} />, desc: 'Organização completa para que o seu evento seja um sucesso.' },
    { nome: 'Coffee Break', icone: <Coffee size={32} />, desc: 'Pausas deliciosas para reuniões e encontros.' },
    { nome: 'Seminários', icone: <Briefcase size={32} />, desc: 'Estrutura e alimentação corporativa de excelência.' },
    { nome: 'Casamentos', icone: <Heart size={32} />, desc: 'Serviços de buffet e apoio para o dia mais especial da sua vida.' },
  ];

  const rolarParaCardapio = () => {
    document.getElementById('cardapio-vitrine').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-[#F97316] selection:text-white">
      
      {/* CABEÇALHO (HERO SECTION) */}
      <header className="relative min-h-screen flex flex-col justify-center px-4 text-center overflow-hidden">
        {/* Fundo com a foto de um restaurante de luxo */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/80 via-[#0F172A]/40 to-[#0F172A]"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center mt-[-10vh]">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-[#F97316] rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
            <img 
              src="/logo.jpeg"  
              alt="Logo Kanhen Alil" 
              className="relative w-44 h-44 rounded-full shadow-2xl border-4 border-[#F97316] object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight drop-shadow-2xl">
            KANHEN ALIL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-orange-400">MULTISERVIÇOS</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto font-medium drop-shadow-lg leading-relaxed">
            Excelência em culinária, organização de eventos e serviços domésticos. 
            A qualidade que você merece.
          </p>
          
          <button 
            onClick={() => navigate('/login')}
            className="group relative inline-flex items-center justify-center gap-3 bg-[#F97316] text-white font-black text-xl py-5 px-12 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(249,115,22,0.5)] animate-[pulse_2s_ease-in-out_infinite]"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-3">
              Entrar no Sistema
              <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
        </div>

        <div 
          onClick={rolarParaCardapio}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] drop-shadow-md">Ver Cardápio</span>
          <ChevronDown size={40} className="text-[#F97316] animate-bounce drop-shadow-md" />
        </div>
      </header>

      {/* RESTO DO CÓDIGO DO HOME CONTINUA IGUAL... */}
      <section id="cardapio-vitrine" className="py-24 px-4 bg-[#0F172A] relative border-t border-white/5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F97316] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">Pratos em <span className="text-[#F97316]">Destaque</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Delicie-se com o nosso cardápio. Para pedir, basta aceder à sua conta!</p>
            <div className="w-24 h-1.5 bg-[#F97316] mx-auto rounded-full mt-8 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
          </div>

          {carregando ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#F97316]"></div>
            </div>
          ) : pratos.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-xl font-medium">Novas delícias a caminho...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pratos.map((prato) => (
                <div key={prato.id} className="group relative bg-[#1E293B]/60 backdrop-blur-md rounded-[2rem] overflow-hidden border border-white/10 hover:border-[#F97316]/60 transition-all duration-500 hover:shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-all duration-500 z-10"></div>
                    <img src={prato.imagem} alt={prato.nome} className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-1000" />
                    <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white font-black px-5 py-2 rounded-full border border-white/20 shadow-2xl">
                      {prato.preco} <span className="text-[#F97316] text-sm">CFA</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-[#F97316] transition-colors">{prato.nome}</h3>
                    <p className="text-gray-400 line-clamp-2 text-sm mb-8 leading-relaxed">{prato.descricao}</p>
                    <button 
                      onClick={() => navigate('/login')} 
                      className="w-full relative overflow-hidden bg-[#F97316]/10 text-[#F97316] hover:text-white border border-[#F97316]/40 hover:border-transparent font-black py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                      <span className="absolute inset-0 bg-[#F97316] w-0 group-hover/btn:w-full transition-all duration-300 ease-out z-0"></span>
                      <span className="relative z-10 flex items-center gap-2 text-lg">
                        Fazer Pedido <ShoppingCart size={20} className="group-hover/btn:animate-bounce" />
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-[#1E293B] to-[#0F172A] relative border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Nossos <span className="text-[#F97316]">Serviços</span></h2>
            <div className="w-24 h-1.5 bg-[#F97316] mx-auto rounded-full mt-6 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicos.map((servico, index) => (
              <div key={index} className="bg-[#0F172A]/80 backdrop-blur-sm p-8 rounded-3xl border border-white/5 hover:border-[#F97316]/50 hover:-translate-y-2 transition-all duration-300 group shadow-lg">
                <div className="bg-[#1E293B] w-20 h-20 rounded-2xl flex items-center justify-center text-[#F97316] mb-8 group-hover:bg-[#F97316] group-hover:text-white group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 transform group-hover:rotate-12">
                  {servico.icone}
                </div>
                <h3 className="text-2xl font-bold mb-4">{servico.nome}</h3>
                <p className="text-gray-400 leading-relaxed font-light">{servico.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-black py-16 px-4 text-center border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md h-1 bg-gradient-to-r from-transparent via-[#F97316] to-transparent opacity-50"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-black mb-8">Fale Connosco</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <a href="https://wa.me/245955524966" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1DA851] text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,211,102,0.4)]">
              <Phone size={24} /> +245 955524966
            </a>
            <a href="https://wa.me/245966671866" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1DA851] text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,211,102,0.4)]">
              <Phone size={24} /> +245 966671866
            </a>
          </div>
          <p className="text-gray-500 text-sm tracking-wider font-light uppercase">
            © {new Date().getFullYear()} Kanhen Alil Multiserviços. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}