# Guia de Integração Meta Ads

## 📋 Pré-requisitos

1. **Conta Meta Business Manager**
   - Acesso a: https://business.facebook.com
   - Permissões de Admin na conta

2. **Meta App**
   - Criar um novo app em: https://developers.facebook.com/apps
   - Tipo: Business/Commerce
   - Produto: Marketing API

## 🔧 Configuração no Meta

### Passo 1: Criar a Meta App

1. Acesse https://developers.facebook.com/apps
2. Clique em "My Apps" > "Create App"
3. Escolha "Business" como tipo
4. Preencha as informações básicas da app
5. Selecione "Marketing API" como produto

### Passo 2: Obter Credenciais

1. Vá em **Configurações** > **Básico**
2. Copie:
   - **App ID** - Use como `Client ID`
   - **App Secret** - Use como `Client Secret`

3. Guarde essas credenciais em local seguro

### Passo 3: Configurar Redirect URI

1. Em **Configurações** > **OAuth válidos**
2. Adicione em **URIs de redirecionamento válidas**:
   - `http://localhost:5173/callback` (desenvolvimento)
   - `https://seu-dominio.com/callback` (produção)

### Passo 4: Selecionar Permissões

Em **Produtos** > **Marketing API**, ative:
- ✅ `ads_read` - Ler dados de campanhas
- ✅ `read_insights` - Ler métricas e insights
- ✅ `business_management` - Gerenciar contas de negócio

## 🔐 Conectar no WebAds

### Frontend (React)

1. Vá para **Configurações** > **Integrações**
2. Clique em **"Conectar Meta Ads"**
3. Preencha com suas credenciais:
   - **App ID**: Cole o ID da sua app
   - **App Secret**: Cole o Secret (será armazenado localmente)
4. Clique em **"Conectar com Meta"**
5. Autorize o acesso à sua conta Meta
6. Selecione a **Conta de Anúncios** que deseja usar
7. Pronto! Suas campanhas aparecerão no dashboard

## 📊 O que é sincronizado

Depois de conectado, o WebAds importa automaticamente:

- **Campanhas**
  - Nome e status (ativa/pausada)
  - Objetivo da campanha
  - Data de criação

- **Métricas (últimos 30 dias)**
  - Impressões
  - Cliques
  - Gasto (em BRL)
  - Conversões
  - CTR e ROI (calculados)

## 🔄 Atualização de Dados

- Os dados são atualizados **a cada vez que você acessa a seção "Meta Ads"**
- Meta API fornece dados com até 3-6 horas de atraso

## ⚠️ Troubleshooting

### "Erro ao conectar - Falha na autenticação"
- Verifique se App ID e App Secret estão corretos
- Confirme que o Redirect URI foi adicionado nas configurações da app

### "Nenhuma conta de anúnciosencontrada"
- Verifique se sua conta Meta Business tem acesso a contas de anúncio
- Certifique-se de ter permissões de Admin

### "Campanhas aparecem com 0 métricas"
- Isso ocorre se as campanhas não tiverem dados nos últimos 30 dias
- Ative uma campanha para que comece a gerar dados

## 🔗 Links Úteis

- Meta Developers: https://developers.facebook.com
- Business Manager: https://business.facebook.com
- Marketing API Docs: https://developers.facebook.com/docs/marketing-api
- Gerenciar Contas: https://ads.facebook.com

## 💡 Dicas

1. Use uma conta de teste primeiro para experimentar
2. Mantenha seus secrets seguros e nunca compartilhe
3. Para produção, considere usar variáveis de ambiente seguras
4. Cada app pode ter múltiplas contas de anúncio associadas

---

**Dúvidas?** Verifique a documentação oficial da Meta API ou entre em contato com suporte.
