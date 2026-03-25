import { useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  Home as HomeIcon, 
  PartyPopper, 
  Coffee, 
  Briefcase, 
  Heart, 
  ArrowRight, 
  Phone 
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const servicos = [
    { nome: 'Culinária & Restaurante', icone: <Utensils size={32} />, desc: 'O melhor sabor da Guiné para a sua mesa.' },
    { nome: 'Serviços Domésticos', icone: <HomeIcon size={32} />, desc: 'Limpeza e organização profissional para sua casa.' },
    { nome: 'Suporte de Eventos', icone: <PartyPopper size={32} />, desc: 'Organização completa para que o seu evento seja um sucesso.' },
    { nome: 'Coffee Break', icone: <Coffee size={32} />, desc: 'Pausas deliciosas para reuniões e encontros.' },
    { nome: 'Seminários', icone: <Briefcase size={32} />, desc: 'Estrutura e alimentação corporativa de excelência.' },
    { nome: 'Casamentos', icone: <Heart size={32} />, desc: 'Serviços de buffet e apoio para o dia mais especial da sua vida.' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans">
      
      {/* CABEÇALHO (HERO SECTION) */}
      <header className="relative pt-20 pb-32 px-4 text-center overflow-hidden">
        {/* Fundo com a bandeira desfocada para dar um toque guineense */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Guinea-Bissau.svg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <img 
            src="/logo.jpeg" 
            alt="Logo Kanhen Alil" 
            className="w-40 h-40 rounded-full shadow-2xl border-4 border-[#F97316] object-cover mb-8 hover:scale-105 transition-transform"
          />
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            KANHEN ALIL <span className="text-[#F97316]">MULTISERVIÇOS</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
            Excelência em culinária, organização de eventos e serviços domésticos. 
            Tudo o que você precisa, com a qualidade que você merece.
          </p>
          
          {/* BOTÃO PARA ENTRAR NO SISTEMA */}
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#F97316] hover:bg-orange-600 text-white font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            Acessar o Sistema / Fazer Pedido
            <ArrowRight size={24} />
          </button>
        </div>
      </header>

      {/* SEÇÃO DE SERVIÇOS */}
      <section className="py-20 px-4 bg-[#1E293B]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Nossos Serviços</h2>
            <div className="w-24 h-1 bg-[#F97316] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicos.map((servico, index) => (
              <div key={index} className="bg-[#0F172A] p-8 rounded-2xl border border-gray-800 hover:border-[#F97316]/50 transition-colors group">
                <div className="bg-gray-800/50 w-16 h-16 rounded-xl flex items-center justify-center text-[#F97316] mb-6 group-hover:bg-[#F97316] group-hover:text-white transition-colors">
                  {servico.icone}
                </div>
                <h3 className="text-xl font-bold mb-3">{servico.nome}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {servico.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RODAPÉ E CONTATOS */}
      <footer className="bg-black py-12 px-4 text-center border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Fale Conosco</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            <a 
              href="https://wa.me/245955524966" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              <Phone size={20} />
              +245 955524966
            </a>
            <a 
              href="https://wa.me/245966671866" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              <Phone size={20} />
              +245 966671866
            </a>
          </div>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Kanhen Alil Multiserviços. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}