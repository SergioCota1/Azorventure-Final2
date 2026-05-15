import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
  IonButtons,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonToast,
  IonCard,
  IonCardContent
} from '@ionic/react';
import { homeOutline, checkmarkCircleOutline, cameraOutline } from 'ionicons/icons';
import jsQR from 'jsqr';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import bilhetesService from '../services/bilhetesService';
import HeaderActions from '../components/HeaderActions';

const ValidateTickets: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLang();
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [validationResult, setValidationResult] = useState<{ message: string } | null>(null);

  const handleValidate = async () => {
    if (!codigo.trim()) {
      setToastMessage(t.noTicketCode);
      setShowToast(true);
      return;
    }

    try {
      setIsLoading(true);
      const result = await bilhetesService.validar(codigo.trim());
      setValidationResult(result);
      setToastMessage(t.ticketValidated);
      setShowToast(true);
      setCodigo('');
    } catch (err: any) {
      setValidationResult(null);
      setToastMessage(t.validateError(err.response?.data?.message || err.message));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      setIsLoading(true);
      
      // Para testes web, usar file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'camera'; // Tenta usar câmera se disponível
      
      const file = await new Promise<File>((resolve, reject) => {
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files[0]) {
            resolve(files[0]);
          } else {
            reject(new Error(t.noFileSelected));
          }
        };
        input.oncancel = () => reject(new Error(t.cancelled));
        input.click();
      });

      // Ler arquivo como data URL
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(t.fileReadError));
        reader.readAsDataURL(file);
      });

      // Criar imagem para decodificar
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Criar canvas para processar
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Obter dados da imagem
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Decodificar QR
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        // Validar o código encontrado
        const result = await bilhetesService.validar(code.data);
        setValidationResult(result);
        setToastMessage(t.ticketValidated);
        setShowToast(true);
      } else {
        setToastMessage(t.qrNotFound);
        setShowToast(true);
      }
    } catch (err: any) {
      if (err.message !== t.cancelled) {
        setToastMessage(t.scanError(err.message || 'Erro desconhecido'));
        setShowToast(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton routerLink="/home">
                <IonIcon icon={homeOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonTitle>{t.validateTicketsPage}</IonTitle>
            <HeaderActions />
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <IonText>
            <h3>{t.loginToValidate}</h3>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'organizador') {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton routerLink="/home">
                <IonIcon icon={homeOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonTitle>{t.validateTicketsPage}</IonTitle>
            <HeaderActions />
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <IonText>
            <h3>{t.validateAccessDenied}</h3>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton routerLink="/home">
              <IonIcon icon={homeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>{t.validateTicketsPage}</IonTitle>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>{t.validateInstructions}</p>

        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">{t.ticketCodeLabel}</IonLabel>
              <IonInput
                value={codigo}
                onIonChange={(e) => setCodigo(e.detail.value!)}
                placeholder={t.ticketCodePlaceholder}
                clearInput
              />
            </IonItem>

            <IonButton
              expand="block"
              onClick={handleValidate}
              disabled={!codigo.trim() || isLoading}
              style={{ marginTop: '20px' }}
            >
              <IonIcon icon={checkmarkCircleOutline} slot="start" />
              {t.validateBtn}
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              onClick={handleScan}
              disabled={isLoading}
              style={{ marginTop: '10px' }}
            >
              <IonIcon icon={cameraOutline} slot="start" />
              {t.scanQR}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {validationResult && (
          <IonCard color="success" style={{ marginTop: '20px' }}>
            <IonCardContent>
              <IonText color="light">
                <h3>✅ {validationResult.message}</h3>
              </IonText>
            </IonCardContent>
          </IonCard>
        )}

        <IonLoading isOpen={isLoading} message={t.validating} />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default ValidateTickets;