import React, { useState } from 'react';
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
import authService from '../services/authService';
import { useLang } from '../contexts/LanguageContext';
import HeaderActions from '../components/HeaderActions';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useLang();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await authService.forgotPassword(email);
      setSuccess(result.message || t.resetPasswordEmailSent);
    } catch (err: any) {
      setError(err.response?.data?.message || t.resetPasswordRequestError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Recuperar Password</IonTitle>
          <IonButtons slot="start">
            <IonButton routerLink="/login">{t.loginLink}</IonButton>
          </IonButtons>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '420px', margin: '0 auto', paddingTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{t.forgotPasswordTitle}</h2>
          <p style={{ textAlign: 'center', opacity: 0.85 }}>
            {t.forgotPasswordHint}
          </p>

          <form onSubmit={handleSubmit}>
            <IonItem style={{ marginTop: '16px' }}>
              <IonLabel position="stacked">{t.email}</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(String(e.detail.value || ''))}
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
              {t.sendResetLink}
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

export default ForgotPassword;