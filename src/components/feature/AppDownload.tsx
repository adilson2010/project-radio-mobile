
export default function AppDownload() {
  const handleStoreDownload = (store: string) => {
    // Simula redirecionamento para as lojas
    if (store === 'google') {
      window.open('https://play.google.com/store/apps/details?id=com.zenofm.player&hl=pt_BR/', '_blank');
    } else if (store === 'apple') {
      window.open('https://apps.apple.com/br/app/zenoradio/id1207197757/', '_blank');
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-800 to-yellow-600 rounded-2xl p-8 text-white">
      <div className="text-center mb-8">
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Recursos do App */}
        <div>
          <h3 className="text-xl font-bold mb-6">Recursos do App:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <i className="ri-smartphone-line text-yellow-300 text-xl w-6 h-6 flex items-center justify-center"></i>
              <span className="text-sm">iOS e Android</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="ri-radio-line text-yellow-300 text-xl w-6 h-6 flex items-center justify-center"></i>
              <span className="text-sm">Qualidade HD</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="ri-bluetooth-connect-line text-yellow-300 text-xl w-6 h-6 flex items-center justify-center"></i>
              <span className="text-sm">Conexão Bluetooth</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="ri-notification-line text-yellow-300 text-xl w-6 h-6 flex items-center justify-center"></i>
              <span className="text-sm">Notificações</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="ri-folder-shared-line text-yellow-300 text-xl w-6 h-6 flex items-center justify-center"></i>
              <span className="text-sm">Compartilhe com amigos</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="ri-headphone-line text-yellow-300 text-xl w-6 h-6 flex items-center justify-center"></i>
              <span className="text-sm">Controles avançados</span>
            </div>
          </div>
        </div>

        {/* Download Direto das Lojas */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-6">Download Grátis</h3>
          <div className="space-y-4 max-w-sm mx-auto">
            {/* Google Play Store */}
            <button
              onClick={() => handleStoreDownload('google')}
              className="w-full bg-black hover:bg-gray-800 transition-all duration-300 rounded-xl p-4 flex items-center space-x-4 cursor-pointer group hover:scale-105"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <i className="ri-google-play-fill text-3xl text-green-400"></i>
              </div>
              <div className="text-left flex-1">
                <div className="text-xs text-gray-300">Disponível no</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
              <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
            </button>

            {/* Apple App Store */}
            <button
              onClick={() => handleStoreDownload('apple')}
              className="w-full bg-black hover:bg-gray-800 transition-all duration-300 rounded-xl p-4 flex items-center space-x-4 cursor-pointer group hover:scale-105"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <i className="ri-apple-fill text-3xl text-white"></i>
              </div>
              <div className="text-left flex-1">
                <div className="text-xs text-gray-300">Baixar na</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
              <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>

          <div className="mt-6 p-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg max-w-sm mx-auto">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <i className="ri-shield-check-line text-green-300"></i>
              <span>App oficial e seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas do App */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-300">4.8★</div>
          <div className="text-sm opacity-90">Avaliação</div>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-300">100K+</div>
          <div className="text-sm opacity-90">Downloads</div>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-300">24h</div>
          <div className="text-sm opacity-90">Online</div>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-300">Grátis</div>
          <div className="text-sm opacity-90">Download</div>
        </div>
      </div>
    </div>
  );
}
