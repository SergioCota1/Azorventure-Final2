import React, { useMemo, useState } from 'react';
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
  IonButtons
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useLang } from '../contexts/LanguageContext';
import HeaderActions from '../components/HeaderActions';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const history = useHistory();
  const location = useLocation();
  const { t } = useLang();

  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError(t.invalidResetToken);
      return;
    }

    if (password.length < 6) {
      setError(t.minPasswordLength);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.resetPassword(token, password);
      setSuccess(result.message || t.resetPasswordSuccess);
      setTimeout(() => history.push('/login'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao redefinir password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nova Password</IonTitle>
          <IonButtons slot="start">
            <IonButton routerLink="/login">{t.loginLink}</IonButton>
          </IonButtons>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '420px', margin: '0 auto', paddingTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{t.resetPasswordTitle}</h2>

          <form onSubmit={handleSubmit}>
            <IonItem>
              <IonLabel position="stacked">{t.newPassword}</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(String(e.detail.value || ''))}
                required
              />
            </IonItem>

            <IonItem style={{ marginTop: '10px' }}>
              <IonLabel position="stacked">{t.confirmPassword}</IonLabel>
              <IonInput
                type="password"
                value={confirmPassword}
                onIonInput={(e) => setConfirmPassword(String(e.detail.value || ''))}
                required
              />
            </IonItem>

            {error && (
              <IonText color="danger">
                <p style={{ paddingTop: '12px' }}>{error}</p>
              </IonText>
            )}

            {success && (
              <IonText color="success">
                <p style={{ paddingTop: '12px' }}>{success}</p>
              </IonText>
            )}

            <IonButton expand="block" type="submit" style={{ marginTop: '20px' }} disabled={isLoading}>
              {t.resetPasswordAction}
            </IonButton>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <IonRouterLink routerLink="/login">{t.loginLink}</IonRouterLink>
          </div>
        </div>

        <IonLoading isOpen={isLoading} message={t.loading} />
      </IonContent>
    </IonPage>
  );
};

export default ResetPassword;