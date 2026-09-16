# DESIGN.md — `vitormach.dev`

Especificação viva do design atual do site. Reflete o que está implementado hoje; não é um changelog nem um plano de migração — isso vive no histórico do git.

**Referência visual:** [Personal Portfolio Page — Giselle Santos, Behance](https://www.behance.net/gallery/193147621/Personal-Portfolio-Page-Web-Design)

---

## 1. Identidade do projeto

| | |
|---|---|
| **Produto** | Página pessoal de Vitor Machado (`vitormach.dev`) — currículo, portfólio e contato |
| **Estágio** | Em produção, publicado via GitHub Pages a partir do branch `master` |
| **Usuário primário** | Recrutadores, colegas de engenharia e contatos profissionais avaliando o histórico do Vitor |
| **Sensação de design** | Editorial e confiante: gradiente escuro/roxo, um único acento coral, tipografia geométrica, cards translúcidos. Denso em conteúdo, leve em peso de página. |
| **Restrição transversal** | Zero framework e zero dependência de terceiro em runtime além do GA4. Sem CDN, sem bundler, sem build step — cada asset é escrito à mão ou versionado no repo. |

---

## 2. Linguagem visual

### 2.1 Inspiração

- **Seguir:** o template do Behance acima — hero em gradiente com malha de pontos, navbar flutuante em pill, superfícies translúcidas, dark/light mode.
- **Evitar:** qualquer coisa que reintroduza Bootstrap, jQuery, um framework CSS ou uma fonte/ícone servido por CDN externo.

### 2.2 Sistema de cor

Tokens semânticos, definidos como custom properties em `:root` e redefinidos sob `[data-theme="dark"]` (e `prefers-color-scheme: dark` quando não há preferência salva). Os valores de marca vêm de `_config.yml` → `color:` — trocar a paleta é editar só esse arquivo.

| Token | Escuro | Claro | Uso |
|---|---|---|---|
| `--bg` | `#1B1B2B` | `#E7E9F3` | fundo da página |
| `--bg-grad` | `#232437 → #563C4D` | `#CBCEF1 → #EDCFD8` | gradiente do hero e do contato |
| `--surface` | `rgba(255,255,255,.04)` | `rgba(255,255,255,.55)` | cards, navbar, chips |
| `--surface-border` | `rgba(255,255,255,.10)` | `rgba(61,61,61,.10)` | borda de 1px das superfícies |
| `--text` | `#FFFFFF` | `#3D3D3D` | corpo e títulos |
| `--text-muted` | `#BABABA` | `#5A5A66` | texto secundário, meta |
| `--accent` | `#CC6868` | `#CC6868` | marca: bordas, ícones, barra do nav ativo, decoração |
| `--accent-ink` | `#D98080` | `#A94442` | **texto** e links na cor de destaque |
| `--accent-solid` | `#CC6868` | `#B5514F` | **fundo** de botão de destaque |
| `--on-accent` | `#1B1B2B` | `#FFFFFF` | texto **sobre** `--accent-solid` |
| `--accent-2` | `#7C4B83` | `#7C4B83` | botão secundário, glow do avatar |

O coral tem três variantes com papéis distintos (`--accent`, `--accent-ink`, `--accent-solid`) porque o coral puro não passa em WCAG AA como texto pequeno sobre fundo claro nem como fundo de botão com texto branco. **Não colapse as três em uma** — todos os 15 pares abaixo foram medidos no DOM renderizado, nos dois temas, e passam em AA:

| Par | Razão | Contexto |
|---|---|---|
| `#CC6868` sobre `#1B1B2B` | 4.64:1 | acento sobre fundo escuro |
| `#A94442` sobre `#E7E9F3` | 4.83:1 | `--accent-ink` claro, corpo de texto |
| `#D98080` sobre superfície translúcida escura | 5.29:1 | `--accent-ink` escuro, corpo de texto |
| `#FFFFFF` sobre `#B5514F` | 4.94:1 | texto sobre botão primário, claro |
| `#1B1B2B` sobre `#CC6868` | 4.64:1 | texto sobre botão primário, escuro (`--on-accent`) |
| `#FFFFFF` sobre `#7C4B83` | 6.58:1 | texto sobre botão secundário/`--accent-2` |
| `#BABABA` sobre `#1B1B2B` | 8.74:1 | `--text-muted` escuro |
| `#3D3D3D` sobre `#E7E9F3` | 8.97:1 | `--text` claro |
| `#5A5A66` sobre `#E7E9F3` | 5.5:1 | `--text-muted` claro |

Os campos `*-rgb` em `_config.yml` (mesmo valor em decimal) alimentam os `rgba()` do CSS — mantenha-os em sincronia com o hex ao lado ao trocar uma cor.

### 2.3 Tipografia

Família única: **Poppins**, auto-hospedada em `fonts/` — pesos 400/600/700, subset latin + latin-ext, `woff2`. Fallback: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

| Papel | Tamanho | Peso | Line-height |
|---|---|---|---|
| `--fs-display` (nome no hero) | `clamp(2.5rem, 7vw, 4.75rem)` | 700 | 1.05 |
| `--fs-h2` (título de seção) | `clamp(1.75rem, 3.5vw, 2.5rem)` | 600 | 1.2 |
| `--fs-h3` (título de card) | `1.125rem` | 600 | 1.3 |
| `--fs-body` | `1rem` | 400 | 1.7 |
| `--fs-lead` (subtítulo do hero) | `1.0625rem` | 400 | 1.65 |
| `--fs-sm` (meta, footer) | `0.875rem` | 400 | 1.6 |
| `--fs-eyebrow` (tags, "Hello, I'm") | `0.75rem` | 600 | 1.4, 0.08em, uppercase |

Corpos de texto longos (`.prose`, `.about__stats`) ficam limitados a `65ch` — qualquer elemento irmão no mesmo bloco de texto (chips, listas) deve respeitar a mesma largura máxima, ou o layout fica desalinhado.

### 2.4 Espaçamento, raio, elevação, motion

```
Espaçamento (base 4px)
  --sp-1  4px   --sp-4  16px   --sp-7  48px   --sp-10 128px
  --sp-2  8px   --sp-5  24px   --sp-8  64px
  --sp-3  12px  --sp-6  32px   --sp-9  96px

Layout
  --container      1140px
  --gutter         24px  (16px abaixo de 768px)
  --section-pad-y  clamp(4rem, 10vw, 7.5rem)

Raio
  --r-sm 8px   --r-md 12px   --r-lg 20px   --r-xl 28px   --r-pill 999px

Elevação
  --shadow-card   dark: 0 8px 32px rgba(0,0,0,.35)
                  light: 0 8px 28px rgba(61,61,61,.10)
  --glow-accent   0 0 60px rgba(var(--brand-coral-rgb), .35)

Motion
  --ease      cubic-bezier(.4, 0, .2, 1)
  --dur-fast  150ms   --dur-base 250ms   --dur-slow 500ms
```

---

## 3. Padrões de componentes

| Componente | Especificação |
|---|---|
| **Navbar** | Pill flutuante (`--r-pill`), `background: var(--surface)`, `backdrop-filter: blur(16px)`, sticky a `--sp-4` do topo. Ganha `--shadow-card` ao rolar (`.is-scrolled`). Abaixo de **900px** (não 768px — ver §4) vira hambúrguer com painel deslizante de `min(80vw, 320px)`. |
| **Botões** (`.btn`) | `--primary` (coral sólido `--accent-solid`, texto `--on-accent`), `--secondary` (contorno `--surface-border`, transparente). Pill, hover eleva 2px, `:focus-visible` com anel coral de 2px e offset. |
| **Cards** | `--surface`, `--r-lg`, borda 1px `--surface-border`, `--shadow-card`. Hover eleva 4–6px e a borda vira `--accent`. Variantes: work (thumbnail `object-fit: contain` sobre branco, ou fallback tipográfico sem thumbnail), timeline (nó circular de 44px com a sigla do grau), stat (pill simples). |
| **Tech tiles** | 72×72 (64×64 em mobile), `--surface`, `--r-md`, logo SVG 40×40 centralizado, nome abaixo em `--fs-eyebrow`. Grid de 6 colunas fixas no desktop, 4 em tablet. |
| **Chips flutuantes do hero** | Superfície translúcida, `--r-pill`, `--fs-eyebrow`, animação `float` de 6s (±8px em Y). Seis posições fixas ao redor do retrato; três visíveis por vez. |
| **Ícones** | Todos inline via `<use href="#i-...">` / `#tech-...">`, `fill="currentColor"` por padrão — quem não declara cor própria herda `--text`. |

**Foco:** todo elemento interativo mantém `:focus-visible` com `outline: 2px solid var(--accent); outline-offset: 3px`. `outline: none` sem substituto equivalente é proibido.

---

## 4. Princípios de interação

1. **Uma cor de destaque.** Coral carrega marca, CTAs e estados ativos. Roxo (`--accent-2`) é secundário, usado com parcimônia. Tudo mais é neutro.
2. **Movimento discreto e opcional.** Toda animação é ornamental. Sob `prefers-reduced-motion: reduce`, durações vão a `0.01ms`, o canvas da malha de pontos desenha um quadro estático, os reveals nascem visíveis e os balões param.
3. **Fade puro na saída, sem escala.** Elementos que somem (balões do hero) só perdem opacidade — combinar fade com `scale()` faz o encolhimento ficar mais perceptível que o fade e a transição parece abrupta.
4. **Navbar colapsa por conteúdo, não por dispositivo.** O breakpoint em que a navbar vira hambúrguer (900px) é o ponto em que a barra completa (marca + 7 links + 2 ícones sociais + toggle de tema) para de caber, com margem — não um breakpoint de dispositivo "genérico". Se a navbar ganhar mais um item, meça de novo antes de reusar 900px.
5. **Conteúdo antes de efeito.** A página é legível e navegável com JS desligado: tema segue `prefers-color-scheme`, menu mobile vira lista sempre visível, reveals já nascem visíveis, canvas ausente (o gradiente continua).

**JS** (`js/main.js`, sem dependências): tema (script bloqueante no `<head>` evita flash), menu mobile, scrollspy via `IntersectionObserver`, sombra da navbar ao rolar, reveal on scroll, malha de pontos em canvas (pausa fora da viewport ou com a aba oculta), rotação dos balões do hero.

---

## 5. Estado atual da build

### Seções implementadas

- [x] Navbar (desktop + mobile)
- [x] Hero (gradiente, malha de pontos, retrato com balões rotativos)
- [x] About (foto + texto + stat chips)
- [x] Technologies (grid de logos, 3 grupos)
- [x] Works (cards a partir de `_posts/`)
- [x] Academic (timeline)
- [x] Contact (lista de links, sem formulário)
- [x] Footer
- [x] Dark/light mode com persistência

### Débito de design conhecido

- **CV para download.** Não existe um PDF publicado em `assets/`; o botão "Download CV" do template de referência não foi implementado.
- **Navegação por teclado e leitor de tela.** A marcação está correta (`role="switch"`, `aria-expanded`, `aria-controls`, `:focus-visible` em tudo, skip link), mas não foi percorrida à mão com um leitor de tela real.
- **Build oficial do Jekyll não roda localmente** (Ruby do sistema é 2.6, Jekyll exige 3.0+). Validação visual local depende do renderizador Liquid mínimo descrito no `CLAUDE.md`; a primeira publicação de qualquer mudança grande merece uma conferida no domínio real.

---

## 6. Regras para edição assistida por IA

Ao gerar ou editar HTML/CSS deste site:

- **Use os tokens, nunca hex direto.** Cor nova é um token novo em `_config.yml` (+ seu par `-rgb`), não um valor hardcoded no CSS.
- **Sem CDN, sem novo arquivo externo para ícone/fonte/logo.** Sprites de ícone ficam inline no HTML (`<symbol>` + `<use>`) — um arquivo `.svg` externo referenciado por `<use href="arquivo.svg#id">` é resolvido de forma assíncrona pelo Chrome e falha intermitentemente.
- **O `<svg>` de um sprite usa `.sprite` (`position:absolute; width:0; height:0; overflow:hidden`), nunca `display:none`.** Fora da render tree, símbolos com gradiente pintam vazio mesmo com os `<defs>` corretos.
- **Gradientes de um sprite ficam num `<defs>` único logo após a tag `<svg>` real**, nunca dentro de comentários ou espalhados pelos `<symbol>`.
- **Classifique arte monocromática por croma, não por luminância** — vermelhos e azuis saturados têm luminância tão baixa quanto preto e seriam descoloridos por engano.
- **Não arredonde coordenadas de `path` em SVG com regex.** Flags de arco vêm colados aos números (ex. `0 0064.205`); uma regex de limpeza ingênua come os flags junto e corrompe o path.
- **Todo elemento interativo novo precisa de `:focus-visible` visível** e, se for um controle não nativo (toggle, menu), dos atributos ARIA correspondentes.
- **Todo texto novo em `--text-muted` sobre `--surface` precisa passar em AA** nos dois temas antes de virar padrão — quando não passar, é o padrão semântico do token que está errado, não uma exceção pontual.
- **Componentes com estado vazio/alternativo precisam de fallback explícito**, não de um elemento quebrado: card de trabalho sem thumbnail cai num nome tipográfico; item sem `stack:` some a linha de tags; item sem `url:` some o botão "Visit".
- **Teste em pelo menos 320, 375, 768, 900 e 1440px** antes de considerar uma mudança de layout pronta — a maioria dos bugs de responsividade deste site apareceu numa faixa estreita perto de um breakpoint, não nos extremos.
