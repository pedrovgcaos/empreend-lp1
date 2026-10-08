# Vila Noah — Landing page + painel

Landing page do Vila Noah Resort Residence (Empreend) com painel de edição em `/admin`.

- **Site:** `/` — página estática, regenerada automaticamente a cada publicação no painel.
- **Painel:** `/admin` — reordenar/ocultar/duplicar seções, editar todos os textos, imagens, logos (cabeçalho, abertura, rodapé), favicon, cores, links dos botões, rodapé, SEO, formulário e rastreamento. Pré-visualização ao vivo (computador e celular) e histórico das últimas 40 publicações.

Stack: Next.js 16 (App Router) + Vercel Blob. Sem banco de dados: cada publicação grava um JSON versionado no Blob.

## Variáveis de ambiente

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `ADMIN_PASSWORD` | sim | Senha do painel `/admin`. |
| `ADMIN_SECRET` | recomendada | Assina o cookie de sessão. String aleatória longa. |
| `BLOB_READ_WRITE_TOKEN` | sim (produção) | Criada automaticamente ao conectar um Blob Store ao projeto na Vercel. |
| `LEAD_WEBHOOK_URL` | não | Webhook dos leads. Se definida, tem prioridade sobre o campo do painel. |
| `SITE_URL` | não | URL canônica (usada nas tags Open Graph). Na Vercel o domínio de produção é detectado sozinho. |

## Deploy na Vercel

1. Importe o repositório na Vercel (framework detectado: Next.js).
2. Em **Storage → Create → Blob**, crie um Blob Store e conecte ao projeto (gera `BLOB_READ_WRITE_TOKEN`).
3. Em **Settings → Environment Variables**, defina `ADMIN_PASSWORD` e `ADMIN_SECRET`.
4. Faça um novo deploy. Acesse `/admin`, ajuste o conteúdo e clique em **Publicar alterações**.

## Formulário e rastreamento

- Qualquer botão com link `#agendar` abre o formulário em modal. Acessar a URL com `#agendar` também abre.
- Ao clicar no botão de envio (com o formulário válido), a página executa:

  ```js
  dataLayer.push({
    event: "generate_lead",          // editável em Painel → Rastreamento
    form_id: "vila-noah-agendar-visita",
    form_location: "modal" | "secao" | "saida",
    cta_origin: "<texto do botão que abriu o formulário>",
    page_location: "<url>",
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid,
    user_data: { email, phone_number } // só se ativado no painel
  })
  ```

- Todo clique em botão envia `{ event: "cta_click", cta_label, cta_href, cta_section }`.
- O ID do Google Tag Manager é configurado no painel (Rastreamento).
- Os leads são enviados por POST (JSON) para o webhook configurado (Make, Zapier, n8n, RD Station, CRM). Sem webhook, ficam apenas no log da Vercel.

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # defina ADMIN_PASSWORD
npm run dev
```

Sem `BLOB_READ_WRITE_TOKEN`, o conteúdo e os uploads ficam na pasta `.data/` (ignorada pelo git).

## Imagens

As imagens iniciais são provisórias (vindas do site da Empreend). Troque pelas perspectivas oficiais no painel. As fotos enviadas pelo painel são redimensionadas para até 2400 px e convertidas para WebP antes do upload.
