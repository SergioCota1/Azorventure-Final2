import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonList, IonCheckbox, IonIcon } from '@ionic/react';
import { chevronDownOutline, chevronForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { salvarInteresses } from '../services/userService';
import { useLang } from '../contexts/LanguageContext';
import HeaderActions from '../components/HeaderActions';

const CATEGORIAS = [
  { 
    nome: 'Música', 
    subcategorias: ['Rock', 'Pop', 'Jazz', 'Clássica', 'Hip Hop', 'Reggae', 'Eletrônica', 'Folk', 'Blues', 'Samba'] 
  },
  { 
    nome: 'Desporto', 
    subcategorias: ['Futebol', 'Basquetebol', 'Surf', 'Corrida', 'Tênis', 'Natação', 'Ciclismo', 'Voleibol', 'Golfe', 'Rugby'] 
  },
  { 
    nome: 'Arte', 
    subcategorias: ['Pintura', 'Escultura', 'Fotografia', 'Cinema', 'Teatro', 'Dança', 'Literatura', 'Música Clássica', 'Artes Plásticas', 'Design'] 
  },
  { 
    nome: 'Tecnologia', 
    subcategorias: ['Programação', 'Robótica', 'Gadgets', 'Inteligência Artificial', 'Cibersegurança', 'Blockchain', 'Realidade Virtual', 'IoT', 'Big Data', 'Cloud Computing'] 
  },
  { 
    nome: 'Automobilismo', 
    subcategorias: ['Fórmula 1', 'Rally', 'MotoGP', 'Stock Car', 'Kart', 'Off-Road', 'Drift', 'Corridas de Endurance', 'Turismo', 'Sim Racing'] 
  },
  { 
    nome: 'Gastronomia', 
    subcategorias: ['Cozinha Portuguesa', 'Cozinha Italiana', 'Cozinha Japonesa', 'Cozinha Mexicana', 'Cozinha Francesa', 'Vegan', 'Vegetariana', 'Padaria', 'Doces', 'Vinhos'] 
  },
];

const EscolherCategorias: React.FC = () => {
  const [expandida, setExpandida] = useState<string | null>(null);
  const [subtopicos, setSubtopicos] = useState<string[]>([]);
  const { t } = useLang();
  const history = useHistory();

  const toggleCategoria = (nome: string) => {
    setExpandida((prev) => (prev === nome ? null : nome));
  };

  const toggleSubtopico = (sub: string) => {
    setSubtopicos((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSalvar = async () => {
    const topicos = CATEGORIAS.filter((cat) =>
      cat.subcategorias.some((sub) => subtopicos.includes(sub))
    ).map((cat) => cat.nome);
    await salvarInteresses({ topicos, subtopicos });
    history.push('/home');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t.chooseCategoriesTitle}</IonTitle>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {CATEGORIAS.map((cat) => (
            <React.Fragment key={cat.nome}>
              <IonItem button onClick={() => toggleCategoria(cat.nome)}>
                <IonLabel><strong>{(t.categoryNames as Record<string, string>)[cat.nome] ?? cat.nome}</strong></IonLabel>
                <IonIcon icon={expandida === cat.nome ? chevronDownOutline : chevronForwardOutline} slot="end" />
              </IonItem>
              {expandida === cat.nome && cat.subcategorias.map((sub) => (
                <IonItem key={sub} style={{ paddingLeft: '24px' }}>
                  <IonLabel>{(t.subcategoryNames as Record<string, string>)[sub] ?? sub}</IonLabel>
                  <IonCheckbox
                    slot="end"
                    checked={subtopicos.includes(sub)}
                    onIonChange={() => toggleSubtopico(sub)}
                  />
                </IonItem>
              ))}
            </React.Fragment>
          ))}
        </IonList>

        <IonButton expand="block" onClick={handleSalvar} disabled={subtopicos.length === 0} style={{ marginTop: '24px' }}>
          {t.savePreferences}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default EscolherCategorias;
