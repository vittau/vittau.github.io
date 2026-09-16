# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral

Página pessoal de Vitor Machado (`www.vitormach.dev`), servida pelo GitHub Pages a partir do branch `master` (build automático do Jekyll; não há `_site` versionado nem workflow em `.github/`). Não há Gemfile, testes, lint ou etapa de build local — qualquer push para `master` publica o site.

## Comandos

Não há toolchain instalado localmente (`jekyll` não está no PATH; o Ruby do sistema é 2.6). Para pré-visualizar localmente é preciso instalar o Jekyll primeiro:

```sh
gem install jekyll          # ou: bundle init && bundle add jekyll
jekyll serve                # http://localhost:4000
```

Atenção: `_config.yml` define `baseurl: "/"`, então caminhos com `| prepend: site.baseurl` viram `//js/...` em alguns servidores locais. Em caso de dúvida, valide o resultado direto em `https://www.vitormach.dev` após o push.

## Arquitetura

**Single-page.** `index.html` é só front matter apontando para `_layouts/default.html`, que monta a página inteira concatenando includes nesta ordem: `head` → `header` (navbar + hero) → `knowledge` → `experience` → `academic` → `footer` → `modals` → `js`. Toda a edição de conteúdo acontece em `_includes/*.html`; `index.html` praticamente nunca muda.

**Tema.** Baseado no Agency (Start Bootstrap / y7kim's agency-jekyll-theme), Bootstrap 3 + jQuery 1.11, com Font Awesome 5 e Google Fonts carregados por CDN.

**CSS é gerado por Liquid, não é estático.** `_includes/css/agency.css` contém tags Liquid (`#{{ site.color.primary }}`) e por isso vive em `_includes/`, sendo injetado inline dentro de um `<style>` no fim de `_includes/head.html` (junto com `bootstrap.min.css`). Consequências:

- As cores do site vêm de `_config.yml` → `color:` (hex sem `#`). Trocar a paleta é editar só o `_config.yml`.
- `style.css` + `_layouts/style.css` são a rota alternativa (folha externa com os mesmos includes). O `<link>` para ela em `head.html` está **comentado** — o inline é o caminho ativo. Se reativar um, desative o outro.
- Ao editar `agency.css`, preserve as tags Liquid; substituí-las por hex fixo quebra o controle de tema.

**`_plugins/hex_to_rgb.rb` não roda no GitHub Pages.** Plugins customizados são desabilitados no build do Pages, então o filtro `hex_to_rgb` (usado em `agency.css:333` para o overlay `rgba(...)` do portfólio) só funciona em builds locais. Por isso a linha anterior traz um `rgba()` hardcoded como fallback — ao mudar `color.primary`, atualize esse valor manualmente também.

**Experiência profissional vem de `_posts/`.** Cada arquivo em `_posts/` é um emprego/projeto, sem corpo — só front matter. `_includes/experience.html` itera `site.posts` gerando os cards e `_includes/modals.html` itera os mesmos posts gerando os modais Bootstrap correspondentes. Campos usados: `title`, `modal-id` (liga card ↔ modal, precisa ser único), `thumbnail` e `img` (resolvidos contra `img/portfolio/`), `alt`, `description`, `client`, `project-start-date`, `project-end-date`, `category` (o cargo). A ordem dos cards é a ordem de `site.posts` (mais recente primeiro, pela data do nome do arquivo). Para adicionar um emprego: novo `_posts/YYYY-MM-DD-nome.markdown` + thumbnail em `img/portfolio/`.

Como os posts declaram `layout: default`, cada um também gera uma cópia inteira da home numa URL própria (`permalink: pretty`). É um efeito colateral inofensivo do tema, não uma página de post real.

**Conteúdo estático fora do Jekyll.** `ppal/` contém quatro apresentações reveal.js autocontidas (`masters`, `qualif`, `socnet`, `socnet-diffusion`) — HTML/CSS/JS próprios, copiados as-is pelo Jekyll. Não compartilham nada com o tema do site; edite-as isoladamente.

**Outras seções do domínio não estão neste repo.** `/blog`, `/darkenizer` etc. (listados em `sitemap.txt`) são outros repositórios servidos sob o mesmo domínio via `CNAME`.

**Analytics.** GA4 (`G-NSNV8ZR1NV`) inline em `_includes/js.html`.
