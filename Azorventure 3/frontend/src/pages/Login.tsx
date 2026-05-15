import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonLoading,
  IonRouterLink,
  IonButtons,
  IonIcon
} from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import authService from '../services/authService';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [error, setError] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { login } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const history = useHistory();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const dark = savedTheme === 'dark';
    setIsDarkMode(dark);
    document.documentElement.classList.toggle('dark-theme', dark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    document.documentElement.classList.toggle('dark-theme', nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  const submitFromEnter = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || isLoading) return;
    e.preventDefault();
    void handleLogin({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(t.loginError);
      return;
    }

    setIsLoading(true);
    setError('');
    setRecoverSuccess('');

    try {
      await login(email, password);
      history.push('/home');
    } catch (err: any) {
      const statusCode = err.response?.status;
      const backendMessage = String(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || '');
      const invalidCredentialsMessage = lang === 'en' ? 'Incorrect credentials' : 'Credenciais incorretas';
      const errorMessage = statusCode === 400 || /credenciais|password incorreta|invalid credentials|incorrect password/i.test(backendMessage)
        ? invalidCredentialsMessage
        : (backendMessage || t.loginError);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    setError('');
    setRecoverSuccess('');

    if (!email) {
      setError(t.emailLabel.replace('*', '').trim());
      return;
    }

    setIsRecovering(true);
    try {
      const result = await authService.forgotPassword(email);
      setRecoverSuccess(result.message || t.resetPasswordEmailSent);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t.resetPasswordRequestError;
      setError(errorMessage);
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t.loginTitle}</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={toggleTheme}>
              <IonIcon icon={isDarkMode ? sunnyOutline : moonOutline} slot="icon-only" />
            </IonButton>
            <IonButton fill="clear" onClick={toggleLang}>
              {lang.toUpperCase()}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t.loginBtn}</h2>

          <form onSubmit={handleLogin}>
            <IonItem style={{ marginBottom: '12px' }}>
              <IonLabel position="stacked" style={{ fontSize: '1.1rem', fontWeight: '500' }}>{t.emailLabel}</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(String(e.detail.value || ''))}
                onKeyDown={submitFromEnter}
                onIonBlur={() => setError('')}
                required
              />
            </IonItem>

            <IonItem style={{ marginBottom: '12px' }}>
              <IonLabel position="stacked" style={{ fontSize: '1.1rem', fontWeight: '500' }}>{t.passwordLabel}</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(String(e.detail.value || ''))}
                onKeyDown={submitFromEnter}
                onIonBlur={() => setError('')}
                required
              />
            </IonItem>

            {error && (
              <IonText color="danger">
                <p style={{ padding: '1rem', textAlign: 'center' }}>{error}</p>
              </IonText>
            )}

            {recoverSuccess && (
              <IonText color="success">
                <p style={{ padding: '1rem', textAlign: 'center' }}>{recoverSuccess}</p>
              </IonText>
            )}

            <IonButton
              expand="block"
              type="submit"
              style={{ marginTop: '2rem' }}
              disabled={isLoading}
            >
              {isLoading ? t.loggingIn : t.loginAction}
            </IonButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <IonText>
              <IonButton fill="clear" onClick={handleRecoverPassword} disabled={isRecovering || isLoading}>
                {isRecovering ? t.loading : t.forgotPassword}
              </IonButton>
            </IonText>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <IonText>
              {t.noAccount}{' '}
              <IonRouterLink routerLink="/register">{t.register}</IonRouterLink>
            </IonText>
          </div>
        </div>

        <IonLoading isOpen={isLoading} message={t.loggingIn} />
      </IonContent>
    </IonPage>
  );
};

export default Login;