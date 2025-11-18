
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { useRef } from 'react';
import MobilePlayerFooter from './components/feature/MobilePlayerFooter';

function App() {
  const mobilePlayerRef = useRef<{ togglePlay: () => void }>(null);

  // Função global para controlar o player móvel
  (window as any).toggleMobilePlayer = () => {
    if (mobilePlayerRef.current) {
      mobilePlayerRef.current.togglePlay();
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <div className="App">
          <AppRoutes />
          <MobilePlayerFooter ref={mobilePlayerRef} />
        </div>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
