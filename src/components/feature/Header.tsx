import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    // Se não estiver na página inicial, navegar primeiro
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    if (path.startsWith('#')) {
      scrollToSection(path.substring(1));
    }
  };

  const handlePlayNow = () => {
    setIsMenuOpen(false);
    
    // Primeiro, scroll para o player
    const playerElement = document.getElementById('player');
    if (playerElement) {
      playerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Aguardar um pouco para o scroll completar, então acionar o player
    setTimeout(() => {
      // Tentar acionar o player principal (desktop)
      const desktopPlayButton = document.querySelector('[aria-label="Reproduzir rádio"]') as HTMLButtonElement;
      if (desktopPlayButton && desktopPlayButton.offsetParent !== null) {
        desktopPlayButton.click();
        return;
      }
      
      // Se não encontrou o desktop, tentar o mobile
      const mobilePlayButton = document.querySelector('[aria-label="Reproduzir rádio"]') as HTMLButtonElement;
      if (mobilePlayButton) {
        mobilePlayButton.click();
        return;
      }
      
      // Fallback: usar a função global do mobile player
      if ((window as any).toggleMobilePlayer) {
        (window as any).toggleMobilePlayer();
      }
    }, 800);
  };

  return (
    <header className="bg-gradient-to-br from-green-800 to-yellow-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-1 shadow-lg">
              <img 
                src="https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg" 
                alt="Ras Reggae Radio Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Pacifico, serif' }}>Ras Reggae Radio</h1>
              <p className="text-sm opacity-90 font-medium">Online 24h</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-white hover:text-yellow-200 transition-colors cursor-pointer font-medium"
            >
              Início
            </Link>
            <button 
              onClick={() => scrollToSection('programacao')}
              className="text-white hover:text-yellow-200 transition-colors cursor-pointer font-medium"
            >
              Programação
            </button>
            <button 
              onClick={() => scrollToSection('player')}
              className="text-white hover:text-yellow-200 transition-colors cursor-pointer font-medium"
            >
              Player
            </button>
            <Link 
              to="#" 
              className="text-white hover:text-yellow-200 transition-colors cursor-pointer font-medium"
            >
              Loja
            </Link>
            <button 
              onClick={() => scrollToSection('app')}
              className="text-white hover:text-yellow-200 transition-colors cursor-pointer font-medium"
            >
              App
            </button>
            <button 
              onClick={() => scrollToSection('contato')}
              className="text-white hover:text-yellow-200 transition-colors cursor-pointer font-medium"
            >
              Contato
            </button>
            
            {/* Botão Tocar Agora */}
            <button 
              onClick={handlePlayNow}
              className="bg-white text-green-700 hover:bg-yellow-100 hover:text-red-600 px-4 py-2 rounded-full font-bold transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap flex items-center space-x-2"
            >
              <i className="ri-play-fill text-lg"></i>
              <span>Tocar Agora</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white w-6 h-6 flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/20 backdrop-blur-sm rounded-lg mt-2 mb-4">
            <nav className="flex flex-col space-y-2 p-4">
              <Link 
                to="/" 
                onClick={() => handleNavigation('/')}
                className="text-white hover:text-yellow-200 transition-colors py-2 cursor-pointer font-medium"
              >
                Início
              </Link>
              <button 
                onClick={() => scrollToSection('programacao')}
                className="text-white hover:text-yellow-200 transition-colors py-2 cursor-pointer font-medium text-left"
              >
                Programação
              </button>
              <button 
                onClick={() => scrollToSection('player')}
                className="text-white hover:text-yellow-200 transition-colors py-2 cursor-pointer font-medium text-left"
              >
                Player
              </button>
              <Link 
                to="#" 
                onClick={() => handleNavigation('#')}
                className="text-white hover:text-yellow-200 transition-colors py-2 cursor-pointer font-medium"
              >
                Loja
              </Link>
              <button 
                onClick={() => scrollToSection('app')}
                className="text-white hover:text-yellow-200 transition-colors py-2 cursor-pointer font-medium text-left"
              >
                App
              </button>
              <button 
                onClick={() => scrollToSection('contato')}
                className="text-white hover:text-yellow-200 transition-colors py-2 cursor-pointer font-medium text-left"
              >
                Contato
              </button>
              
              {/* Botão Tocar Agora Mobile */}
              <button 
                onClick={handlePlayNow}
                className="bg-white text-green-700 hover:bg-yellow-100 hover:text-red-600 px-4 py-3 rounded-full font-bold transition-all duration-200 shadow-lg mt-3 flex items-center justify-center space-x-2 whitespace-nowrap"
              >
                <i className="ri-play-fill text-lg"></i>
                <span>Tocar Agora</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
