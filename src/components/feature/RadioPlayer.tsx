import { useState, useRef, useEffect } from 'react';

// Declare ScreenWakeLock interface for TypeScript
declare global {
  interface ScreenWakeLock {
    release(): Promise<void>;
  }
  
  interface WakeLock {
    request(type: 'screen'): Promise<ScreenWakeLock>;
  }
}

export default function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Clique em Play para ouvir');
  const [listeners, setListeners] = useState(1247);
  const [listeningTime, setListeningTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [currentSong] = useState('Ras Reggae Radio - Ao Vivo');
  const [currentArtist] = useState('A Voz Autêntica do Reggae');
  const audioRef = useRef<HTMLAudioElement>(null);
  const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const listenersTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<ScreenWakeLock | null>(null);

  // URLs de streaming com fallback
  const streamUrls = [
    'https://stream-175.zeno.fm/bbh6u7w8gwzuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJiYmg2dTd3OGd3enV2IiwiaG9zdCI6InN0cmVhbS0xNzUuemVuby5mbSIsInRtIjpmYWxzZSwicnR0bCI6NSwianRpIjoiM3Rsa2c5eUVSRWk1eGRNUVJsYzBsdyIsImlhdCI6MTc2Mjk5OTA1NSwiZXhwIjoxNzYyOTk5MTE1fQ.dmryXud1zSk8vL1J-5oEIHuSgb9NcwX0DEMmTwn5QdE',
    'https://stream-175.zeno.fm/bbh6u7w8gwzuv',
    'https://stream.zeno.fm/bbh6u7w8gwzuv'
  ];

  // Configurar Media Session API avançada para CarPlay/Android Auto
  const setupAdvancedMediaSession = () => {
    if ('mediaSession' in navigator) {
      // Metadados detalhados para CarPlay/Android Auto
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong,
        artist: currentArtist,
        album: 'A Voz Autêntica do Reggae',
        artwork: [
          { 
            src: 'https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg', 
            sizes: '96x96', 
            type: 'image/jpeg' 
          },
          { 
            src: 'https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg', 
            sizes: '128x128', 
            type: 'image/jpeg' 
          },
          { 
            src: 'https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg', 
            sizes: '192x192', 
            type: 'image/jpeg' 
          },
          { 
            src: 'https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg', 
            sizes: '256x256', 
            type: 'image/jpeg' 
          },
          { 
            src: 'https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg', 
            sizes: '384x384', 
            type: 'image/jpeg' 
          },
          { 
            src: 'https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg', 
            sizes: '512x512', 
            type: 'image/jpeg' 
          }
        ]
      });

      // Handlers para CarPlay/Android Auto
      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) togglePlay();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) togglePlay();
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        if (isPlaying) togglePlay();
      });

      // Handlers adicionais para carros
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        // Para rádio ao vivo, reiniciar stream
        restartStream();
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        // Para rádio ao vivo, reiniciar stream
        restartStream();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        // Reiniciar stream (simula mudança de faixa)
        restartStream();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        // Reiniciar stream (simula mudança de faixa)
        restartStream();
      });

      // Atualizar estado de reprodução
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Posição para streams ao vivo
      if (isPlaying) {
        navigator.mediaSession.setPositionState({
          duration: Infinity,
          playbackRate: 1,
          position: listeningTime
        });
      }
    }
  };

  // Detectar dispositivos móveis
  const isMobile = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  };

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
  };

  // Wake Lock para manter tela ativa durante reprodução
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && isPlaying) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock ativado');
      }
    } catch (err) {
      console.log('Wake Lock não suportado:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Wake Lock liberado');
    }
  };

  // Formatação do tempo de escuta
  const formatListeningTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Detectar status da rede
  const checkNetworkStatus = () => {
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
      if (!navigator.onLine && isPlaying) {
        setConnectionStatus('Sem conexão com a internet');
        setIsPlaying(false);
        setIsBuffering(false);
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  };

  // Inicializar áudio otimizado
  const initializeAudio = async (urlIndex = 0) => {
    if (!audioRef.current || urlIndex >= streamUrls.length) {
      setConnectionStatus('Erro - Clique em Play para tentar novamente');
      setIsLoading(false);
      setIsBuffering(false);
      releaseWakeLock();
      return false;
    }

    const audio = audioRef.current;
    
    // Configurações específicas para mobile
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    
    // Configurações específicas para iOS
    if (isIOS()) {
      audio.setAttribute('playsinline', 'true');
      audio.muted = false;
    }
    
    // Configurações específicas para Android
    if (isAndroid()) {
      audio.setAttribute('playsinline', 'true');
    }
    
    // Função para lidar com erros otimizada
    const handleAudioError = async () => {
      console.log(`Erro na URL ${urlIndex + 1}/${streamUrls.length}`);
      
      // Tentar próxima URL
      if (urlIndex + 1 < streamUrls.length) {
        console.log(`Tentando URL ${urlIndex + 2}...`);
        setTimeout(() => initializeAudio(urlIndex + 1), 1000);
        return;
      }
      
      // Se todas as URLs falharam, tentar retry
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setConnectionStatus(`Reconectando... (${retryCount + 1}/3)`);
        setTimeout(() => initializeAudio(0), 2000);
        return;
      }
      
      // Falha total
      setIsPlaying(false);
      setIsLoading(false);
      setIsBuffering(false);
      setConnectionStatus('Erro - Clique em Play para tentar novamente');
      setRetryCount(0);
      releaseWakeLock();
    };
    
    try {
      // Limpar listeners anteriores
      const newAudio = audio.cloneNode() as HTMLAudioElement;
      if (audio.parentNode) {
        audio.parentNode.replaceChild(newAudio, audio);
        audioRef.current = newAudio;
      }
      
      const currentAudio = audioRef.current;
      
      // Configurar novo stream
      currentAudio.src = streamUrls[urlIndex];
      currentAudio.volume = (isMuted ? 0 : volume) / 100;
      
      // Event listeners otimizados
      const handleCanPlay = () => {
        setIsAudioReady(true);
        setIsBuffering(false);
        setConnectionStatus('Transmissão AAC • Ao Vivo');
        setupAdvancedMediaSession();
      };

      const handlePlaying = () => {
        setIsPlaying(true);
        setIsLoading(false);
        setIsBuffering(false);
        setConnectionStatus('Transmissão AAC • Ao Vivo');
        setRetryCount(0);
        
        // Ativar Wake Lock
        requestWakeLock();
        
        // Configurar Media Session
        setupAdvancedMediaSession();
        
        // Iniciar timer de escuta
        if (listeningTimerRef.current) {
          clearInterval(listeningTimerRef.current);
        }
        listeningTimerRef.current = setInterval(() => {
          setListeningTime(prev => {
            const newTime = prev + 1;
            // Atualizar posição no Media Session
            if ('mediaSession' in navigator) {
              navigator.mediaSession.setPositionState({
                duration: Infinity,
                playbackRate: 1,
                position: newTime
              });
            }
            return newTime;
          });
        }, 1000);
      };

      const handlePause = () => {
        setIsPlaying(false);
        setConnectionStatus('Pausado - Clique em Play para continuar');
        releaseWakeLock();
        
        if (listeningTimerRef.current) {
          clearInterval(listeningTimerRef.current);
        }
        
        // Atualizar Media Session
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      };

      const handleWaiting = () => {
        setIsBuffering(true);
        setConnectionStatus('Carregando...');
      };

      const handleLoadStart = () => {
        setIsBuffering(true);
        setConnectionStatus('Conectando...');
      };

      const handleProgress = () => {
        // Stream está carregando
        if (currentAudio.buffered.length > 0) {
          setIsBuffering(false);
        }
      };

      // Adicionar listeners
      currentAudio.addEventListener('canplay', handleCanPlay);
      currentAudio.addEventListener('playing', handlePlaying);
      currentAudio.addEventListener('pause', handlePause);
      currentAudio.addEventListener('waiting', handleWaiting);
      currentAudio.addEventListener('loadstart', handleLoadStart);
      currentAudio.addEventListener('progress', handleProgress);
      currentAudio.addEventListener('error', handleAudioError);
      currentAudio.addEventListener('stalled', handleAudioError);

      // Tentar carregar e reproduzir
      await currentAudio.load();
      
      // Para iOS, aguardar interação do usuário
      if (isIOS()) {
        // iOS requer interação do usuário para reproduzir
        const playPromise = currentAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } else {
        await currentAudio.play();
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
      await handleAudioError();
      return false;
    }
  };

  // Toggle play/pause
  const togglePlay = async () => {
    if (networkStatus === 'offline') {
      setConnectionStatus('Sem conexão com a internet');
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      // Pausar
      audioRef.current.pause();
      setIsPlaying(false);
      setConnectionStatus('Pausado - Clique em Play para continuar');
      if (listeningTimerRef.current) {
        clearInterval(listeningTimerRef.current);
      }
    } else {
      // Reproduzir
      setIsLoading(true);
      setIsBuffering(true);
      setConnectionStatus('Conectando ao stream...');
      
      if (isAudioReady && audioRef.current.src) {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error('Erro ao reproduzir:', error);
          await initializeAudio(0);
        }
      } else {
        await initializeAudio(0);
      }
    }
  };

  // Controle de volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Toggle mudo
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume / 100;
    }
  };

  // Reiniciar stream
  const restartStream = async () => {
    if (audioRef.current) {
      setIsLoading(true);
      setIsBuffering(true);
      setConnectionStatus('Reiniciando stream...');
      setRetryCount(0);
      
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      setIsAudioReady(false);
      
      setTimeout(async () => {
        await initializeAudio(0);
      }, 1000);
    }
  };

  // Atualizar contadores de ouvintes
  useEffect(() => {
    const updateListeners = () => {
      const baseListeners = 1200;
      const variation = Math.floor(Math.random() * 100) - 50;
      const timeBonus = isPlaying ? Math.floor(Math.random() * 50) : 0;
      setListeners(Math.max(baseListeners + variation + timeBonus, 800));
    };

    updateListeners();
    listenersTimerRef.current = setInterval(updateListeners, 30000);

    return () => {
      if (listenersTimerRef.current) {
        clearInterval(listenersTimerRef.current);
      }
    };
  }, [isPlaying]);

  // Cleanup e network status
  useEffect(() => {
    const cleanupNetwork = checkNetworkStatus();
    
    return () => {
      cleanupNetwork();
      if (listeningTimerRef.current) {
        clearInterval(listeningTimerRef.current);
      }
      if (listenersTimerRef.current) {
        clearInterval(listenersTimerRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Listener para mudanças de visibilidade (importante para mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Manter reprodução em background
        console.log('App em background, mantendo reprodução');
      } else if (!document.hidden && isPlaying) {
        // App voltou ao foreground
        console.log('App em foreground');
        setupAdvancedMediaSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Não mostrar player principal em dispositivos móveis
  if (isMobile()) {
    return null;
  }

  return (
    <>
      <audio 
        ref={audioRef} 
        preload="none"
        playsInline
        crossOrigin="anonymous"
        controls={false}
        title="Ras Reggae Radio - Live Stream"
        aria-label="Player de áudio da Ras Reggae Radio"
      />

      <div className="bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 rounded-3xl p-8 shadow-2xl border border-green-100">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 via-yellow-400 to-red-500 p-1 shadow-xl">
              <img
                src="https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg"
                alt="Logo da Ras Reggae Radio"
                className="w-full h-full rounded-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Título */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Pacifico, serif' }}>
              Ras Reggae Radio
            </h2>
            <p className="text-green-700 text-lg font-medium">A Voz Autêntica do Reggae</p>
          </div>

          {/* Status */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-2xl px-6 py-4 mb-4 border border-green-200">
              <p className="text-gray-800 text-lg font-semibold flex items-center justify-center space-x-2">
                {isBuffering && <i className="ri-loader-4-line animate-spin text-green-600"></i>}
                {networkStatus === 'offline' && <i className="ri-wifi-off-line text-red-500"></i>}
                <span>{connectionStatus}</span>
              </p>
            </div>
            
            {isPlaying && (
              <div className="bg-gradient-to-r from-yellow-100 via-green-100 to-red-100 rounded-2xl px-6 py-4 mb-4 border border-yellow-200">
                <div className="flex items-center justify-center space-x-2 text-gray-800 text-base">
                  <i className="ri-time-line text-green-600"></i>
                  <span>Ouvindo há: {formatListeningTime(listeningTime)}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-2 text-gray-700 text-base">
              <i className="ri-user-line text-green-600"></i>
              <span>{listeners.toLocaleString()} ouvintes conectados</span>
            </div>
          </div>

          {/* Controles Principais */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            {/* Botão Mudo */}
            <button 
              onClick={toggleMute}
              className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              <i className={`ri-volume-${isMuted ? 'mute' : 'up'}-fill text-xl md:text-2xl`}></i>
            </button>

            {/* Botão Play/Pause Principal */}
            <button 
              onClick={togglePlay}
              disabled={isLoading || networkStatus === 'offline'}
              className="bg-gradient-to-r from-green-600 via-yellow-500 to-red-500 hover:from-green-700 hover:via-yellow-600 hover:to-red-600 text-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              aria-label={isPlaying ? 'Pausar rádio' : 'Reproduzir rádio'}
            >
              {isLoading || isBuffering ? (
                <i className="ri-loader-4-line text-3xl md:text-4xl animate-spin"></i>
              ) : (
                <i className={`ri-${isPlaying ? 'pause' : 'play'}-fill text-3xl md:text-4xl ${isPlaying ? 'ml-0' : 'ml-1'}`}></i>
              )}
            </button>

            {/* Botão Compartilhar */}
            <button 
              onClick={() => {
                const shareData = {
                  title: 'Ras Reggae Radio - Ao Vivo',
                  text: 'Escutando a melhor rádio reggae online!',
                  url: window.location.href
                };
                
                if (navigator.share) {
                  navigator.share(shareData);
                } else {
                  navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                  alert('Link copiado para a área de transferência!');
                }
              }}
              className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              aria-label="Compartilhar rádio"
            >
              <i className="ri-share-line text-xl md:text-2xl"></i>
            </button>
          </div>

          {/* Controle de Volume */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 max-w-md mx-auto">
              <i className="ri-volume-down-line text-green-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-3 bg-gradient-to-r from-green-200 to-red-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${isMuted ? 0 : volume}%, #e5e7eb ${isMuted ? 0 : volume}%, #e5e7eb 100%)`
                  }}
                  aria-label={`Volume: ${isMuted ? 0 : volume}%`}
                />
              </div>
              <i className="ri-volume-up-line text-green-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              <span className="text-gray-700 text-sm w-10 text-center font-semibold">{isMuted ? 0 : volume}%</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              onClick={restartStream}
              disabled={!isPlaying}
              className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              aria-label="Reiniciar stream"
            >
              <i className="ri-refresh-line mr-2"></i>
              Reiniciar Stream
            </button>

            <button 
              onClick={() => {
                const element = document.getElementById('app');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              aria-label="Baixar aplicativo"
            >
              <i className="ri-smartphone-line mr-2"></i>
              Baixar App
            </button>
          </div>

          {/* Informações Técnicas */}
          <div className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 rounded-2xl p-4 border border-green-100">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <i className="ri-music-2-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                <span className="font-medium">Transmissão AAC</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-signal-wifi-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                <span className="font-medium">128 kbps</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-time-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                <span className="font-medium">24/7 Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className={`ri-wifi-${networkStatus === 'online' ? '' : 'off-'}line text-green-600 w-5 h-5 flex items-center justify-center`}></i>
                <span className="font-medium">{networkStatus === 'online' ? 'Conectado' : 'Desconectado'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}