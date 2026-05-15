# AzorVenture

Plataforma completa de eventos e experiências dos Açores, composta por backend Node.js com MongoDB Atlas e frontend Ionic React.

## 📁 Estrutura do Projeto

```
AzorVenture/
├── backend/           # API REST Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.js
│   ├── package.json
│   └── README.md
│
└── frontend/          # App Ionic React
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── services/
    │   └── App.tsx
    ├── capacitor.config.ts
    ├── ionic.config.json
    └── README.md
```

## 🚀 Início Rápido

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Tecnologias

### Backend
- **Node.js** + **Express.js**
- **MongoDB Atlas** (Database)
- **JWT** (Autenticação)
- **bcrypt** (Hash de senhas)
- **Firebase** (Storage opcional)

### Frontend
- **Ionic React** + **TypeScript**
- **Capacitor** (Mobile runtime)
- **Axios** (HTTP client)
- **Context API** (State management)

## 📱 Funcionalidades

- ✅ Sistema de autenticação completo
- ✅ CRUD de eventos
- ✅ Sistema de bilhetes
- ✅ Loja de pontos/recompensas
- ✅ Interface mobile-first
- ✅ API RESTful

## 🔧 Configuração

### MongoDB Atlas
1. Crie uma conta no [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crie um cluster gratuito
3. Configure as variáveis de ambiente no `.env`

### Firebase (Opcional)
Para funcionalidades de upload de imagens, configure o Firebase:
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Storage
3. Configure as credenciais no backend

## 📋 API Endpoints

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `GET /auth/profile` - Perfil do usuário

### Eventos
- `GET /eventos` - Listar eventos
- `POST /eventos` - Criar evento
- `PUT /eventos/:id` - Atualizar evento
- `DELETE /eventos/:id` - Deletar evento

### Bilhetes
- `GET /bilhetes` - Meus bilhetes
- `POST /bilhetes` - Comprar bilhete

### Loja
- `GET /loja` - Produtos disponíveis
- `POST /loja/comprar` - Comprar produto

## 🚀 Deploy

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npx cap sync
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.