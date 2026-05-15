import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Events from './pages/Events';
import Tickets from './pages/Tickets';
import Store from './pages/Store';
import Profile from './pages/Profile';
import EscolherCategorias from './pages/EscolherCategorias';
import ValidateTickets from './pages/ValidateTickets';
import CreateEvent from './pages/CreateEvent';
import Checkout from './pages/Checkout';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './theme/splash.css';

setupIonicReact();

const SPLASH_DURATION_MS = 2200;
const SPLASH_SESSION_KEY = 'azorventure_splash_seen';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(() => {
    return window.sessionStorage.getItem(SPLASH_SESSION_KEY) !== '1';
  });
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!showSplash) {
      return;
    }

    // Mark splash as seen immediately so a refresh won't show it again.
    window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1');

    const fadeTimer = window.setTimeout(() => setIsFadingOut(true), SPLASH_DURATION_MS - 500);
    const hideTimer = window.setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [showSplash]);

  return (
    <IonApp>
      {showSplash && (
        <div className={`app-splash-screen ${isFadingOut ? 'app-splash-screen--fade-out' : ''}`}>
          <div className="app-splash-screen__content">
            <img
              className="app-splash-screen__logo"
              src="/splash-logo.png"
              alt="Azorventure"
              onError={(e) => {
                e.currentTarget.src = '/favicon.png';
              }}
            />
          </div>
        </div>
      )}

      <IonReactRouter>
        <LanguageProvider>
        <AuthProvider>
          <IonRouterOutlet>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/register">
              <Register />
            </Route>
            <Route exact path="/forgot-password">
              <ForgotPassword />
            </Route>
            <Route exact path="/reset-password">
              <ResetPassword />
            </Route>
            <Route exact path="/events">
              <Events />
            </Route>
            <Route exact path="/tickets">
              <Tickets />
            </Route>
            <Route exact path="/store">
              <Store />
            </Route>
            <Route exact path="/profile">
              <Profile />
            </Route>
            <Route exact path="/escolher-categorias">
              <EscolherCategorias />
            </Route>
            <Route exact path="/validate-tickets">
              <ValidateTickets />
            </Route>
            <Route exact path="/create-event">
              <CreateEvent />
            </Route>
            <Route exact path="/checkout/:eventoId">
              <Checkout />
            </Route>
            <Route exact path="/">
              <Redirect to="/login?initial=1" />
            </Route>
          </IonRouterOutlet>
        </AuthProvider>
        </LanguageProvider>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
