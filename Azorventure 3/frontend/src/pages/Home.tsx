import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonText,
  IonRouterLink,
  IonButtons
} from '@ionic/react';
import {
  calendarOutline,
  ticketOutline,
  storefrontOutline,
  personOutline,
  logInOutline,
  personAddOutline,
  moonOutline,
  sunnyOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import './Home.css';

const Home: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, t, toggleLang } = useLang();
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const handleLogout = async () => {
    await logout();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <span className="home-brand-title">
              <img src="/splash-logo.png" alt="Azorventure logo" className="home-brand-title__logo" />
            </span>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={toggleTheme}>
              <IonIcon icon={isDarkMode ? sunnyOutline : moonOutline} slot="icon-only" />
            </IonButton>
            <IonButton fill="clear" onClick={toggleLang}>
              {lang.toUpperCase()}
            </IonButton>
            {!isAuthenticated ? (
              <>
                <IonButton fill="clear" routerLink="/login">
                  <IonIcon icon={logInOutline} slot="icon-only" />
                </IonButton>
                <IonButton fill="clear" routerLink="/register">
                  <IonIcon icon={personAddOutline} slot="icon-only" />
                </IonButton>
              </>
            ) : (
              <IonButton fill="clear" onClick={handleLogout}>
                {t.logout}
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {isAuthenticated && user ? (
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <IonText>
              <h3>{t.hello}, {user.name}!</h3>
              <p>{t.youHave} {user.pontos} {t.points}</p>
            </IonText>
          </div>
        ) : null}

        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard button routerLink="/events">
                <IonCardHeader>
                  <IonIcon icon={calendarOutline} size="large" color="primary" />
                  <IonCardTitle>{t.events}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {t.eventsDesc}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6">
              <IonCard button routerLink="/tickets">
                <IonCardHeader>
                  <IonIcon icon={ticketOutline} size="large" color="secondary" />
                  <IonCardTitle>{t.tickets}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {t.ticketsDesc}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard button routerLink="/store">
                <IonCardHeader>
                  <IonIcon icon={storefrontOutline} size="large" color="tertiary" />
                  <IonCardTitle>{t.store}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {t.storeDesc}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6">
              <IonCard button routerLink="/profile">
                <IonCardHeader>
                  <IonIcon icon={personOutline} size="large" color="success" />
                  <IonCardTitle>{t.profile}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {t.profileDesc}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {isAuthenticated && user && (user.role === 'admin' || user.role === 'organizador') && (
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <IonCard button routerLink="/create-event">
                  <IonCardHeader>
                    <IonIcon icon={calendarOutline} size="large" color="danger" />
                    <IonCardTitle>{t.createEvent}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {t.createEventDesc}
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeMd="6">
                <IonCard button routerLink="/validate-tickets">
                  <IonCardHeader>
                    <IonIcon icon={checkmarkCircleOutline} size="large" color="warning" />
                    <IonCardTitle>{t.validateTickets}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {t.validateTicketsDesc}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default Home;
