import React, { useEffect, useState } from 'react';
import { IonButtons, IonButton, IonIcon } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { useLang } from '../contexts/LanguageContext';

const HeaderActions: React.FC = () => {
  const { lang, toggleLang } = useLang();
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark-theme'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    document.documentElement.classList.toggle('dark-theme', nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  return (
    <IonButtons slot="end">
      <IonButton fill="clear" onClick={toggleTheme}>
        <IonIcon icon={isDarkMode ? sunnyOutline : moonOutline} slot="icon-only" />
      </IonButton>
      <IonButton fill="clear" onClick={toggleLang}>
        {lang.toUpperCase()}
      </IonButton>
    </IonButtons>
  );
};

export default HeaderActions;
