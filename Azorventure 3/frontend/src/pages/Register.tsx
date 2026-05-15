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
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import HeaderActions from '../components/HeaderActions';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    telefone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { t } = useLang();
  const history = useHistory();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData.name, formData.email, formData.password, formData.telefone);
      history.push('/escolher-categorias');
    } catch (err: any) {
      console.error('Erro detalhado no registro:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || t.registerError;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t.registerTitle}</IonTitle>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t.createAccount}</h2>

          <form onSubmit={handleRegister}>
            <IonItem style={{ marginBottom: '12px' }}>
              <IonLabel position="stacked">{t.fullName}</IonLabel>
              <IonInput
                value={formData.name}
                onIonChange={(e) => handleInputChange('name', e.detail.value!)}
                required
              />
            </IonItem>

            <IonItem style={{ marginBottom: '12px' }}>
              <IonLabel position="stacked">{t.emailLabel}</IonLabel>
              <IonInput
                type="email"
                value={formData.email}
                onIonChange={(e) => handleInputChange('email', e.detail.value!)}
                required
              />
            </IonItem>

            <IonItem style={{ marginBottom: '12px' }}>
              <IonLabel position="stacked">{t.phoneOptional}</IonLabel>
              <IonInput
                type="tel"
                value={formData.telefone}
                onIonChange={(e) => handleInputChange('telefone', e.detail.value!)}
              />
            </IonItem>

            <IonItem style={{ marginBottom: '12px' }}>
              <IonLabel position="stacked">{t.passwordLabel}</IonLabel>
              <IonInput
                type="password"
                value={formData.password}
                onIonChange={(e) => handleInputChange('password', e.detail.value!)}
                required
              />
            </IonItem>

            {error && (
              <IonText color="danger">
                <p style={{ padding: '1rem', textAlign: 'center' }}>{error}</p>
              </IonText>
            )}

            <IonButton
              expand="block"
              type="submit"
              style={{ marginTop: '2rem' }}
              disabled={isLoading}
            >
              {isLoading ? t.creatingAccount : t.createAccountBtn}
            </IonButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <IonText>
              {t.haveAccount}{' '}
              <IonRouterLink routerLink="/login">{t.loginLink}</IonRouterLink>
            </IonText>
          </div>
        </div>

        <IonLoading isOpen={isLoading} message={t.creatingAccount} />
      </IonContent>
    </IonPage>
  );
};

export default Register;