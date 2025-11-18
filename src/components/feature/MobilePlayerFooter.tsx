import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface MobilePlayerFooterRef {
  togglePlay: () => void;
}

const MobilePlayerFooter = forwardRef<MobilePlayerFooterRef>((_, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Clique em Play para ouvir');
  const [listeners, setListeners] = useState(1247);
  const [listeningTime, setListeningTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const listenersTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const currentUrlIndexRef = useRef(0);
  const retryCountRef = useRef(0);
  const isInitializingRef = useRef(false);
  const hasUserInteractedRef = useRef(false);
  const isConnectedRef = useRef(false);
  const lastSuccessfulUrlRef = useRef(0);
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttemptsRef = useRef(3);

  // URLs de streaming otimizadas para mobile
  const streamUrls = [
    'https://stream.zeno.fm/bbh6u7w8gwzuv',
    'https://stream-175.zeno.fm/bbh6u7w8gwzuv',
    'https://stream-175.zeno.fm/bbh6u7w8gwzuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJiYmg2dTd3OGd3enV2IiwiaG9zdCI6InN0cmVhbS0xNzUuemVuby5mbSIsInRtIjpmYWxzZSwicnR0bCI6NSwianRpIjoiM3Rsa2c5eUVSRWk1eGRNUVJsYzBsdyIsImlhdCI6MTc2Mjk5OTA1NSwiZXhwIjoxNzYyOTk5MTE1fQ.dmryXud1zSk8vL1J-5oEIHuSgb9NcwX0DEMmTwn5QdE'
  ];

  // Detectar dispositivos móveis e sistemas
  const isMobile = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
                    (window.innerWidth >= 768 && window.innerWidth <= 1024);
    return isMobileDevice || isTablet;
  };

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
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

  // Wake Lock para manter tela ativa durante reprodução
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && isPlaying && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      // Silencioso - Wake Lock não é crítico
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // Iniciar timer de escuta
  const startListeningTimer = () => {
    if (listeningTimerRef.current) {
      clearInterval(listeningTimerRef.current);
      listeningTimerRef.current = null;
    }

    listeningTimerRef.current = setInterval(() => {
      setListeningTime(prev => {
        const newTime = prev + 1;
        
        if ('mediaSession' in navigator && navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: Infinity,
              playbackRate: 1,
              position: newTime
            });
          } catch (e) {
            // Silencioso
          }
        }
        
        return newTime;
      });
    }, 1000);
  };

  // Parar timer de escuta
  const stopListeningTimer = () => {
    if (listeningTimerRef.current) {
      clearInterval(listeningTimerRef.current);
      listeningTimerRef.current = null;
    }
  };

  // Configurar Media Session API avançada para CarPlay/Android Auto
  const setupAdvancedMediaSession = () => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Transmissão ao Vivo',
        artist: 'Ras Reggae Radio',
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

      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) togglePlay();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) togglePlay();
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        if (isPlaying) togglePlay();
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      if (isPlaying) {
        navigator.mediaSession.setPositionState({
          duration: Infinity,
          playbackRate: 1,
          position: listeningTime
        });
      }
    }
  };

  // Parar reprodução completamente
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsLoading(false);
    isConnectedRef.current = false;
    releaseWakeLock();
    stopListeningTimer();
    
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  };

  // Limpar áudio completamente
  const cleanupAudio = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch (error) {
        // Silencioso
      }
    }
  };

  // Inicializar áudio otimizado para mobile
  const initializeAudio = async () => {
    if (isInitializingRef.current) {
      return false;
    }

    if (!hasUserInteractedRef.current) {
      return false;
    }

    if (connectionAttemptsRef.current >= maxConnectionAttemptsRef.current) {
      setConnectionStatus('Erro - Toque em Play para tentar novamente');
      setIsLoading(false);
      connectionAttemptsRef.current = 0;
      return false;
    }

    isInitializingRef.current = true;
    connectionAttemptsRef.current++;

    try {
      if (!audioRef.current) {
        isInitializingRef.current = false;
        return false;
      }

      cleanupAudio();

      const audio = audioRef.current;
      
      audio.crossOrigin = 'anonymous';
      audio.preload = 'metadata';
      audio.playsInline = true;
      
      if (isIOS()) {
        audio.setAttribute('webkit-playsinline', 'true');
        audio.setAttribute('playsinline', 'true');
      }
      
      let urlToTry = lastSuccessfulUrlRef.current;
      if (currentUrlIndexRef.current < streamUrls.length) {
        urlToTry = currentUrlIndexRef.current;
      }
      
      const currentUrl = streamUrls[urlToTry];
      
      audio.src = currentUrl;
      audio.volume = 0.8;
      
      const audioPromise = new Promise<boolean>((resolve, reject) => {
        let resolved = false;
        
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            reject(new Error('Timeout na conexão'));
          }
        }, 10000);

        const handleCanPlay = () => {
          if (!resolved && isPlaying) {
            setConnectionStatus('A Sua Rádio Reggae');
            setupAdvancedMediaSession();
            retryCountRef.current = 0;
            isConnectedRef.current = true;
            lastSuccessfulUrlRef.current = urlToTry;
            connectionAttemptsRef.current = 0;
          }
        };

        const handlePlaying = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            
            setIsPlaying(true);
            setIsLoading(false);
            setConnectionStatus('A Sua Rádio Reggae');
            retryCountRef.current = 0;
            isConnectedRef.current = true;
            lastSuccessfulUrlRef.current = urlToTry;
            connectionAttemptsRef.current = 0;
            
            requestWakeLock();
            setupAdvancedMediaSession();
            startListeningTimer();

            resolve(true);
          }
        };

        const handleError = (e: Event) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            reject(new Error('Erro no áudio'));
          }
        };

        audio.addEventListener('canplay', handleCanPlay, { once: true });
        audio.addEventListener('playing', handlePlaying, { once: true });
        audio.addEventListener('error', handleError, { once: true });
        audio.addEventListener('stalled', handleError, { once: true });
      });

      await audio.load();
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
      
      await audioPromise;
      
      isInitializingRef.current = false;
      return true;
    } catch (error) {
      isInitializingRef.current = false;
      
      if (currentUrlIndexRef.current + 1 < streamUrls.length) {
        currentUrlIndexRef.current++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        return initializeAudio();
      }
      
      if (retryCountRef.current < 1) {
        retryCountRef.current++;
        currentUrlIndexRef.current = 0;
        setConnectionStatus(`Reconectando... (${retryCountRef.current}/1)`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return initializeAudio();
      }
      
      stopPlayback();
      setConnectionStatus('Erro - Toque em Play para tentar novamente');
      retryCountRef.current = 0;
      currentUrlIndexRef.current = 0;
      connectionAttemptsRef.current = 0;
      return false;
    }
  };

  // Toggle play/pause otimizado
  const togglePlay = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    hasUserInteractedRef.current = true;

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      stopPlayback();
      setConnectionStatus('Pausado - Toque em Play para continuar');
    } else {
      setIsLoading(true);
      setConnectionStatus('Conectando a rádio...');
      
      if (!isConnectedRef.current) {
        currentUrlIndexRef.current = lastSuccessfulUrlRef.current;
        retryCountRef.current = 0;
      }
      
      await initializeAudio();
    }
  };

  // Reiniciar stream otimizado
  const restartStream = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (audioRef.current && !isInitializingRef.current) {
      setIsLoading(true);
      setConnectionStatus('Reiniciando stream...');
      
      currentUrlIndexRef.current = 0;
      retryCountRef.current = 0;
      connectionAttemptsRef.current = 0;
      isConnectedRef.current = false;
      
      cleanupAudio();
      releaseWakeLock();
      stopListeningTimer();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await initializeAudio();
    }
  };

  // Compartilhar via Bluetooth/CarPlay/Android Auto
  const shareToCarSystem = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Ras Reggae Radio - Ao Vivo',
          text: 'Escutando a melhor rádio reggae online! 🎵',
          url: window.location.href
        });
        return;
      }
      
      const shareText = `🎵 Ras Reggae Radio - Ao Vivo\nEscutando a melhor rádio reggae online!\n${window.location.href}`;
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setConnectionStatus('Link copiado! Cole no seu app favorito');
        setTimeout(() => {
          setConnectionStatus(isPlaying ? 'Transmissão AAC • Ao Vivo' : 'Clique em Play para ouvir');
        }, 3000);
      }
    } catch (error) {
      // Silencioso
    }
  };

  // Expandir/Recolher player
  const handleExpandToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsExpanded(!isExpanded);
  };

  // Expor função para componente pai
  useImperativeHandle(ref, () => ({
    togglePlay: () => togglePlay()
  }));

  // Cleanup e network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const online = navigator.onLine;
      
      if (!online && isPlaying) {
        setConnectionStatus('Sem conexão com a internet');
        stopPlayback();
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isPlaying) {
        setupAdvancedMediaSession();
      }
    });

    updateNetworkStatus();
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      releaseWakeLock();
      stopListeningTimer();
      if (listenersTimerRef.current) {
        clearInterval(listenersTimerRef.current);
      }
      cleanupAudio();
    };
  }, []);

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

  // Não mostrar em desktop
  if (!isMobile()) {
    return null;
  }

  return (
    <>
      <audio 
        ref={audioRef} 
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        controls={false}
        title="Ras Reggae Radio - Live Stream"
        aria-label="Player de áudio da Ras Reggae Radio"
      />

      {/* Player Expandido */}
      {isExpanded && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-yellow-800 to-green-800 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-700 bg-black/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 via-yellow-400 to-green-500 p-0.5">
                <img
                  src="https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg"
                  alt="Logo da Ras Reggae Radio"
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Pacifico, serif' }}>
                  Ras Reggae Radio
                </h2>
                <p className="text-xs text-green-200">A Voz Autêntica do Reggae</p>
              </div>
            </div>
            <button 
              onClick={handleExpandToggle}
              className="text-white hover:text-yellow-300 transition-colors bg-black/20 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
              aria-label="Fechar player expandido"
              type="button"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            <div className="mb-6">
              <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-green-500 via-yellow-400 to-green-500 p-2 shadow-2xl">
                <img
                  src="https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg"
                  alt="Logo da Ras Reggae Radio"
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Transmissão ao Vivo</h3>
              <p className="text-lg text-yellow-200 mb-1">Ras Reggae Radio</p>
              <p className="text-sm text-green-200">A Voz Autêntica do Reggae</p>
            </div>

            <div className="mb-8 w-full max-w-md">
              <div className="bg-green-800/50 rounded-2xl px-6 py-4 mb-4 border border-green-600">
                <p className="text-white text-base font-semibold flex items-center justify-center space-x-2">
                  {isLoading && <i className="ri-loader-4-line animate-spin text-yellow-400"></i>}
                  {isPlaying && !isLoading && <i className="ri-radio-line text-green-400"></i>}
                  <span>{connectionStatus}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-xl p-3 text-center border border-green-700">
                  <p className="text-yellow-300 text-sm font-semibold">{listeners.toLocaleString()}</p>
                  <p className="text-green-200 text-xs">Ouvintes Online</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 text-center border border-green-700">
                  <p className="text-yellow-300 text-sm font-semibold">{formatListeningTime(listeningTime)}</p>
                  <p className="text-green-200 text-xs">Tempo de Escuta</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={restartStream}
                  disabled={isInitializingRef.current || isLoading}
                  className="bg-black/30 hover:bg-black/50 disabled:opacity-50 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all duration-200 border border-green-600 cursor-pointer"
                  aria-label="Reiniciar stream"
                  type="button"
                >
                  <i className="ri-refresh-line text-2xl"></i>
                </button>

                <button
                  onClick={togglePlay}
                  disabled={isInitializingRef.current}
                  className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 disabled:opacity-50 text-white rounded-full w-20 h-20 flex items-center justify-center transition-all duration-200 shadow-2xl transform hover:scale-105 disabled:scale-100 whitespace-nowrap cursor-pointer"
                  aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                  type="button"
                >
                  {isLoading ? (
                    <i className="ri-loader-4-line animate-spin text-3xl"></i>
                  ) : isPlaying ? (
                    <i className="ri-pause-fill text-3xl"></i>
                  ) : (
                    <i className="ri-play-fill text-3xl ml-1"></i>
                  )}
                </button>

                <button
                  onClick={shareToCarSystem}
                  className="bg-black/30 hover:bg-black/50 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all duration-200 border border-green-600 cursor-pointer"
                  aria-label="Compartilhar"
                  type="button"
                >
                  <i className="ri-share-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <div className="bg-black/40 px-3 py-1 rounded-full border border-green-600">
                <span className="text-green-300 text-xs font-semibold flex items-center space-x-1">
                  <i className="ri-smartphone-line"></i>
                  <span>CarPlay</span>
                </span>
              </div>
              <div className="bg-black/40 px-3 py-1 rounded-full border border-green-600">
                <span className="text-green-300 text-xs font-semibold flex items-center space-x-1">
                  <i className="ri-android-line"></i>
                  <span>Android Auto</span>
                </span>
              </div>
              <div className="bg-black/40 px-3 py-1 rounded-full border border-green-600">
                <span className="text-green-300 text-xs font-semibold flex items-center space-x-1">
                  <i className="ri-bluetooth-line"></i>
                  <span>Bluetooth</span>
                </span>
              </div>
            </div>

            <p className="text-green-200 text-xs opacity-75 mt-4">
              Use os controles de volume do seu smartphone
            </p>
          </div>
        </div>
      )}

      {/* Player Compacto */}
      {!isExpanded && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-800 via-yellow-700 to-green-800 border-t-2 border-green-600 z-40 shadow-2xl">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 flex-1 cursor-pointer"
                onClick={handleExpandToggle}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 via-yellow-400 to-green-500 p-0.5 shadow-lg">
                  <img
                    src="https://static.readdy.ai/image/2050551fbb19c229cf27f3c804633125/5a78a9c734517770b4257916fc0f77a3.jpeg"
                    alt="Logo da Ras Reggae Radio"
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">Transmissão ao Vivo</p>
                  <p className="text-green-200 text-xs truncate">Ras Reggae Radio</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {isLoading && <i className="ri-loader-4-line animate-spin text-yellow-400 text-xs"></i>}
                    {isPlaying && !isLoading && <i className="ri-radio-line text-green-400 text-xs"></i>}
                    <span className="text-green-200 text-xs truncate">{connectionStatus}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  disabled={isInitializingRef.current}
                  className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 disabled:opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-lg transform hover:scale-105 disabled:scale-100 whitespace-nowrap cursor-pointer"
                  aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                  type="button"
                >
                  {isLoading ? (
                    <i className="ri-loader-4-line animate-spin text-lg"></i>
                  ) : isPlaying ? (
                    <i className="ri-pause-fill text-lg"></i>
                  ) : (
                    <i className="ri-play-fill text-lg ml-0.5"></i>
                  )}
                </button>

                <button
                  onClick={handleExpandToggle}
                  className="text-white hover:text-yellow-300 transition-colors bg-black/20 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
                  aria-label="Expandir player"
                  type="button"
                >
                  <i className="ri-fullscreen-line text-lg"></i>
                </button>
              </div>
            </div>

            {isPlaying && (
              <div className="mt-2">
                <div className="w-full bg-green-900/50 rounded-full h-1">
                  <div className="bg-gradient-to-r from-green-400 to-yellow-400 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

MobilePlayerFooter.displayName = 'MobilePlayerFooter';

export default MobilePlayerFooter;