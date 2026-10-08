import type { SectionType } from "@/lib/content-types";

export type ImageKind = "photo" | "logo" | "favicon";

export type Field =
  | { type: "text"; key: string; label: string; help?: string; placeholder?: string }
  | { type: "textarea"; key: string; label: string; help?: string; rows?: number }
  | { type: "image"; key: string; label: string; help?: string; kind?: ImageKind }
  | { type: "imageUrl"; key: string; label: string; help?: string; kind?: ImageKind }
  | { type: "link"; key: string; label: string; help?: string }
  | { type: "toggle"; key: string; label: string; help?: string }
  | { type: "color"; key: string; label: string; help?: string }
  | { type: "linklist"; key: string; label: string; help?: string; itemLabel: string }
  | {
      type: "list";
      key: string;
      label: string;
      help?: string;
      itemLabel: string;
      titleKey?: string;
      fields: Field[];
    };

const title: Field = { type: "textarea", key: "title", label: "Título", rows: 2 };
const text: Field = { type: "textarea", key: "text", label: "Texto", rows: 5, help: "Deixe uma linha em branco para criar um novo parágrafo." };
const button = (key = "button", label = "Botão"): Field => ({ type: "link", key, label });
const photo = (key: string, label: string, help?: string): Field => ({ type: "image", key, label, kind: "photo", help });

export const sectionSchemas: Record<SectionType, Field[]> = {
  hero: [
    { type: "image", key: "logo", label: "Logo da abertura", kind: "logo", help: "PNG ou SVG com fundo transparente. Aparece sobre a imagem." },
    { type: "textarea", key: "title", label: "Título (H1)", rows: 3 },
    { type: "textarea", key: "text", label: "Texto de apoio", rows: 4 },
    button(),
    photo("image", "Imagem de fundo", "Use uma imagem horizontal de pelo menos 2000 px de largura."),
  ],
  historia: [
    title,
    { type: "list", key: "paragraphs", label: "Parágrafos", itemLabel: "Parágrafo", titleKey: "text", fields: [{ type: "textarea", key: "text", label: "Texto", rows: 5 }] },
    photo("imageMain", "Imagem principal"),
    photo("imageSecondary", "Imagem secundária (em arco)", "Formato vertical funciona melhor."),
  ],
  agua: [
    title,
    text,
    {
      type: "list",
      key: "highlights",
      label: "Destaques",
      itemLabel: "Destaque",
      titleKey: "value",
      fields: [
        { type: "text", key: "value", label: "Valor em destaque", placeholder: "290 m" },
        { type: "text", key: "label", label: "Complemento", placeholder: "de orla" },
      ],
    },
    button(),
    photo("image", "Imagem (em arco)", "Formato vertical funciona melhor."),
  ],
  numeros: [
    title,
    text,
    {
      type: "list",
      key: "items",
      label: "Números",
      itemLabel: "Número",
      titleKey: "value",
      help: "Valores numéricos (ex.: 500, 76.600) ganham contagem animada.",
      fields: [
        { type: "text", key: "prefix", label: "Antes do número", placeholder: "Mais de" },
        { type: "text", key: "value", label: "Número", placeholder: "500" },
        { type: "text", key: "unit", label: "Unidade", placeholder: "mil m²" },
        { type: "text", key: "label", label: "Descrição", placeholder: "de área total" },
      ],
    },
    button(),
    photo("image", "Imagem panorâmica abaixo dos números", "Deixe vazio para ocultar."),
  ],
  lazer: [
    title,
    { type: "text", key: "hint", label: "Instrução acima da lista" },
    {
      type: "list",
      key: "cards",
      label: "Temas de lazer",
      itemLabel: "Tema",
      titleKey: "title",
      fields: [
        { type: "text", key: "title", label: "Título" },
        { type: "textarea", key: "text", label: "Texto", rows: 3 },
        photo("image", "Imagem"),
      ],
    },
    button(),
  ],
  natureza: [
    title,
    text,
    { type: "text", key: "credit", label: "Crédito do paisagismo" },
    photo("image", "Imagem principal"),
    {
      type: "list",
      key: "gallery",
      label: "Galeria",
      itemLabel: "Imagem",
      fields: [photo("image", "Imagem")],
    },
  ],
  empreend: [
    { type: "image", key: "logo", label: "Logo da Empreend", kind: "logo" },
    title,
    text,
    {
      type: "list",
      key: "stats",
      label: "Números",
      itemLabel: "Número",
      titleKey: "value",
      fields: [
        { type: "text", key: "value", label: "Valor", placeholder: "3.988" },
        { type: "text", key: "label", label: "Descrição", placeholder: "lotes entregues" },
      ],
    },
    button(),
    photo("image", "Imagem"),
  ],
  endereco: [
    { type: "text", key: "label", label: "Título pequeno" },
    { type: "text", key: "address", label: "Endereço" },
    { type: "text", key: "city", label: "Cidade" },
    { type: "text", key: "mapQuery", label: "Endereço para o mapa", help: "Texto pesquisado no Google Maps para exibir o mapa." },
    button("primaryButton", "Botão principal"),
    button("secondaryButton", "Botão secundário"),
  ],
  chamada: [
    title,
    { type: "textarea", key: "text", label: "Texto", rows: 3 },
    { type: "toggle", key: "showForm", label: "Mostrar formulário nesta seção" },
    { type: "link", key: "button", label: "Botão", help: "Aparece quando o formulário está desligado." },
    photo("image", "Imagem de fundo"),
  ],
};

export type SettingsPage = { id: string; label: string; description: string; fields: Field[] };

/** Chaves com ponto partem da raiz do conteúdo (ex.: settings.seo.title). */
export const settingsPages: SettingsPage[] = [
  {
    id: "marca",
    label: "Marca e SEO",
    description: "Logo do cabeçalho, favicon e como a página aparece no Google e nas redes.",
    fields: [
      { type: "image", key: "settings.header.logo", label: "Logo do cabeçalho", kind: "logo", help: "Aparece no topo ao rolar a página. Use versão clara (fundo escuro)." },
      { type: "link", key: "settings.header.cta", label: "Botão do cabeçalho" },
      { type: "imageUrl", key: "settings.seo.favicon", label: "Favicon", kind: "favicon", help: "PNG ou SVG quadrado, 512 × 512 px." },
      { type: "text", key: "settings.seo.title", label: "Meta title" },
      { type: "textarea", key: "settings.seo.description", label: "Meta description", rows: 3, help: "Ideal entre 120 e 160 caracteres." },
      { type: "image", key: "settings.seo.ogImage", label: "Imagem de compartilhamento", kind: "photo", help: "1200 × 630 px. Aparece ao compartilhar o link no WhatsApp e nas redes." },
    ],
  },
  {
    id: "cores",
    label: "Cores",
    description: "Paleta usada em toda a página.",
    fields: [
      { type: "color", key: "settings.theme.deep", label: "Verde represa (fundos escuros)" },
      { type: "color", key: "settings.theme.accent", label: "Cobre (botões e destaques)" },
      { type: "color", key: "settings.theme.mist", label: "Névoa (fundos claros alternados)" },
      { type: "color", key: "settings.theme.paper", label: "Papel (fundo principal)" },
      { type: "color", key: "settings.theme.ink", label: "Tinta (textos)" },
    ],
  },
  {
    id: "formulario",
    label: "Formulário",
    description: "Textos do formulário de agendamento e para onde os leads vão.",
    fields: [
      { type: "text", key: "private.webhookUrl", label: "Webhook dos leads", placeholder: "https://hook.make.com/…", help: "Cada envio do formulário é enviado por POST (JSON) para este endereço: Make, Zapier, n8n, RD Station, CRM." },
      { type: "text", key: "settings.form.title", label: "Título" },
      { type: "textarea", key: "settings.form.text", label: "Texto", rows: 2 },
      { type: "text", key: "settings.form.nameLabel", label: "Rótulo do nome" },
      { type: "text", key: "settings.form.phoneLabel", label: "Rótulo do WhatsApp" },
      { type: "text", key: "settings.form.emailLabel", label: "Rótulo do e-mail" },
      { type: "textarea", key: "settings.form.consentText", label: "Texto de consentimento (LGPD)", rows: 2 },
      { type: "link", key: "settings.form.privacyLink", label: "Link da política de privacidade" },
      { type: "text", key: "settings.form.submitLabel", label: "Texto do botão de envio" },
      { type: "text", key: "settings.form.sendingLabel", label: "Texto durante o envio" },
      { type: "text", key: "settings.form.successTitle", label: "Título de sucesso" },
      { type: "textarea", key: "settings.form.successText", label: "Texto de sucesso", rows: 2 },
      { type: "textarea", key: "settings.form.errorText", label: "Texto de erro", rows: 2 },
      { type: "toggle", key: "settings.form.whatsappAfterSubmit", label: "Abrir o WhatsApp depois do envio" },
    ],
  },
  {
    id: "rastreamento",
    label: "Rastreamento",
    description: "Google Tag Manager e eventos enviados ao dataLayer.",
    fields: [
      { type: "text", key: "settings.tracking.gtmId", label: "ID do Google Tag Manager", placeholder: "GTM-XXXXXXX" },
      { type: "text", key: "settings.tracking.formEvent", label: "Evento do botão do formulário", help: "dataLayer.push({ event: '…' }) disparado ao clicar em enviar com o formulário válido." },
      { type: "text", key: "settings.tracking.ctaEvent", label: "Evento de clique nos botões", help: "Disparado em todo clique de botão, com cta_label, cta_href e cta_section." },
      { type: "toggle", key: "settings.tracking.includeUserData", label: "Incluir e-mail e telefone no evento (conversões otimizadas)", help: "Envia user_data.email e user_data.phone_number. Ative só se a política de privacidade cobrir esse uso." },
    ],
  },
  {
    id: "retencao",
    label: "WhatsApp e retenção",
    description: "Botão de WhatsApp, barra fixa no celular e convite na saída da página.",
    fields: [
      { type: "toggle", key: "settings.whatsapp.enabled", label: "Mostrar botão do WhatsApp" },
      { type: "text", key: "settings.whatsapp.number", label: "Número do WhatsApp", placeholder: "5544999999999", help: "Com DDI e DDD, só números." },
      { type: "textarea", key: "settings.whatsapp.message", label: "Mensagem inicial", rows: 2 },
      { type: "text", key: "settings.whatsapp.label", label: "Texto acessível do botão" },
      { type: "toggle", key: "settings.retention.stickyBar", label: "Barra fixa com botão no celular" },
      { type: "text", key: "settings.retention.stickyLabel", label: "Texto da barra fixa" },
      { type: "toggle", key: "settings.retention.exitIntent", label: "Convite ao sair da página (desktop)", help: "Abre o formulário uma vez por visita quando o cursor sai da janela." },
      { type: "text", key: "settings.retention.exitTitle", label: "Título do convite" },
      { type: "textarea", key: "settings.retention.exitText", label: "Texto do convite", rows: 2 },
      { type: "toggle", key: "settings.retention.scrollProgress", label: "Barra de progresso da leitura" },
    ],
  },
  {
    id: "rodape",
    label: "Rodapé",
    description: "Logo, contatos, links e textos legais.",
    fields: [
      { type: "image", key: "settings.footer.logo", label: "Logo do rodapé", kind: "logo" },
      { type: "textarea", key: "settings.footer.text", label: "Texto", rows: 2 },
      { type: "text", key: "settings.footer.address", label: "Endereço" },
      { type: "linklist", key: "settings.footer.contacts", label: "Contatos", itemLabel: "Contato" },
      { type: "linklist", key: "settings.footer.links", label: "Links", itemLabel: "Link" },
      { type: "linklist", key: "settings.footer.social", label: "Redes sociais", itemLabel: "Rede", help: "Ícones automáticos para Instagram, Facebook e YouTube (pelo nome)." },
      { type: "textarea", key: "settings.footer.legal", label: "Texto legal", rows: 3 },
      { type: "text", key: "settings.footer.copyright", label: "Copyright" },
    ],
  },
];

export function emptyFor(fields: Field[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "image") out[f.key] = { src: "", alt: "" };
    else if (f.type === "link") out[f.key] = { label: "", href: "#agendar" };
    else if (f.type === "toggle") out[f.key] = false;
    else if (f.type === "list" || f.type === "linklist") out[f.key] = [];
    else out[f.key] = "";
  }
  return out;
}
