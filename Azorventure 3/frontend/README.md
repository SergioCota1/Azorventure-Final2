# AzorVenture - Frontend

Aplicação móvel Ionic React para a plataforma AzorVenture, conectada ao backend Node.js com MongoDB Atlas.

## 🚀 Tecnologias Utilizadas

- **Ionic React** - Framework para desenvolvimento de aplicações móveis híbridas
- **React 19** - Biblioteca JavaScript para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultra-rápido
- **Capacitor** - Runtime nativo para aplicações web
- **Axios** - Cliente HTTP para requisições à API

## 📱 Funcionalidades

- ✅ Autenticação de usuários (Login/Registro)
- ✅ Visualização de eventos
- ✅ Sistema de bilhetes
- ✅ Loja de pontos
- ✅ Perfil do usuário
- ✅ Interface responsiva para mobile

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Backend AzorVenture rodando (porta 3000)

### Instalação

1. Clone o repositório e navegue para a pasta frontend:
```bash
cd AzorVenture/frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=AzorVenture
VITE_APP_VERSION=1.0.0
```

## 🚀 Executando a Aplicação

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

## 📱 Build para Dispositivos Móveis

### Android
```bash
npx cap add android
npx cap sync android
npx cap open android
```

### iOS (macOS apenas)
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Context API (AuthContext)
│   ├── pages/          # Páginas da aplicação
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Events.tsx
│   │   ├── Tickets.tsx
│   │   ├── Store.tsx
│   │   └── Profile.tsx
│   ├── services/       # Serviços de API
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── eventosService.ts
│   │   ├── bilhetesService.ts
│   │   └── lojaService.ts
│   ├── theme/          # Tema e variáveis CSS
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Ponto de entrada
├── public/             # Assets estáticos
├── capacitor.config.ts # Configuração Capacitor
├── ionic.config.json   # Configuração Ionic
└── package.json
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run test.e2e` - Executa testes end-to-end
- `npm run test.unit` - Executa testes unitários
- `npm run lint` - Executa o linter

## 🌐 API Integration

A aplicação se conecta ao backend através dos seguintes serviços:

- **AuthService** - Autenticação e gerenciamento de usuários
- **EventosService** - CRUD de eventos
- **BilhetesService** - Gerenciamento de bilhetes
- **LojaService** - Sistema de loja e pontos

## 📋 Próximos Passos

- [ ] Implementar funcionalidades completas das páginas
- [ ] Adicionar validação de formulários
- [ ] Implementar sistema de notificações
- [ ] Adicionar testes automatizados
- [ ] Otimizar performance e bundle size
- [ ] Implementar PWA features

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.