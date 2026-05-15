import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonText,
  IonLoading,
  IonButtons,
  IonIcon,
  IonToast,
  IonBackButton
} from '@ionic/react';
import { arrowBackOutline, checkmarkCircleOutline } from 'ionicons/icons';
import pagamentoService from '../services/pagamentoService';
import { useLang } from '../contexts/LanguageContext';
import HeaderActions from '../components/HeaderActions';

declare global {
  interface Window {
    easypayCheckout: {
      startCheckout: (manifest: any, options?: any) => { unmount: () => void };
    };
  }
}

const Checkout: React.FC = () => {
  const { eventoId } = useParams<{ eventoId: string }>();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark-theme'));
  const [pagamentoId, setPagamentoId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const checkoutRef = useRef<{ unmount: () => void } | null>(null);
  const { t } = useLang();
  const sdkLoadedRef = useRef(false);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const confirmWithRetry = async (id: string, attempts = 4, intervalMs = 1200) => {
    let lastError: any = null;
    for (let i = 0; i < attempts; i++) {
      try {
        await pagamentoService.confirmar(id);
        return true;
      } catch (err) {
        lastError = err;
        if (i < attempts - 1) {
          await delay(intervalMs);
        }
      }
    }
    if (lastError) {
      throw lastError;
    }
    return false;
  };

  const waitForPaidStatus = async (id: string, attempts = 8, intervalMs = 1500) => {
    for (let i = 0; i < attempts; i++) {
      const status = await pagamentoService.getStatus(id);
      if (status.status === 'pago' && status.bilhete) {
        return true;
      }
      if (i < attempts - 1) {
        await delay(intervalMs);
      }
    }
    return false;
  };

  const loadSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.easypayCheckout) {
        resolve();
        return;
      }
      if (sdkLoadedRef.current) {
        // SDK script already added, wait for it
        const check = setInterval(() => {
          if (window.easypayCheckout) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error('SDK load timeout')); }, 10000);
        return;
      }
      sdkLoadedRef.current = true;
      const script = document.createElement('script');
      script.src = 'https://cdn.easypay.pt/checkout/2.9.1/';
      script.onload = () => {
        const check = setInterval(() => {
          if (window.easypayCheckout) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error('SDK init timeout')); }, 10000);
      };
      script.onerror = () => reject(new Error('Failed to load EasyPay SDK'));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    let cancelled = false;

    const initCheckout = async () => {
      try {
        setIsLoading(true);

        // 1. Create checkout session on backend
        const data = await pagamentoService.criarCheckout(eventoId);
        if (cancelled) return;

        setPagamentoId(data.pagamentoId);

        // 2. Load EasyPay SDK
        await loadSDK();
        if (cancelled) return;

        setIsLoading(false);

        // 3. Start checkout
        const isTest = import.meta.env.VITE_EASYPAY_ENV !== 'production';

        checkoutRef.current = window.easypayCheckout.startCheckout(data.manifest, {
          id: 'easypay-checkout',
          display: 'inline',
          testing: isTest,
          language: 'pt_PT',
          onSuccess: async (checkoutInfo: any) => {
            console.log('Payment successful:', checkoutInfo);
            setIsLoading(true);
            try {
              await confirmWithRetry(data.pagamentoId);
              setPaymentSuccess(true);
              setToastMessage(t.paymentSuccessTicket);
              setShowToast(true);
            } catch (err: any) {
              console.error('Error confirming payment:', err);
              try {
                const paidAndTicketCreated = await waitForPaidStatus(data.pagamentoId, 12, 1500);
                if (paidAndTicketCreated) {
                  setPaymentSuccess(true);
                  setToastMessage(t.paymentSuccessTicket);
                } else {
                  // One last attempt in case payment is already captured but ticket creation lagged.
                  try {
                    await confirmWithRetry(data.pagamentoId, 2, 1000);
                    setPaymentSuccess(true);
                    setToastMessage(t.paymentSuccessTicket);
                    setShowToast(true);
                    setIsLoading(false);
                    return;
                  } catch {
                    // Keep fallback error handling below.
                  }

                  setToastMessage(t.paymentReceivedSoon);
                  setError(t.paymentError);
                }
                setShowToast(true);
              } catch (statusErr) {
                console.error('Error checking payment status:', statusErr);
                setToastMessage(t.paymentReceivedSoon);
                setShowToast(true);
                setError(t.paymentError);
              }
            } finally {
              setIsLoading(false);
            }
          },
          onError: (err: any) => {
            console.error('Checkout error:', err);
            if (err.code === 'checkout-expired') {
              setError(t.sessionExpired);
            } else if (err.code === 'already-paid') {
              setPaymentSuccess(true);
              setToastMessage(t.alreadyPaid);
              setShowToast(true);
            } else {
              setError(t.paymentError);
            }
          },
          onPaymentError: (err: any) => {
            console.log('Recoverable payment error:', err);
            const methodNames: Record<string, string> = {
              mbw: t.mbway, cc: t.creditCard, mb: t.multibanco, dd: t.directDebit
            };
            const method = methodNames[err.paymentMethod] || err.paymentMethod;
            setToastMessage(t.paymentMethodError(method));
            setShowToast(true);
          },
          onClose: () => {
            console.log('Checkout closed');
          }
        });
      } catch (err: any) {
        if (cancelled) return;
        console.error('Checkout init error:', err);
        setError(err.response?.data?.message || err.message || 'Erro ao iniciar pagamento');
        setIsLoading(false);
      }
    };

    initCheckout();

    return () => {
      cancelled = true;
      if (checkoutRef.current) {
        checkoutRef.current.unmount();
      }
    };
  }, [eventoId]);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/events" />
          </IonButtons>
          <IonTitle>{paymentSuccess ? t.paymentConfirmed : t.payment}</IonTitle>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent
        className="ion-padding"
        style={{
          '--background': (!error && !paymentSuccess) ? '#ffffff' : undefined
        } as React.CSSProperties}
      >
        {error && (
          <div className="ion-text-center" style={{ padding: '20px', color: isDarkMode ? '#ffffff' : '#1f2937' }}>
            <IonText color="danger">
              <h3>{error}</h3>
            </IonText>
            <IonButton onClick={() => history.push('/events')} style={{ marginTop: '16px' }}>
              {t.backToEvents}
            </IonButton>
          </div>
        )}

        {paymentSuccess && (
          <div className="ion-text-center" style={{ padding: '40px 20px', color: isDarkMode ? '#ffffff' : '#1f2937' }}>
            <IonIcon
              icon={checkmarkCircleOutline}
              style={{ fontSize: '80px', color: '#2dd36f' }}
            />
            <h2 style={{ color: isDarkMode ? '#ffffff' : '#2dd36f' }}>{t.paymentConfirmedTitle}</h2>
            <p>{t.ticketCreated}</p>
            <p>{t.checkEmail}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <IonButton onClick={() => history.push('/tickets')}>
                {t.seeTickets}
              </IonButton>
              <IonButton fill="outline" onClick={() => history.push('/events')}>
                {t.backToEvents}
              </IonButton>
            </div>
          </div>
        )}

        {!error && !paymentSuccess && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '24px' }}>
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '12px', width: '100%', maxWidth: '460px' }}>
              <div id="easypay-checkout" style={{ minHeight: '400px', width: '100%', maxWidth: '420px', margin: '0 auto' }}></div>
            </div>
          </div>
        )}

        <IonLoading isOpen={isLoading} message={t.preparingPayment} />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={4000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Checkout;
