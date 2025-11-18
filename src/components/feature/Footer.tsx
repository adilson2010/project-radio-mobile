
import { useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (sectionId: string) => {
    if (location.pathname === '/') {
      // Se já estiver na home, fazer scroll suave
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Se estiver em outra página, navegar para home com âncora
      navigate(`/#${sectionId}`);
      // Aguardar navegação e fazer scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handlePageNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="bg-gradient-to-br from-green-800 to-yellow-600 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Seção Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          
          {/* Logo e Descrição */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <img 
                src="https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg"
                alt="Ras Reggae Radio"
                className="w-16 h-16 rounded-full mr-4 shadow-lg"
              />
              <div>
                <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Pacifico, serif' }}>
                  Ras Reggae Radio
                </h3>
                <p className="text-yellow-200 text-sm opacity-90">A Voz Autêntica do Reggae</p>
              </div>
            </div>
            <p className="text-yellow-100 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
              A tua <b>Rádio Regggae!</b> 
              Transmissão 24 horas com a melhor seleção musical.
            </p>
          </div>

          {/* Nossa História */}
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold mb-6 text-yellow-200 flex items-center justify-center md:justify-start">
              <i className="ri-heart-line mr-2"></i>
              Nossa História
            </h4>
            <p className="text-yellow-100 text-sm leading-relaxed mb-4">
              Desde 2010, a Ras Reggae Radio tem sido a voz autêntica do reggae no Brasil e no mundo. 
              Nossa missão é espalhar a mensagem de amor, paz e humildade através da música reggae.
            </p>
            <p className="text-yellow-100 text-sm leading-relaxed">
              Com uma programação cuidadosamente selecionada, apresentamos desde os clássicos das decadas passadas 70,80,90 e anos atuais 2000, 
              até os novos talentos do reggae contemporâneo.
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold mb-6 text-yellow-200 flex items-center justify-center md:justify-start">
              <i className="ri-links-line mr-2"></i>
              Navegação
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleNavigation('home')}
                className="text-yellow-100 hover:text-white transition-colors text-sm flex items-center space-x-2 cursor-pointer justify-center md:justify-start"
              >
                <i className="ri-home-line w-4 h-4 flex items-center justify-center"></i>
                <span>Início</span>
              </button>
              <button 
                onClick={() => handleNavigation('player')}
                className="text-yellow-100 hover:text-white transition-colors text-sm flex items-center space-x-2 cursor-pointer justify-center md:justify-start"
              >
                <i className="ri-play-circle-line w-4 h-4 flex items-center justify-center"></i>
                <span>Player</span>
              </button>
              <button 
                onClick={() => handleNavigation('programacao')}
                className="text-yellow-100 hover:text-white transition-colors text-sm flex items-center space-x-2 cursor-pointer justify-center md:justify-start"
              >
                <i className="ri-calendar-line w-4 h-4 flex items-center justify-center"></i>
                <span>Programação</span>
              </button>
              <button 
                onClick={() => handlePageNavigation('/loja')}
                className="text-yellow-100 hover:text-white transition-colors text-sm flex items-center space-x-2 cursor-pointer justify-center md:justify-start"
              >
                <i className="ri-shopping-bag-line w-4 h-4 flex items-center justify-center"></i>
                <span>Loja</span>
              </button>
              <button 
                onClick={() => handleNavigation('app')}
                className="text-yellow-100 hover:text-white transition-colors text-sm flex items-center space-x-2 cursor-pointer justify-center md:justify-start"
              >
                <i className="ri-smartphone-line w-4 h-4 flex items-center justify-center"></i>
                <span>App</span>
              </button>
              <button 
                onClick={() => handleNavigation('contato')}
                className="text-yellow-100 hover:text-white transition-colors text-sm flex items-center space-x-2 cursor-pointer justify-center md:justify-start"
              >
                <i className="ri-mail-line w-4 h-4 flex items-center justify-center"></i>
                <span>Contato</span>
              </button>
            </div>
          </div>
        </div>

        {/* Seção de Contatos e Redes Sociais */}
        <div className="border-t border-yellow-600 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            
            {/* Contatos */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-yellow-200 flex items-center justify-center md:justify-start">
                <i className="ri-phone-line mr-2"></i>
                Contatos
              </h4>
              <div className="space-y-3">
                <a 
                  href="#home"
                  className="text-yellow-100 hover:text-white transition-colors text-sm flex items-center space-x-2 justify-center md:justify-start"
                >
                  <i className="ri-mail-line w-4 h-4 flex items-center justify-center"></i>
                  <span>no-reply@rasreggaeradio.com</span>
                </a>
                <a 
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-100 hover:text-white transition-colors text-sm flex items-center space-x-2 justify-center md:justify-start"
                >
                  <i className="ri-whatsapp-line w-4 h-4 flex items-center justify-center"></i>
                  <span>(00) 99999-9999</span>
                </a>
              </div>
            </div>

            {/* Redes Sociais */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-yellow-200 flex items-center justify-center md:justify-start">
                <i className="ri-share-line mr-2"></i>
                Redes Sociais
              </h4>
              <div className="flex space-x-6 justify-center md:justify-start">
                <a 
                  href="https://instagram.com/rasreggaeradio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-100 hover:text-white transition-colors transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <i className="ri-instagram-line text-2xl"></i>
                </a>
                <a 
                  href="https://facebook.com/rasreggaeradio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-100 hover:text-white transition-colors transform hover:scale-110"
                  aria-label="Facebook"
                >
                  <i className="ri-facebook-line text-2xl"></i>
                </a>
                <a 
                  href="https://twitter.com/rasreggaeradio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-100 hover:text-white transition-colors transform hover:scale-110"
                  aria-label="Twitter"
                >
                  <i className="ri-twitter-line text-2xl"></i>
                </a>
                <a 
                  href="https://youtube.com/radiorasreggae"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-100 hover:text-white transition-colors transform hover:scale-110"
                  aria-label="YouTube"
                >
                  <i className="ri-youtube-line text-2xl"></i>
                </a>
              </div>
            </div>

            {/* Informações Técnicas */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-yellow-200 flex items-center justify-center md:justify-start">
                <i className="ri-radio-line mr-2"></i>
                Transmissão
              </h4>
              <div className="space-y-2 text-sm text-yellow-100">
                <div className="flex items-center space-x-2 justify-center md:justify-start">
                  <i className="ri-music-2-line w-4 h-4 flex items-center justify-center"></i>
                  <span>Formato AAC 128k</span>
                </div>
                <div className="flex items-center space-x-2 justify-center md:justify-start">
                  <i className="ri-time-line w-4 h-4 flex items-center justify-center"></i>
                  <span>Online 24 horas</span>
                </div>
                <div className="flex items-center space-x-2 justify-center md:justify-start">
                  <i className="ri-global-line w-4 h-4 flex items-center justify-center"></i>
                  <span>Alcance Mundial</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-yellow-600 pt-6 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-yellow-100 text-sm">
              © 2024 Ras Reggae Radio. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-yellow-100 text-sm">Desde 2010 • Amor • Paz • Reggae</span>
              <a 
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-200 hover:text-white text-sm font-semibold transition-colors"
              >
                Powered by Restisteência Tech Roots
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
