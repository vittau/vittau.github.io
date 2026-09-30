# DESIGN.md — `vitormach.dev`

Especificação viva do design atual do site. Reflete o que está implementado hoje; não é um changelog nem um plano de migração — isso vive no histórico do git.

---

## 1. Identidade do projeto

| | |
|---|---|
| **Produto** | Página pessoal de Vitor Machado (`vitormach.dev`) — currículo, portfólio e contato |
| **Estágio** | Em produção, publicado via GitHub Pages a partir do branch `master` |
| **Usuário primário** | Recrutadores, colegas de engenharia e contatos profissionais avaliando o histórico do Vitor |
| **Sensação de design** | Editorial e pessoal: papel e carvão quentes, um único acento coral, títulos em serifa, metadados em mono. A identidade vem do próprio Vitor — o doutorado em lógica (a marca ◇ e a epidemia SIR do hero, um easter egg sem legenda) e as fotos dele (galeria, panorâmica do Contact) — e não de um template. |
| **Restrição transversal** | Zero framework e zero dependência de terceiro em runtime além do GA4. Sem CDN, sem bundler, sem build step — cada asset é escrito à mão ou versionado no repo. |

---

## 2. Linguagem visual

### 2.1 Princípios

- **Seguir:** layout assimétrico (rótulo numa coluna estreita, frase na larga), ritmo variado entre seções, cartões sólidos com borda fina em vez de vidro, tipografia fazendo o trabalho que antes era de gradientes e brilhos.
- **Evitar:** os clichês de portfólio de dev — "Hello, I'm", balões de tecnologia orbitando o retrato, malha de pontos genérica, parede de logos, roxo com brilho. E qualquer coisa que reintroduza Bootstrap, jQuery, um framework CSS ou fonte/ícone servido por CDN externo.

### 2.2 Sistema de cor

Tokens semânticos, definidos como custom properties em `:root` e redefinidos sob `[data-theme="dark"]` (e `prefers-color-scheme: dark` quando não há preferência salva). Os valores vêm de `_config.yml` → `color:` — trocar a paleta é editar só esse arquivo.

| Token | Escuro | Claro | Uso |
|---|---|---|---|
| `--bg` | `#141316` | `#F4F0E8` | fundo da página (carvão quente / papel) |
| `--surface` | `#1D1B20` | `#FBF9F5` | cartões |
| `--surface-2` | branco a 5% | tinta a 5% | tags, fundo de citação, hover |
| `--line` / `--line-strong` | branco a 9% / 18% | tinta a 12% / 22% | bordas e divisores |
| `--text` | `#F2EEE8` | `#26231F` | corpo e títulos |
| `--text-muted` | `#A8A198` | `#5F5850` | texto secundário, meta |
| `--accent` | `#CC6868` | `#CC6868` | marca: decoração, nós, bordas, item ativo |
| `--accent-ink` | `#E08A7E` | `#A5492F` | **texto** e links na cor de destaque |
| `--accent-solid` | `#CC6868` | `#AD4F38` | **fundo** de botão de destaque |
| `--on-accent` | `#141316` | `#FFFFFF` | texto **sobre** `--accent-solid` |
| `--glass` | `--bg` a 66% | `--bg` a 72% | navbar depois de rolar |
| `--logo-bg` | `#F2EEE8` | `#FFFFFF` | cartão dos logos de empresa |

Não há cor secundária: o roxo e os gradientes do tema anterior saíram. O coral tem três variantes com papéis distintos (`--accent`, `--accent-ink`, `--accent-solid`) porque o coral puro não passa em AA como texto pequeno sobre papel nem como fundo de botão com texto branco. No tema claro a variante de texto é um terracota (`#A5492F`), puxado para o laranja de propósito — o vermelho puro escurecido (`#A94442`) é a cor de erro do Bootstrap e lia como mensagem de erro. **Não colapse as três em uma.** Pares medidos:

| Par | Razão |
|---|---|
| `--text` / `--bg`, claro · escuro | 13.76 · 16.02 |
| `--text-muted` / `--bg`, claro · escuro | 6.16 · 7.24 |
| `--text-muted` / tag, claro · escuro | 6.04 · 5.86 |
| `--accent-ink` / `--bg`, claro · escuro | 5.14 · 7.15 |
| `--accent-ink` / `--surface`, claro · escuro | 5.56 · 6.59 |
| branco / `--accent-solid`, claro | 5.31 |
| `--on-accent` / `--accent-solid`, escuro | 5.07 |
| meta do cartão Talks (`--bg` a 72%) / `--text`, claro · escuro | 7.81 · 6.92 |

Os campos `*-rgb` em `_config.yml` (mesmo valor em decimal) alimentam os `rgba()` do CSS — mantenha-os em sincronia com o hex ao lado ao trocar uma cor.

### 2.3 Tipografia

Três famílias auto-hospedadas em `fonts/` (SIL OFL), subsets latin + latin-ext em `woff2`, carregados sob demanda pelo `unicode-range`:

- **Newsreader** — títulos. Só duas instâncias estáticas no tamanho óptico 72: 500 romana e 400 itálica (~24 KB cada no subset latin; a variável com eixo `opsz` pesava 280 KB). `font-synthesis: none` nos títulos, para o navegador nunca inventar negrito.
- **Geist** — texto corrido, variável 300–700.
- **Geist Mono** — rótulos (`.kicker`), datas, tags, notas.

| Papel | Família | Tamanho | Peso | Line-height |
|---|---|---|---|---|
| `--fs-display` (nome no hero) | serifa | `clamp(3.5rem, 9vw, 7.5rem)` | 500 / itálico 400 | .9 |
| `--fs-h2` (frase de seção) | serifa | `clamp(2rem, 4.4vw, 3.5rem)` | 500 | 1.06 |
| `--fs-h3` (empresa, grau) | serifa | `clamp(1.375rem, 2vw, 1.625rem)` | 500 | 1.15 |
| `--fs-lead` | sans | `clamp(1.0625rem, 1.35vw, 1.1875rem)` | 400 | 1.6 |
| `--fs-body` | sans | `1rem` | 400 | 1.65 |
| `--fs-sm` | sans | `.875rem` | 400 | — |
| `--fs-xs` (`.kicker`, meta) | mono | `.75rem` | 500 | uppercase, .08em no kicker |

Corpos de texto longos (`.prose`) ficam limitados a ~62ch.

### 2.4 Espaçamento, raio, elevação, motion

```
Espaçamento (base 4px)
  --sp-1  4px   --sp-4  16px   --sp-7  48px   --sp-10 128px
  --sp-2  8px   --sp-5  24px   --sp-8  64px
  --sp-3  12px  --sp-6  32px   --sp-9  96px

Layout
  --container      1180px
  --gutter         32px  (20px abaixo de 768px)
  --section-pad-y  clamp(5rem, 11vw, 9rem)

Raio
  --r-sm 8px   --r-md 14px   --r-lg 20px   --r-xl 28px   --r-pill 999px

Elevação
  --shadow   uma sombra curta + uma longa e difusa; só no hover e na navbar rolada

Motion
  --ease      cubic-bezier(.4, 0, .2, 1)    transições de estado
  --ease-out  cubic-bezier(.16, 1, .3, 1)   entradas e reveals
  --dur-fast 150ms   --dur-base 250ms   --dur-slow 500ms
```

---

## 3. Padrões de componentes

| Componente | Especificação |
|---|---|
| **Marca** | Losango ◇ (`#i-diamond`, o operador modal "possivelmente") em coral + "vitor machado" em serifa. No hover gira 45° e vira □ ("necessariamente"). |
| **Favicon** | O ◇ da marca com um nó no centro (um nó da rede do hero), em coral `#E08A7E` sobre carvão `#141316`, num quadrado de cantos arredondados. O blog usa o mesmo desenho invertido: terracota `#AD4F38` sobre papel. Fonte em `favicon.svg` (32×32); `favicon.ico` com 16/32/48px, sendo o de 16 **desenhado à parte** (traço 1.75 num grid de 16, senão o losango embaça na aba); `favicon.png` 256px (também o `og:image`); `apple-touch-icon.png` 180px sem cantos arredondados (o iOS arredonda). Gerados do SVG no Chrome headless com fundo transparente. Não há `<link>` para o SVG de propósito: o navegador o preferiria ao .ico e usaria a versão sem ajuste em 16px. |
| **Navbar** | Pill flutuante, sticky a `--sp-4` do topo, transparente sobre o hero; ao rolar (`.is-scrolled`) ganha `--glass` com `backdrop-filter`, borda e `--shadow`. Abaixo de **900px** vira hambúrguer com painel de `min(82vw, 340px)` e links em serifa grande. |
| **Cabeçalho de seção** (`.shead`) | `.kicker` em mono ("01 — ABOUT") + uma **frase** em serifa como `h2`, não um rótulo genérico. `.shead--split` põe o rótulo numa coluna estreita e a frase na larga. |
| **Botões** (`.btn`) | `--primary` (`--accent-solid`, sombra coral) e `--ghost` (contorno `--line-strong`). Pill; hover eleva 2px e a seta anda 3px. |
| **Cartões** | `--surface` sólido, borda 1px `--line`, `--r-lg`. Sem vidro e sem sombra em repouso. Hover (onde há): eleva 4px, borda coral, `--shadow`. |
| **Bento do Stack** | Grade de 4 colunas: cartão de IA 2×2 (texto, sem logo — o Devicon não tem OpenAI/Claude) com um brilho coral percorrendo a borda (`conic-gradient` + `@property --angle`), 8 tiles com logo 44px, nome em serifa e nota em mono. Abaixo, "Also in the toolbox": chips com logo de 18px. |
| **Linha do tempo** (Experience) | Cabeçalho sticky à esquerda; à direita, trilho vertical com preenchimento coral ligado à rolagem e um nó por emprego que acende (`.is-lit`) quando o topo cruza o meio da tela. Cada item: anos em mono + cartão de logo, e o corpo. |
| **Logos de empresa** | PNGs recortados ao conteúdo, com fundo **transparente** (branco desfeito por *unmultiply*, preservando as cores), num cartão `--logo-bg`. Tamanho equilibrado: `width = 58px × √(logo-ratio) × logo-scale`, com `logo-ratio` (largura/altura) e `logo-scale` (compensação de densidade de tinta) no front matter de cada post. |
| **Academic** | Grade de 6 colunas: doutorado 4 col. com a citação do artigo, cartão **invertido** Talks & slides 2 col. (fundo `--text`, links para `ppal/`), mestrado e graduação 3 col. cada. |
| **Galeria** | Cinco fotos em faixa desencontrada (larguras e alturas diferentes, offsets verticais). No mobile vira trilho horizontal com `scroll-snap`. Hover dessatura as vizinhas. |
| **Contact** | Panorâmica do Rio em sangria, com máscara que a dissolve no fundo em cima e embaixo; `h2` "Let's talk." sobreposto à borda inferior. Ação principal: LinkedIn. **Sem e-mail, de propósito.** Redes de foto (`photo: true` no `_config.yml`) ficam num grupo "Elsewhere". |
| **Ícones** | Inline via `<use href="#i-…">` / `#tech-…`, `fill="currentColor"` por padrão. |

**Foco:** todo elemento interativo mantém `:focus-visible` com `outline: 2px solid var(--accent); outline-offset: 3px`. `outline: none` sem substituto equivalente é proibido.

---

## 4. Princípios de interação

1. **Uma cor de destaque.** Coral carrega marca, CTAs, estados ativos e a animação. Tudo mais é neutro quente. As únicas cores fora da paleta são as dos logos e das fotos — é conteúdo, não interface.
2. **Movimento com significado, e opcional.** A rede do hero roda um modelo SIR (o artigo do doutorado discute uma variação do SIR) — um easter egg, de propósito sem legenda na página; o trilho da linha do tempo mede o quanto já foi lido. Sob `prefers-reduced-motion: reduce`, durações e atrasos vão a zero, a rede desenha um quadro estático com uma epidemia já em andamento, reveals e cortinas nascem abertos, e as animações ligadas à rolagem não são aplicadas.
3. **Entrar com calma, sair só com fade.** Entradas usam `--ease-out` longo (0.9–1.3s) e atraso escalonado (`--d` no hero, `--i` nos reveals). Nada some com `scale()` — o encolhimento chama mais atenção que o fade.
4. **Animação ligada à rolagem é aprimoramento progressivo.** Parallax das fotos e preenchimento do trilho usam `animation-timeline: view()` dentro de `@supports`; sem suporte, as fotos ficam paradas e o trilho fica só cinza. Usam as propriedades individuais `translate`/`scale`, para não brigar com os `transform` de hover e reveal.
5. **Navbar colapsa por conteúdo, não por dispositivo.** 900px é o ponto em que marca + 6 links + 2 ícones sociais + toggle de tema deixam de caber com folga. Se a navbar ganhar um item, meça de novo.
6. **Conteúdo antes de efeito.** Sem JS: tema segue `prefers-color-scheme` (e o botão some), menu mobile vira lista visível, navbar fica sempre com vidro, reveals e cortinas nascem abertos, a rede não é desenhada. A entrada do hero é só CSS e roda igual.

**JS** (`js/main.js`, sem dependências): tema (script bloqueante no `<head>` evita flash), menu mobile, scrollspy, sombra da navbar, reveal on scroll, nós da linha do tempo e a rede do hero (modelo SIR num grafo de vizinhos mais próximos: a cada passo, cada infectado contagia cada vizinho suscetível com probabilidade `BETA` e se recupera com probabilidade `GAMMA`; o paciente zero nunca nasce atrás do retrato; pausa fora da viewport ou com a aba oculta; refaz o grafo só quando a **largura** muda, para a barra de endereço do mobile não reiniciar a epidemia a cada rolagem). Suscetível é `at === null`, nunca `at < 0`: o paciente zero nasce com `at` no passado para já aparecer aceso, e logo após o carregamento esse instante é negativo.

---

## 5. Estado atual da build

### Seções implementadas

- [x] Navbar (desktop + mobile)
- [x] Hero (nome em serifa, retrato com moldura deslocada, epidemia SIR em canvas)
- [x] About (frase + texto + números + galeria de fotos)
- [x] Stack (bento com IA em destaque, 8 tecnologias principais, 11 secundárias)
- [x] Experience (linha do tempo a partir de `_posts/`)
- [x] Academic (bento com artigo e apresentações)
- [x] Contact (panorâmica, LinkedIn, GitHub, redes de foto)
- [x] Footer
- [x] Dark/light mode com persistência

### Débito de design conhecido

- **CV para download.** Não existe um PDF publicado.
- **Navegação por teclado e leitor de tela.** A marcação está correta (`role="switch"`, `aria-expanded`, `aria-controls`, `:focus-visible` em tudo, skip link), mas não foi percorrida à mão com um leitor de tela real.
- **Build oficial do Jekyll não roda localmente** (Ruby do sistema é 2.6, Jekyll exige 3.0+). Validação visual local depende de um renderizador Liquid mínimo (ver `CLAUDE.md`); a primeira publicação de qualquer mudança grande merece uma conferida no domínio real.
- **Legendas das fotos da galeria.** Só a panorâmica do Contact tem legenda com lugar; as da galeria têm só `alt` descritivo.

---

## 6. Regras para edição assistida por IA

Ao gerar ou editar HTML/CSS deste site:

- **Use os tokens, nunca hex direto.** Cor nova é um token novo em `_config.yml` (+ seu par `-rgb`, se for usada em `rgba()`), não um valor hardcoded no CSS. As exceções são deliberadas e comentadas: o `rgba` da legenda sobre foto e a tinta dos `--surface-2`/`--line`.
- **Sem CDN, sem novo arquivo externo para ícone/fonte/logo.** Fonte nova: baixe do Google Fonts (a CSS API entrega `woff2` por subset), guarde latin + latin-ext em `fonts/`, prefira instâncias estáticas a variáveis com eixos que não usa. Sprites de ícone ficam inline no HTML (`<symbol>` + `<use>`) — um `.svg` externo referenciado por `<use href="arquivo.svg#id">` é resolvido de forma assíncrona pelo Chrome e falha intermitentemente.
- **O `<svg>` de um sprite com gradientes usa `.sprite` (`position:absolute; width:0; height:0; overflow:hidden`), nunca `display:none`.** Fora da render tree, símbolos com gradiente pintam vazio mesmo com os `<defs>` corretos.
- **Gradientes de um sprite ficam num `<defs>` único logo após a tag `<svg>` real**, nunca dentro de comentários ou espalhados pelos `<symbol>`. Ao remover um símbolo, remova os gradientes que só ele referenciava e confira que nenhum `url(#…)` ficou pendurado.
- **Classifique arte monocromática por croma, não por luminância** — vermelhos e azuis saturados têm luminância tão baixa quanto preto.
- **Não arredonde coordenadas de `path` em SVG com regex.** Flags de arco vêm colados aos números (ex. `0 0064.205`).
- **YAML de fluxo (`{ … }`) com vírgula no valor precisa de aspas.** `note: APIs, workers` dentro de chaves vira `note: APIs` e uma chave solta `workers`.
- **Um alvo de `IntersectionObserver` nunca pode estar recortado a zero** (`clip-path: inset(100% …)`): o observer não o vê e o reveal não dispara. Cortinas e máscaras de entrada vão num pseudo-elemento por cima.
- **Fotos:** originais do Unsplash do Vitor, convertidas para WebP no Chrome headless (desenhar num `<canvas>` reduzindo à metade por passo com `imageSmoothingQuality = 'high'`, depois `toDataURL('image/webp', 0.8)`), em duas larguras (`-640`/`-1200`, ou `-1280`/`-2400` na panorâmica) servidas por `srcset`. Não há encoder WebP na máquina (`sips`, ImageIO, `cwebp` e ImageMagick não servem).
- **Logo de empresa novo:** recorte ao conteúdo, desfaça o fundo branco em transparência (alpha = maior distância ao branco entre os canais; cor = (c − 255·(1−α)) / α) e preencha `logo-ratio` e `logo-scale` no post. `logo-scale` ≈ (0.26 / densidade de tinta)^0.3, onde densidade é a fração de pixels não brancos no recorte.
- **Todo elemento interativo novo precisa de `:focus-visible` visível** e, se for um controle não nativo, dos atributos ARIA correspondentes.
- **Todo texto novo em `--text-muted` ou `--accent-ink` precisa passar em AA** nos dois temas, inclusive sobre `--surface` e `--surface-2`.
- **Componentes com estado vazio/alternativo precisam de fallback explícito:** emprego sem `thumbnail` some o cartão de logo; sem `stack:` some a linha de tags; sem `link:` some o "Visit"; tile sem `note` some a nota.
- **Não publique o e-mail do Vitor** em lugar nenhum do site, mesmo com `site.email` no `_config.yml`.
- **Teste em pelo menos 320, 375, 768, 900, 1024 e 1440px, nos dois temas**, e uma vez com `prefers-reduced-motion: reduce` e com JS desligado.
