# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral

Página pessoal de Vitor Machado (`www.vitormach.dev`), servida pelo GitHub Pages a partir do branch `master` (build automático do Jekyll; não há `_site` versionado nem workflow em `.github/`). Não há Gemfile, testes, lint ou etapa de build local — qualquer push para `master` publica o site.

O layout atual é um redesenho de 2026 baseado num template do Behance. A especificação viva do design — tokens, componentes, princípios de interação e regras para edição assistida por IA — está em **`DESIGN.md`**. Leia antes de mexer no visual.

## Comandos

Não há toolchain instalado localmente e **não dá para rodar o Jekyll nesta máquina**: o Ruby do sistema é 2.6 e o Jekyll exige 3.0+. Para pré-visualizar, duas rotas:

```sh
# 1. Instalar um Ruby moderno e o Jekyll (rota oficial)
gem install jekyll && jekyll serve      # http://localhost:4000

# 2. Renderizador Liquid mínimo (rota usada no redesenho)
# Carrega _config.yml, _data/ e o front matter de _posts/, resolve os includes
# e cospe um index.html. Suficiente para conferir layout; não é o Jekyll.
gem install liquid -v 5.3.0 --user-install
```

Validação visual sem navegador interativo: o Chrome headless já instalado serve.
Atenção: **`timeout` não existe no macOS**; use `perl -e 'alarm shift; exec @ARGV' 45 <cmd>`.
O Chrome no macOS tem largura mínima de janela de ~500px — para testar 320/375px, carregue a página num `<iframe>` dessa largura.

## Arquitetura

**Single-page.** `index.html` é só front matter apontando para `_layouts/default.html`, que monta a página concatenando includes nesta ordem: `head` → `icons` → `tech-sprite` → `nav` → `hero` → `about` → `knowledge` (Technologies) → `experience` (Works) → `academic` → `contact` → `footer` → `js`. Toda a edição de conteúdo acontece em `_includes/*.html`, `_posts/` e `_data/`; `index.html` praticamente nunca muda.

**Sem frameworks, sem build.** Não há Bootstrap, jQuery, Sass nem bundler. CSS escrito à mão com custom properties, JS puro. A única dependência de terceiro em runtime é o GA4. Fontes, ícones e logos são servidos do próprio domínio. **Não reintroduza CDNs** — é uma decisão explícita (`DESIGN.md` §1, §6).

**CSS é gerado por Liquid, não é estático.** `_includes/css/main.css` contém tags Liquid (`#{{ site.color.primary }}`) e por isso vive em `_includes/`, sendo injetado inline dentro de um `<style>` no fim de `_includes/head.html`. Consequências:

- As cores do site vêm de `_config.yml` → `color:` (hex sem `#`). Trocar a paleta é editar só o `_config.yml`.
- Os campos `*-rgb` são o mesmo valor em decimal, usados nos `rgba()`. **Mantenha-os em sincronia com o hex ao lado** — o filtro `hex_to_rgb` foi removido justamente porque plugins customizados não rodam no GitHub Pages.
- Há três variantes de coral com papéis distintos (`--accent` decorativo, `--accent-ink` para texto, `--accent-solid` para fundo de botão) porque o coral puro não passa em WCAG AA em alguns contextos. A tabela de contraste está em `DESIGN.md` §2.2. Não colapse as três em uma.
- `style.css` + `_layouts/style.css` são a rota alternativa (folha externa com o mesmo include). O `<link>` para ela em `head.html` está **comentado** — o inline é o caminho ativo. Se reativar um, desative o outro.

**`baseurl` é `""`, não `"/"`.** Com `"/"`, `| prepend: site.baseurl` produz `//img/...`, que o navegador lê como URL protocolo-relativa e tenta buscar em `https://img/...`. Use sempre `| relative_url` e `| absolute_url`, nunca `| prepend: site.baseurl`.

**Experiência profissional vem de `_posts/`.** Cada arquivo é um emprego, sem corpo — só front matter. `_includes/experience.html` itera `site.posts` gerando os cards (não há mais modais). Campos: `title`, `thumbnail` (resolvido contra `img/portfolio/`; **se ausente, o card cai num fallback tipográfico** — hoje as seis empresas têm logo), `alt`, `description`, `client`, `project-start-date`, `project-end-date`, `category` (o cargo), `highlights` (lista de projetos, um por linha) e `stack` e `url` (opcionais). A ordem dos cards é a de `site.posts` (mais recente primeiro, pelo campo `date`).

Como os posts declaram `layout: default`, cada um gera uma cópia inteira da home numa URL própria (`permalink: pretty`). É um efeito colateral inofensivo herdado do tema, não uma página de post real.

**Tecnologias vêm de `_data/tech.yml`**, em três grupos (32 itens). Cada item aponta por `id` para um `<symbol id="tech-…">` em `_includes/tech-sprite.html`. `mono: true` marca a arte preto-e-branco (hoje Next.js, Express e Inkscape), que herda a cor do texto via `currentColor` — sem isso ela sumiria em um dos temas.

**Ícones.** Dois sprites, ambos inline no HTML:
- `_includes/icons.html` — UI e redes sociais, monocromáticos com `currentColor`.
- `_includes/tech-sprite.html` — logos de tecnologia, referenciados por `<use href="#tech-x">`.

**Não volte a extrair o sprite de tecnologias para um arquivo `.svg` externo.** Com `<use href="arquivo.svg#id">` o Chrome resolve o documento externo de forma assíncrona e falha de verdade: medi 32 de 32 ícones vazios em 1 de cada 5 recargas. Inline resolve, e o total transferido é o mesmo, com uma requisição a menos.

Duas regras do sprite inline que parecem inofensivas de mexer e não são:
- **O `<svg>` do sprite usa `.sprite` (`position:absolute; width:0; height:0`), nunca `display:none`.** Fora da render tree, o Chrome não resolve *paint servers*: os símbolos com gradiente (Node, Angular, Python, Azure, Jira, GIMP) pintam vazio. Fills sólidos continuam funcionando, o que esconde o estrago.
- **Os 26 gradientes ficam num `<defs>` único logo depois da tag `<svg>`**, e não espalhados dentro dos `<symbol>`.

Ao regerar o sprite a partir do [Devicon](https://github.com/devicons/devicon) (MIT), outras armadilhas já documentadas em `DESIGN.md` §6: não arredonde coordenadas de `path` (os flags de arco vêm colados aos números e uma regex de limpeza os come); **classifique a arte por croma, não por luminância** (vermelho e azul saturados são tão escuros quanto preto); e confira cada logo **nos dois temas** — Inkscape usa a variante `plain` e AWS a `plain-wordmark` porque as `original` desaparecem no fundo escuro.

Se for editar o include por script, **não ancore no primeiro `<svg` do arquivo**: o comentário de cabeçalho contém um exemplo de uso, e já inseri um `<defs>` inteiro dentro do comentário por causa disso.

**JS.** `js/main.js`, ~250 linhas, sem dependências: tema (com script bloqueante no `<head>` para não piscar), menu mobile, scrollspy, reveal on scroll, a malha de pontos em canvas do hero e a rotação dos balões do retrato. Tudo degrada sem JS e desliga sob `prefers-reduced-motion`.

**Imagens.** `img/photo.webp` no hero (paisagem, recortada em círculo) e `img/photo-about.webp` no About (retrato 3:4). Sem encoder WebP na máquina (`sips`, ImageIO, `cwebp` e ImageMagick não servem): a conversão foi feita com o Chrome headless, desenhando o PNG num `<canvas>` e lendo `toDataURL('image/webp', 0.82)`.

**Fontes.** Poppins auto-hospedada em `fonts/` — 3 pesos × 2 subsets (latin e latin-ext), `woff2`. O `unicode-range` faz o navegador baixar só o subset que a página usa.

**Conteúdo estático fora do Jekyll.** `ppal/` contém quatro apresentações reveal.js autocontidas (`masters`, `qualif`, `socnet`, `socnet-diffusion`) — HTML/CSS/JS próprios, copiados as-is pelo Jekyll. Não compartilham nada com o tema do site; edite-as isoladamente.

**Outras seções do domínio não estão neste repo.** `/blog`, `/darkenizer` etc. (listados em `sitemap.txt`) são outros repositórios servidos sob o mesmo domínio via `CNAME`.

**Analytics.** GA4 (`G-NSNV8ZR1NV`) inline em `_includes/js.html`.
