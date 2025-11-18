
import { useRef, useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import RadioPlayer from '../../components/feature/RadioPlayer';
import ChatrollChat from '../../components/feature/ChatrollChat';
import ProgramSchedule from '../../components/feature/ProgramSchedule';
import AppDownload from '../../components/feature/AppDownload';
import Button from '../../components/base/Button';

export default function Home() {
  const radioPlayerRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar todos os dispositivos iOS e Android (incluindo tablets)
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Detectar qualquer dispositivo iOS ou Android
      const isIOSDevice = /ipad|iphone|ipod/i.test(userAgent) || 
                         (navigator.maxTouchPoints > 0 && /mac/i.test(userAgent));
      
      const isAndroidDevice = /android/i.test(userAgent);
      
      // Qualquer dispositivo iOS ou Android usa o player do footer
      const isMobileDevice = isIOSDevice || isAndroidDevice;
      
      setIsMobile(isMobileDevice);
      
      console.log('Mobile Detection:', {
        userAgent,
        isIOSDevice,
        isAndroidDevice,
        isMobile: isMobileDevice
      });
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  const handlePlayNow = () => {
    if (isMobile) {
      // Em dispositivos móveis (iOS/Android), acionar o player do footer
      if ((window as any).toggleMobilePlayer) {
        (window as any).toggleMobilePlayer();
      }
    } else {
      // No desktop, scroll para o player e iniciar reprodução
      const playerElement = document.getElementById('player');
      if (playerElement) {
        playerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          if (radioPlayerRef.current) {
            radioPlayerRef.current.togglePlay();
          }
        }, 800);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Header />
      
      {/* Hero Section */}
      <section 
        id="home"
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://readdy.ai/api/search-image?query=Vibrant%20reggae%20music%20festival%20scene%20with%20colorful%20Rastafarian%20flags%2C%20musical%20instruments%20like%20guitars%20and%20drums%2C%20tropical%20palm%20trees%2C%20warm%20sunset%20lighting%2C%20people%20dancing%20and%20celebrating%2C%20Bob%20Marley%20style%20atmosphere%2C%20green%20yellow%20red%20colors%2C%20peaceful%20unity%20vibe%2C%20outdoor%20concert%20stage%2C%20speakers%20and%20sound%20equipment%2C%20Caribbean%20island%20setting%2C%20joyful%20community%20gathering%2C%20authentic%20reggae%20culture%20celebration&width=1920&height=1080&seq=hero-reggae-bg&orientation=landscape')`
        }}
      >
        <div className="container mx-auto px-6 text-center text-white relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ fontFamily: 'Pacifico, serif' }}>
              Ras Reggae Radio
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              A melhor música reggae 24 horas por dia!
            </p>
            <p className="text-lg mb-12 opacity-80 max-w-2xl mx-auto">
              Conecte-se com a cultura <b>Reggae Autêntica</b>. Ouça os clássicos da música jamaicana e descubra sua essência Roots Reggae.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handlePlayNow}
                size="lg" 
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 text-xl font-bold whitespace-nowrap transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <i className="ri-play-fill mr-3 text-2xl"></i>
                Tocar Agora
              </Button>
              
              <Button 
                onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
                variant="secondary" 
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 text-xl font-bold whitespace-nowrap transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <i className="ri-chat-3-fill mr-3 text-2xl"></i>
                Chat Ao Vivo
              </Button>
            </div>

            {/* Estatísticas em destaque */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                <div className="text-3xl font-bold text-amber-300">24h</div>
                <div className="text-sm opacity-90">Online</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                <div className="text-3xl font-bold text-amber-300">HD</div>
                <div className="text-sm opacity-90">Qualidade</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                <div className="text-3xl font-bold text-amber-300">1.2K+</div>
                <div className="text-sm opacity-90">Ouvintes</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                <div className="text-3xl font-bold text-amber-300">Grátis</div>
                <div className="text-sm opacity-90">Sempre</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <i className="ri-arrow-down-line text-white text-3xl opacity-70"></i>
        </div>
      </section>

      {/* Player e Chat Section */}
      <section id="player" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Radio Player - Oculto em dispositivos móveis (iOS/Android) */}
            {!isMobile && (
              <div className="flex justify-center">
                <RadioPlayer />
              </div>
            )}

            {/* Chat Section - Largura total em dispositivos móveis */}
            <div id="chat-section" className={`space-y-6 ${isMobile ? 'lg:col-span-2' : ''}`}>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-orange-800 mb-4">
                  <i className="ri-chat-3-fill mr-3 text-orange-600"></i>
                  Converse Conosco
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Participe da nossa comunidade! Chega junto em nosso bate papo regueiro, peça suas músicas favoritas e compartilhe sua paixão pela música Reggae.
                </p>
                
                {/* Benefícios do Chat */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <i className="ri-music-2-line text-orange-600 text-xl w-6 h-6 flex items-center justify-center"></i>
                    <span>Peça suas músicas</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <i className="ri-group-line text-orange-600 text-xl w-6 h-6 flex items-center justify-center"></i>
                    <span>Comunidade ativa</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <i className="ri-time-line text-orange-600 text-xl w-6 h-6 flex items-center justify-center"></i>
                    <span>Moderação Online 24h</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <i className="ri-smartphone-line text-orange-600 text-xl w-6 h-6 flex items-center justify-center"></i>
                    <span>Funciona em todos os dispositivos</span>
                  </div>
                </div>
              </div>

              {/* Chat Component */}
              <ChatrollChat />
            </div>
          </div>
        </div>
      </section>

      {/* Program Schedule */}
      <section id="programacao" className="py-20 bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-green-800 mb-4">
              <i className="ri-calendar-line mr-3 text-green-600"></i>
              Programação
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Confira nossa programação semanal com os melhores DJs e shows especiais de reggae
            </p>
          </div>
          <ProgramSchedule />
        </div>
      </section>

      {/* App Download Section */}
      <section id="app" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-4">
              <i className="ri-smartphone-line mr-3 text-green-600"></i>
              Baixe Nosso App
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leve a Ras Reggae Radio para onde você for! Disponível para iOS e Android
            </p>
          </div>
          <AppDownload />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-gradient-to-br from-green-800 to-yellow-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <i className="ri-mail-line mr-3"></i>
              Entre em Contato
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Tem alguma dúvida, sugestão ou quer fazer parte da nossa equipe? Fale conosco!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Informações de Contato */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Email */}
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-mail-line text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Email</h3>
                <p className="opacity-90 mb-3 text-sm">Envie sua mensagem</p>
                <a 
                  href="#" 
                  className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors text-sm"
                >
                  no-reply@rasreggaeradio.com
                </a>
              </div>

              {/* WhatsApp */}
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-whatsapp-line text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">WhatsApp</h3>
                <p className="opacity-90 mb-3 text-sm">Fale conosco agora</p>
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors text-sm"
                >
                  (00) 99999-9999
                </a>
              </div>

              {/* Redes Sociais */}
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                <div className="w-14 h-14 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-share-line text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Redes Sociais</h3>
                <p className="opacity-90 mb-3 text-sm">Siga-nos</p>
                <div className="flex justify-center space-x-3">
                  <a 
                    href="https://instagram.com/rasreggaeradio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 transition-colors"
                  >
                    <i className="ri-instagram-line text-2xl"></i>
                  </a>
                  <a 
                    href="https://facebook.com/rasreggaeradio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 transition-colors"
                  >
                    <i className="ri-facebook-line text-2xl"></i>
                  </a>
                  <a 
                    href="https://twitter.com/rasreggaeradio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 transition-colors"
                  >
                    <i className="ri-twitter-line text-2xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
