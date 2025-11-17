
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
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSong, setCurrentSong] = useState('Transmissão ao Vivo');
  const [currentArtist, setCurrentArtist] = useState('Ras Reggae Radio');
  const audioRef = useRef<HTMLAudioElement>(null);
  const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const listenersTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);

  // URLs de streaming otimizadas para mobile
  const streamUrls = [
    'https://stream-175.zeno.fm/bbh6u7w8gwzuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJiYmg2dTd3OGd3enV2IiwiaG9zdCI6InN0cmVhbS0xNzUuemVuby5mbSIsInRtIjpmYWxzZSwicnR0bCI6NSwianRpIjoiM3Rsa2c5eUVSRWk1eGRNUVJsYzBsdyIsImlhdCI6MTc2Mjk5OTA1NSwiZXhwIjoxNzYyOTk5MTE1fQ.dmryXud1zSk8vL1J-5oEIHuSgb9NcwX0DEMmTwn5QdE',
    'https://stream-175.zeno.fm/bbh6u7w8gwzuv',
    'https://stream.zeno.fm/bbh6u7w8gwzuv'
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
      if ('wakeLock' in navigator && (navigator as any).wakeLock && isPlaying) {
        const wakeLock = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = wakeLock;
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

  // Detectar status da rede com otimizações mobile
  const checkNetworkStatus = () => {
    const updateNetworkStatus = () => {
      const online = navigator.onLine;
      setNetworkStatus(online ? 'online' : 'offline');
      
      if (!online && isPlaying) {
        setConnectionStatus('Sem conexão com a internet');
        setIsPlaying(false);
        setIsBuffering(false);
        releaseWakeLock();
      }
    };

    // Listeners para mudanças de rede
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Listener para mudanças de visibilidade (importante para mobile)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isPlaying) {
        // Manter reprodução em background
        console.log('App em background, mantendo reprodução');
      } else if (!document.hidden && isPlaying) {
        // App voltou ao foreground
        console.log('App em foreground');
        setupAdvancedMediaSession();
      }
    });

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  };

  // Inicializar áudio otimizado para mobile
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
      (audio as any).playsInline = true;
      audio.muted = false;
    }
    
    // Configurações específicas para Android
    if (isAndroid()) {
      (audio as any).playsInline = true;
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
      
      // Event listeners otimizados para mobile
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

  // Toggle play/pause otimizado
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
      releaseWakeLock();
      
      if (listeningTimerRef.current) {
        clearInterval(listeningTimerRef.current);
      }
      
      // Atualizar Media Session
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    } else {
      // Reproduzir
      setIsLoading(true);
      setIsBuffering(true);
      setConnectionStatus('Conectando ao stream...');
      
      if (isAudioReady && audioRef.current.src) {
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (error) {
          console.error('Erro ao reproduzir:', error);
          await initializeAudio(0);
        }
      } else {
        await initializeAudio(0);
      }
    }
  };

  // Controle de volume otimizado para mobile
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

  // Reiniciar stream otimizado
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
      releaseWakeLock();
      
      setTimeout(async () => {
        await initializeAudio(0);
      }, 1000);
    }
  };

  // Compartilhar via Bluetooth/CarPlay/Android Auto
  const shareToCarSystem = async () => {
    try {
      // Tentar Web Share API primeiro
      if (navigator.share) {
        await navigator.share({
          title: 'Ras Reggae Radio - Ao Vivo',
          text: 'Ouça a melhor rádio reggae online 24h! em https://rasreggaeradio.com 🎵',
          url: window.location.href
        });
        return;
      }
      
      // Fallback para clipboard
      const shareText = `🎵 Estou ouvindo Ras Reggae Radio - Ao Vivo\n Ouça a melhor rádio reggae online! em https://rasreggaeradio.com \n${window.location.href}`;
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setConnectionStatus('Link copiado! Cole no seu app favorito');
        setTimeout(() => {
          setConnectionStatus(isPlaying ? 'Transmissão AAC • Ao Vivo' : 'Clique em Play para ouvir');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // Expor função para componente pai
  useImperativeHandle(ref, () => ({
    togglePlay
  }));

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

  // Atualizar informações da música (simulado para rádio ao vivo)
  useEffect(() => {
    const songs = [
      { title: 'Transmissão ao Vivo', artist: 'Ras Reggae Radio' },
      { title: 'Roots Rock Reggae', artist: 'Bob Marley' },
      { title: 'One Love', artist: 'Bob Marley' },
      { title: 'No Woman No Cry', artist: 'Bob Marley' },
      { title: 'Three Little Birds', artist: 'Bob Marley' },
      { title: 'Buffalo Soldier', artist: 'Bob Marley' },
      { title: 'Redemption Song', artist: 'Bob Marley' }
    ];

    if (isPlaying) {
      const updateSong = () => {
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        setCurrentSong(randomSong.title);
        setCurrentArtist(randomSong.artist);
        setupAdvancedMediaSession();
      };

      // Atualizar música a cada 3-5 minutos
      const interval = setInterval(updateSong, Math.random() * 120000 + 180000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Cleanup e network status
  useEffect(() => {
    const cleanupNetwork = checkNetworkStatus();
    
    return () => {
      cleanupNetwork();
      releaseWakeLock();
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

  // Não mostrar em desktop
  if (!isMobile()) {
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
              onClick={() => setIsExpanded(false)}
              className="text-white hover:text-yellow-300 transition-colors bg-black/20 rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="Fechar player expandido"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            {/* Logo Principal */}
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

            {/* Informações da Música */}
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{currentSong}</h3>
              <p className="text-lg text-yellow-200 mb-1">{currentArtist}</p>
              <p className="text-sm text-green-200">A Voz Autêntica do Reggae</p>
            </div>

            {/* Status */}
            <div className="mb-8 w-full max-w-md">
              <div className="bg-green-800/50 rounded-2xl px-6 py-4 mb-4 border border-green-600">
                <p className="text-white text-base font-semibold flex items-center justify-center space-x-2">
                  {isBuffering && <i className="ri-loader-4-line animate-spin text-yellow-400"></i>}
                  {networkStatus === 'offline' && <i className="ri-wifi-off-line text-red-400"></i>}
                  {isPlaying && !isBuffering && <i className="ri-radio-line text-green-400"></i>}
                  <span>{connectionStatus}</span>
                </p>
              </div>

              {/* Estatísticas */}
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

            {/* Controles Principais */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={restartStream}
                  className="bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 border border-green-600"
                  aria-label="Reiniciar stream"
                >
                  <i className="ri-refresh-line text-xl"></i>
                </button>

                <button
                  onClick={togglePlay}
                  disabled={isLoading || networkStatus === 'offline'}
                  className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-full w-20 h-20 flex items-center justify-center transition-all duration-200 shadow-2xl transform hover:scale-105 disabled:scale-100"
                  aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isLoading || isBuffering ? (
                    <i className="ri-loader-4-line animate-spin text-3xl"></i>
                  ) : isPlaying ? (
                    <i className="ri-pause-fill text-3xl"></i>
                  ) : (
                    <i className="ri-play-fill text-3xl ml-1"></i>
                  )}
                </button>

                <button
                  onClick={shareToCarSystem}
                  className="bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 border border-green-600"
                  aria-label="Compartilhar"
                >
                  <i className="ri-share-line text-xl"></i>
                </button>
              </div>
            </div>

            {/* Controle de Volume */}
            <div className="w-full max-w-md mb-6">
              <div className="bg-black/30 rounded-2xl p-4 border border-green-700">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-yellow-300 transition-colors"
                    aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
                  >
                    <i className={`text-xl ${isMuted ? 'ri-volume-mute-line' : volume > 50 ? 'ri-volume-up-line' : 'ri-volume-down-line'}`}></i>
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-green-800 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${isMuted ? 0 : volume}%, #1f2937 ${isMuted ? 0 : volume}%, #1f2937 100%)`
                      }}
                    />
                  </div>
                  
                  <span className="text-white text-sm font-semibold w-8 text-center">
                    {isMuted ? 0 : volume}
                  </span>
                </div>
              </div>
            </div>

            {/* Badges de Compatibilidade */}
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
          </div>
        </div>
      )}

      {/* Player Compacto */}
      {!isExpanded && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-800 via-yellow-700 to-green-800 border-t-2 border-green-600 z-40 shadow-2xl">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Info da Música */}
              <div 
                className="flex items-center space-x-3 flex-1 cursor-pointer"
                onClick={() => setIsExpanded(true)}
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
                  <p className="text-white font-bold text-sm truncate">{currentSong}</p>
                  <p className="text-green-200 text-xs truncate">{currentArtist}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {isBuffering && <i className="ri-loader-4-line animate-spin text-yellow-400 text-xs"></i>}
                    {networkStatus === 'offline' && <i className="ri-wifi-off-line text-red-400 text-xs"></i>}
                    {isPlaying && !isBuffering && <i className="ri-radio-line text-green-400 text-xs"></i>}
                    <span className="text-green-200 text-xs">{connectionStatus}</span>
                  </div>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  disabled={isLoading || networkStatus === 'offline'}
                  className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-lg transform hover:scale-105 disabled:scale-100"
                  aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isLoading || isBuffering ? (
                    <i className="ri-loader-4-line animate-spin text-lg"></i>
                  ) : isPlaying ? (
                    <i className="ri-pause-fill text-lg"></i>
                  ) : (
                    <i className="ri-play-fill text-lg ml-0.5"></i>
                  )}
                </button>

                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-white hover:text-yellow-300 transition-colors bg-black/20 rounded-full w-10 h-10 flex items-center justify-center"
                  aria-label="Expandir player"
                >
                  <i className="ri-fullscreen-line text-lg"></i>
                </button>
              </div>
            </div>

            {/* Barra de Progresso Visual */}
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

      {/* Estilos CSS para slider */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(45deg, #10b981, #eab308);
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }

          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(45deg, #10b981, #eab308);
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
        `
      }} />
    </>
  );
});

MobilePlayerFooter.displayName = 'MobilePlayerFooter';

export default MobilePlayerFooter;
