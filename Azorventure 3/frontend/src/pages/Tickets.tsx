import React, { useState, useEffect, useCallback } from 'react';
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  useIonViewDidLeave
} from '@ionic/react';
import { homeOutline } from 'ionicons/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import bilhetesService, { Bilhete } from '../services/bilhetesService';
import HeaderActions from '../components/HeaderActions';

const Tickets: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLang();
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'used'>('all');

  useIonViewDidLeave(() => {
    setIsLoading(false);
  });

  useEffect(() => {
    if (!isLoading) return;

    const timer = window.setTimeout(() => {
      setIsLoading(false);
      setError(t.errorLoadingTickets);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [isLoading, t]);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('Request timeout')), ms);
      promise
        .then((value) => {
          window.clearTimeout(timer);
          resolve(value);
        })
        .catch((err) => {
          window.clearTimeout(timer);
          reject(err);
        });
    });
  };

  const loadBilhetes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await withTimeout(bilhetesService.getMyBilhetes(), 12000);
      console.log('Bilhetes loaded:', data);
      console.log('Current language:', lang);
      setBilhetes(data);
      setError('');
    } catch (err: any) {
      setError(t.errorLoadingTickets);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [lang, t]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBilhetes();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadBilhetes]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadBilhetes();
    event.detail.complete();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredAndSortedBilhetes = () => {
    let filtered = bilhetes;

    // Filtrar
    if (filterType === 'active') {
      filtered = filtered.filter(b => !b.usado);
    } else if (filterType === 'used') {
      filtered = filtered.filter(b => b.usado);
    }

    // Ordenar bilhetes ativos por data mais próxima
    return filtered.sort((a, b) => {
      if (a.usado === b.usado) {
        // Se ambos têm o mesmo status, ordenar por data do evento
        const dateA = a.eventoData?.inicio ? new Date(a.eventoData.inicio).getTime() : 0;
        const dateB = b.eventoData?.inicio ? new Date(b.eventoData.inicio).getTime() : 0;
        return dateA - dateB;
      }
      // Bilhetes ativos primeiro
      return a.usado ? 1 : -1;
    });
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
            <IonTitle>{t.myTickets}</IonTitle>
            <HeaderActions />
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <IonText>
            <h3>{t.loginToSeeTickets}</h3>
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
          <IonTitle>{t.myTickets}</IonTitle>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="ion-padding">
          {error && (
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          )}

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <IonButton
              fill={filterType === 'all' ? 'solid' : 'outline'}
              onClick={() => setFilterType('all')}
              size="small"
            >
              {t.all}
            </IonButton>
            <IonButton
              fill={filterType === 'active' ? 'solid' : 'outline'}
              onClick={() => setFilterType('active')}
              size="small"
            >
              {t.active}
            </IonButton>
            <IonButton
              fill={filterType === 'used' ? 'solid' : 'outline'}
              onClick={() => setFilterType('used')}
              size="small"
            >
              {t.used}
            </IonButton>
          </div>

          <IonGrid>
            <IonRow>
              {getFilteredAndSortedBilhetes().map((bilhete) => (
                <IonCol size="12" key={bilhete.id}>
                  <IonCard style={{
                    border: bilhete.usado ? '2px solid #28a745' : '2px solid #007bff',
                    opacity: bilhete.usado ? 0.7 : 1
                  }}>
                    <IonCardHeader>
                      <IonCardTitle style={{
                        color: bilhete.usado ? '#28a745' : '#1a1a1a'
                      }}>
                        {(lang === 'en' && bilhete.eventoData?.tituloEn ? bilhete.eventoData.tituloEn : bilhete.eventoData?.titulo) || 'Evento'}
                        {bilhete.usado && ` (${t.used})`}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p><strong>{t.eventDate}</strong> {bilhete.eventoData?.inicio ? formatDate(bilhete.eventoData.inicio) : 'N/A'}</p>
                      <p><strong>{t.location}</strong> {bilhete.eventoData?.local || 'N/A'}</p>
                      <p><strong>{t.purchasedAt}</strong> {formatDate(bilhete.criadoEm)}</p>
                      <p><strong>{t.status}</strong> {bilhete.usado ? t.used : t.valid}</p>
                      {!bilhete.usado && bilhete.qrCode && (
                        <div style={{ marginTop: '15px', textAlign: 'center', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px' }}>
                          {bilhete.qrCode.startsWith('data:') ? (
                            <img src={bilhete.qrCode} alt="QR Code" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                          ) : (
                            <QRCodeSVG
                              value={bilhete.qrCode}
                              size={200}
                              level="H"
                              includeMargin={true}
                            />
                          )}
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>

          {bilhetes.length === 0 && !isLoading && (
            <div className="ion-text-center">
              <IonText>
                <p>{t.noTickets}</p>
                <p>{t.visitEvents}</p>
              </IonText>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tickets;