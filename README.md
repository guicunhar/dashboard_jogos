# ⚽ Football Broadcast Dashboard

Mini-app React para transmissões esportivas ao vivo, com overlay para OBS Studio.

---

## 🚀 Instalação e Execução

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9+

### 2. Instalar dependências

```bash
cd football-broadcast
npm install
```

### 3. Rodar em modo desenvolvimento

```bash
npm run dev
```

O app ficará disponível em `http://localhost:5173`

---

## 🖥️ Rotas

| Rota | Descrição |
|------|-----------|
| `http://localhost:5173/control` | **Painel do Operador** — use para controlar a partida |
| `http://localhost:5173/dashboard` | **Dashboard / Overlay** — capture com o OBS |

---

## 📺 Integração com OBS Studio

### Adicionar o overlay no OBS

1. Abra o **OBS Studio**
2. Na seção **Fontes**, clique no botão **+**
3. Selecione **"Navegador"** (Browser Source)
4. Configure:
   - **URL:** `http://localhost:5173/dashboard`
   - **Largura:** `1920`
   - **Altura:** `1080`
   - ✅ Marque **"Controlar áudio via OBS"** (opcional)
   - ✅ Marque **"Atualizar navegador quando a cena ficar ativa"**
5. Clique em **OK**

### Tornar o fundo transparente (chroma / sobreposição)

Para usar como overlay sobre o vídeo, adicione CSS personalizado na fonte do navegador:

```css
body { background: transparent !important; }
```

Ou, para remover completamente o fundo escuro e mostrar apenas os elementos sobre o vídeo, você pode ajustar `--primary` no `global.css`:

```css
:root {
  --primary: transparent;
}
```

---

## 🎮 Como usar o Painel de Controle

### Cronômetro
- **Iniciar / Pausar** o relógio de jogo
- **Reset** zera do zero
- Campo **"Min"** + botão **Definir**: pula direto para um minuto específico (ex: 45 para o segundo tempo)

### Placar
- Botões **+ Gol** e **- Rem** para cada time
- **Zerar Placar** reseta ambos os scores

### Registrar Eventos
- **⚽ Gol:** selecione o time, informe o jogador, clique em "Gol!" → aparece animação flash e evento no feed
- **🟨🟥 Cartão:** selecione time + jogador → badge aparece automaticamente na escalação
- **🔄 Substituição:** informe quem sai e quem entra
- **Evento livre:** qualquer texto, ex: "Revisão VAR", "Intervalo", "Pênalti"

### Configuração dos Times
- Altere nomes, cores e competição em tempo real
- Clique **"✓ Aplicar Configurações"** para refletir no dashboard

---

## 📁 Estrutura do Projeto

```
football-broadcast/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                    # Entry point + Router
    ├── styles/
    │   └── global.css              # CSS variables globais
    ├── store/
    │   └── matchStore.js           # Zustand — estado global da partida
    ├── pages/
    │   ├── Dashboard.jsx           # Overlay para o OBS
    │   ├── Dashboard.module.css
    │   ├── ControlPanel.jsx        # Interface do operador
    │   └── ControlPanel.module.css
    └── components/
        ├── dashboard/
        │   ├── ScoreBoard.jsx      # Placar + tempo
        │   ├── LineupPanel.jsx     # Escalação de cada time
        │   ├── EventFeed.jsx       # Feed de eventos central
        │   ├── BottomBar.jsx       # Barra inferior (competição / ao vivo)
        │   └── FlashOverlay.jsx    # Animação flash (gol, cartão)
        └── control/
            ├── TimerControl.jsx    # Controle do cronômetro
            ├── ScoreControl.jsx    # Controle do placar
            ├── EventLogger.jsx     # Registro de eventos
            ├── TeamConfig.jsx      # Configuração dos times
            ├── StatsPanel.jsx      # Estatísticas da partida
            └── ControlSection.module.css  # CSS compartilhado
```

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **React 18** | Interface |
| **Vite 5** | Build tool / dev server |
| **Zustand** | Estado global compartilhado entre painel e dashboard |
| **Framer Motion** | Animações (flash, entrada de eventos) |
| **React Router DOM** | Roteamento `/dashboard` e `/control` |
| **CSS Modules** | Estilização isolada por componente |

---

## ✨ Personalizações

### Alterar fontes
Em `index.html`, troque o link do Google Fonts e atualize `--font-heading` / `--font-body` no `global.css`.

### Alterar cores base
Edite as variáveis em `src/styles/global.css`:
```css
:root {
  --primary: #0a0e1a;   /* fundo principal */
  --accent:  #f59e0b;   /* cor de destaque (dourado) */
  --accent2: #3b82f6;   /* cor secundária (azul) */
}
```

### Adicionar novos tipos de evento
Em `EventLogger.jsx`, basta chamar `addEvent({ id, min, icon, name, sub, team, borderColor })`.

---

## 📦 Build para produção

```bash
npm run build
```

Os arquivos ficam em `/dist`. O `dist/index.html` pode ser aberto diretamente pelo OBS sem precisar do servidor Vite.
