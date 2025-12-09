# WebAds Analytics

Plataforma integrada de análise e gerenciamento de campanhas publicitárias com suporte a múltiplas plataformas (Google Ads, Meta, TikTok) e insights alimentados por IA.

## 🎯 Funcionalidades

✅ **Integração Google Ads** - Autenticação OAuth com gerenciamento seguro de tokens  
✅ **Dashboard Unificado** - Visualize campanhas de múltiplas plataformas  
✅ **Insights com IA** - Análises inteligentes com Gemini AI  
✅ **Comparação de Cenários** - Simule e compare diferentes estratégias  
✅ **Modo Escuro** - Suporte completo a temas claro/escuro  
✅ **Tempo Real** - Dados atualizados das suas contas de anúncio  

## 📋 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                   │
│  SettingsIntegrations.tsx → googleAdsService.ts → APIs      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express.js + Node.js)                 │
│  routes/ → googleOAuthService.js → Token Management         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Google OAuth 2.0 + Google Ads API                 │
│  Authorization → Token Exchange → Campaign Data             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js v16+
- npm ou yarn
- Conta Google com acesso a Google Ads

### 1. Instalação

```bash
# Clonar repositório
git clone https://github.com/pietrogmedeiros/webads_analytics.git
cd webads_analytics

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..
```

### 2. Configuração

**Frontend** - Criar `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
GEMINI_API_KEY=sua_chave_gemini_aqui
```

**Backend** - Criar `backend/.env`:
```env
BACKEND_PORT=5000
NODE_ENV=development

GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/callback

FRONTEND_URL=http://localhost:5173
```

### 3. Obter Credenciais Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative "Google Ads API"
4. Vá em **Credentials** → **+ Create Credentials** → **OAuth 2.0 Client ID**
5. Selecione **Web application**
6. Adicione URIs autorizadas:
   - **JavaScript origins**: `http://localhost:5173`
   - **Redirect URIs**: `http://localhost:5173/callback`
7. Copie Client ID e Secret para `backend/.env`

### 4. Executar em Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend rodará em http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend rodará em http://localhost:5173
```

## 📁 Estrutura do Projeto

```
webads-analytics/
├── backend/                          # API Node.js/Express
│   ├── routes/
│   │   ├── auth.js                   # OAuth endpoints
│   │   ├── integrations.js           # Gerenciar integrações
│   │   └── campaigns.js              # Dados de campanhas
│   ├── services/
│   │   └── googleOAuthService.js     # Lógica OAuth e tokens
│   ├── server.js                     # App principal
│   ├── package.json
│   └── .env                          # Configurações
│
├── components/                        # Componentes React
│   ├── SettingsIntegrations.tsx      # Modal de integrações
│   ├── Dashboard.tsx                 # Dashboard principal
│   ├── CampaignTable.tsx             # Tabela de campanhas
│   └── ...
│
├── services/
│   ├── googleAdsService.ts           # Cliente para backend
│   ├── geminiService.ts              # IA Insights
│   └── supabaseClient.ts             # Banco de dados
│
├── App.tsx                            # Componente raiz
├── vite.config.ts                     # Configuração Vite
├── tsconfig.json                      # TypeScript config
└── package.json                       # Dependências
```

## 🔐 Fluxo de Autenticação OAuth

```
1. Usuário clica "Conectar" em Settings > Integrations
                    ↓
2. Modal abre solicitando Client ID e Client Secret
                    ↓
3. Frontend envia credenciais para backend POST /api/auth/google-ads/oauth-url
                    ↓
4. Backend gera URL OAuth e redireciona para Google
                    ↓
5. Google exibe tela de consentimento (permissões)
                    ↓
6. Usuário autoriza acesso
                    ↓
7. Google redireciona para http://localhost:5173?code=AUTH_CODE
                    ↓
8. Frontend detecta código na URL
                    ↓
9. Frontend envia código para backend POST /api/auth/google-ads/callback
                    ↓
10. Backend troca código por access_token + refresh_token
                    ↓
11. Tokens armazenados com segurança no backend
                    ↓
12. Frontend marcado como "Conectado" ✅
```

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/google-ads/oauth-url` - Gera URL OAuth com credenciais dinâmicas
- `POST /api/auth/google-ads/callback` - Troca código por tokens
- `GET /api/auth/google-ads/status/:userId` - Verifica status da conexão
- `POST /api/auth/google-ads/disconnect` - Desconecta integração

### Integrações
- `GET /api/integrations/:userId` - Lista todas as integrações
- `GET /api/integrations/:userId/google-ads` - Info da integração Google Ads
- `DELETE /api/integrations/:integrationId` - Remove integração

### Campanhas
- `GET /api/campaigns/google-ads/:integrationId` - Busca campanhas

## 🛡️ Segurança

✅ Client Secret protegido no backend (nunca exposto ao frontend)  
✅ Tokens OAuth armazenados com segurança  
✅ CORS configurado apenas para o frontend  
✅ OAuth com offline access para refresh tokens  
✅ Validação de entrada em todos os endpoints  
⚠️ Em produção: usar HTTPS, rate limiting, autenticação JWT

## 📦 Stack Tecnológico

**Frontend:**
- React 19
- TypeScript
- Vite 6
- TailwindCSS
- Recharts (gráficos)

**Backend:**
- Express.js
- Node.js
- Axios (HTTP client)
- UUID (unique IDs)

**Integrações:**
- Google OAuth 2.0
- Google Ads API
- Gemini AI

## 🚀 Deploy em Produção

### Variáveis de Ambiente Necessárias

```env
# Backend
NODE_ENV=production
BACKEND_PORT=5000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://seu-dominio.com/callback
FRONTEND_URL=https://seu-dominio.com
DATABASE_URL=postgresql://...

# Frontend
VITE_API_URL=https://seu-dominio.com/api
GEMINI_API_KEY=...
```

### Recomendações

1. **Banco de Dados** - Substitua tokenStore em-memória por PostgreSQL/MongoDB
2. **JWT** - Implemente autenticação por tokens JWT
3. **HTTPS** - Use certificados SSL/TLS
4. **Rate Limiting** - Proteja endpoints com rate limiting
5. **Monitoring** - Configure alertas e logs
6. **CI/CD** - Use GitHub Actions para deploy automático

## 🔄 Próximos Passos

- [ ] Integrar Google Ads API real para dados de campanhas
- [ ] Implementar persistência em banco de dados
- [ ] Adicionar suporte a GA4 e TikTok Ads
- [ ] Dashboard de relatórios PDF
- [ ] Agendamento automático de campanhas
- [ ] Webhooks para sincronização em tempo real

## 📞 Suporte

Para dúvidas ou problemas, abra uma [issue](https://github.com/pietrogmedeiros/webads_analytics/issues) no repositório.

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes

---

**Desenvolvido com ❤️ para Webcontinental**
