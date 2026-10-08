import type { Section, SectionDataMap, SectionType, SiteContent } from "./content-types";

// Imagens provisórias, publicadas no site de referência da Empreend.
// Troque pelas perspectivas oficiais no painel /admin.
const cdn = (file: string) =>
  `https://cdn.sanity.io/images/bry6ofe1/production/${file}?w=2400&auto=format&q=82`;

export const IMG = {
  piscinaToboga: cdn("6735967e7902d48f7f4b537d138bfb1b9c1f3068-1920x1280.jpg"),
  portal: cdn("43dd4db32106d6af10e4869f9de79edf9eb7c4ff-1920x1280.jpg"),
  portaria: cdn("4b2182aea9704f74f8b2d2fd72abc550f2010897-1920x1280.jpg"),
  casa: cdn("60f493b41e12fa6bf2fed21c608e204c1b6ece4e-1920x1280.jpg"),
  complexoAguas: cdn("c17feadec54e4218a8a5594fd621f4f35e1971b6-1920x1280.jpg"),
  obra: cdn("2a9f73734dae7bdcec89e35c4800f03ab77777af-1920x1280.jpg"),
  entardecer: cdn("fee35f5eb59ace59a92cf7fbc7601a6180315199-1920x1280.jpg"),
  deck: cdn("695be85c3367c6943fa8b004e3df029e2a640424-1920x1280.jpg"),
  logoVilaNoah:
    "https://cdn.sanity.io/images/bry6ofe1/production/3db956935d0d83291226aebe4716154f726fd29d-396x106.png",
  logoEmpreend:
    "https://cdn.sanity.io/images/bry6ofe1/production/19c0233f75151e21817663b40ad64ce0f1dc7793-429x314.png",
};

const AGENDAR = "#agendar";
const WHATS = "5544991665557";

export const defaultSectionData: SectionDataMap = {
  hero: {
    logo: { src: IMG.logoVilaNoah, alt: "Vila Noah Resort Residence — Avaré" },
    title: "Há lugares que ficam para sempre na história de uma família.",
    text: "Às margens da Represa Jurumirim, o Vila Noah reúne natureza, lazer e serviços para que os melhores dias em família possam acontecer muitas vezes.",
    button: { label: "Agende sua visita", href: AGENDAR },
    image: { src: IMG.complexoAguas, alt: "Complexo de piscinas do Vila Noah ao entardecer" },
  },
  historia: {
    title: "O lugar das suas histórias de família",
    paragraphs: [
      {
        text: "Uma manhã perto da água. O almoço que se estende. As crianças encontrando seus lugares preferidos. O fim de tarde que reúne todo mundo outra vez. Quando a família volta ao mesmo lugar ao longo dos anos, cada encontro passa a fazer parte de um legado.",
      },
      {
        text: "O Vila Noah foi pensado para receber esses dias. Um Resort Residence em Avaré, cercado pela natureza e conectado à Represa Jurumirim, com espaços para descansar, celebrar, praticar esportes e aproveitar o tempo juntos.",
      },
    ],
    imageMain: { src: IMG.casa, alt: "Residência integrada à vegetação no Vila Noah" },
    imageSecondary: { src: IMG.portal, alt: "Portal de entrada do Vila Noah" },
  },
  agua: {
    title: "Um novo ritmo começa perto da água.",
    text: "A Represa Jurumirim faz parte da paisagem e da experiência do Vila Noah. O projeto prevê uma orla de aproximadamente 290 metros, praia permanente de água doce, rampa náutica, mirantes, bar, lanchonete e estrutura para aproveitar a represa com mais conforto.",
    button: { label: "Quero mais informações", href: AGENDAR },
    image: { src: IMG.deck, alt: "Deck da piscina ao pôr do sol" },
    highlights: [
      { value: "290 m", label: "de orla, aproximadamente" },
      { value: "Praia", label: "permanente de água doce" },
      { value: "Rampa", label: "náutica e mirantes" },
    ],
  },
  numeros: {
    title: "Um lugar feito para aproveitar",
    text: "O projeto combina mais de 500 mil m² de área total, mais de 36 mil m² de lazer e cerca de 76.600 m² de áreas verdes preservadas. Os lotes partem de 500 m² e ficam a, no máximo, 150 metros de uma área de lazer.",
    items: [
      { prefix: "Mais de", value: "500", unit: "mil m²", label: "de área total" },
      { prefix: "Mais de", value: "36", unit: "mil m²", label: "de áreas de lazer" },
      { prefix: "Cerca de", value: "76.600", unit: "m²", label: "de áreas verdes preservadas" },
      { prefix: "Orla com", value: "290", unit: "m", label: "aproximadamente" },
      { prefix: "Terrenos a partir de", value: "500", unit: "m²", label: "com frente mínima de 15 metros" },
    ],
    button: { label: "Saiba mais", href: AGENDAR },
    image: { src: IMG.portaria, alt: "Portaria do Vila Noah" },
  },
  lazer: {
    title: "Há sempre um jeito novo de aproveitar o dia.",
    hint: "Escolha um tema para ver os espaços.",
    cards: [
      {
        title: "Água e praia",
        text: "Piscinas externas e internas climatizadas, piscina infantil, bar molhado, praia de água doce e acesso à represa.",
        image: { src: IMG.piscinaToboga, alt: "Piscina com toboáguas e coqueiros" },
      },
      {
        title: "Esporte e bem-estar",
        text: "Academia, SPA, quadras, campo de futebol, pista de caminhada e espaços para diferentes práticas esportivas.",
        image: { src: IMG.complexoAguas, alt: "Vista aérea do complexo de lazer" },
      },
      {
        title: "Crianças e família",
        text: "Espaço kids, playground, Skate Plaza, Pet Place, redário e áreas de convivência.",
        image: { src: IMG.casa, alt: "Área de convivência arborizada" },
      },
      {
        title: "Encontros e celebrações",
        text: "Espaços gourmet, bares, lanchonetes, espaço fogo de chão e áreas para eventos.",
        image: { src: IMG.deck, alt: "Deck para encontros ao entardecer" },
      },
    ],
    button: { label: "Agende uma visita", href: AGENDAR },
  },
  natureza: {
    title: "Natureza integrada em cada detalhe.",
    text: "O paisagismo de Luiz Carlos Orsini foi concebido para revitalizar a vegetação nativa e conectar as residências, o bosque central, as áreas de lazer e a praia. Folhagens tropicais, espaços arborizados e áreas de contemplação ajudam a criar uma paisagem contemporânea integrada à represa.",
    credit: "Paisagismo de Luiz Carlos Orsini",
    image: { src: IMG.casa, alt: "Paisagismo com vegetação nativa" },
    gallery: [
      { image: { src: IMG.piscinaToboga, alt: "Piscina com toboáguas" } },
      { image: { src: IMG.portaria, alt: "Portaria com paisagismo" } },
      { image: { src: IMG.complexoAguas, alt: "Complexo de águas" } },
      { image: { src: IMG.portal, alt: "Portal de entrada" } },
      { image: { src: IMG.deck, alt: "Deck ao pôr do sol" } },
    ],
  },
  empreend: {
    logo: { src: IMG.logoEmpreend, alt: "Empreend Construtora e Urbanismo" },
    title: "Um projeto da Empreend Construtora e Urbanismo.",
    text: "A Empreend apresenta em seu histórico mais de 3.988 lotes entregues e 11.685.450,76 m² urbanizados, além de empreendimentos residenciais e loteamentos realizados no Paraná. O Vila Noah leva essa experiência para Avaré, com projeto arquitetônico da A5 Arquitetura e paisagismo de Luiz Carlos Orsini.",
    stats: [
      { value: "3.988", label: "lotes entregues" },
      { value: "11.685.450,76 m²", label: "urbanizados" },
    ],
    button: {
      label: "Conheça a Empreend",
      href: "https://empreend.m2z.app.br/a-empreend",
      newTab: true,
    },
    image: { src: IMG.obra, alt: "Equipe da Empreend em obra" },
  },
  endereco: {
    label: "Plantão de vendas",
    address: "Rodovia João Mellão, SP-255, km 273",
    city: "Avaré, SP",
    mapQuery: "Rodovia João Mellão, SP-255, km 273, Avaré, SP",
    primaryButton: {
      label: "Como chegar",
      href: "https://www.google.com/maps/search/?api=1&query=Rodovia%20Jo%C3%A3o%20Mell%C3%A3o%2C%20SP-255%2C%20km%20273%2C%20Avar%C3%A9%2C%20SP",
      newTab: true,
    },
    secondaryButton: { label: "Agende sua visita", href: AGENDAR },
  },
  chamada: {
    title: "Agora, imagine sua família vivendo tudo isso.",
    text: "Conheça o Vila Noah de perto. Deixe seu contato e combinamos o melhor dia para a sua visita.",
    button: { label: "Agende uma visita", href: AGENDAR },
    image: { src: IMG.entardecer, alt: "Fim de tarde à beira da piscina" },
    showForm: true,
  },
};

export const sectionLabels: Record<SectionType, string> = {
  hero: "Abertura (hero)",
  historia: "Histórias de família",
  agua: "Perto da água",
  numeros: "Números do projeto",
  lazer: "Lazer",
  natureza: "Natureza e paisagismo",
  empreend: "Sobre a Empreend",
  endereco: "Endereço",
  chamada: "Chamada final",
};

const order: SectionType[] = [
  "hero",
  "historia",
  "agua",
  "numeros",
  "lazer",
  "natureza",
  "empreend",
  "endereco",
  "chamada",
];

const anchors: Record<SectionType, string> = {
  hero: "inicio",
  historia: "historias",
  agua: "represa",
  numeros: "projeto",
  lazer: "lazer",
  natureza: "natureza",
  empreend: "empreend",
  endereco: "endereco",
  chamada: "agende",
};

export function makeSection<T extends SectionType>(type: T, id?: string): Section<T> {
  return {
    id: id ?? `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    anchor: anchors[type],
    visible: true,
    data: structuredClone(defaultSectionData[type]),
  };
}

export const defaultContent: SiteContent = {
  version: 1,
  settings: {
    seo: {
      title: "Vila Noah Resort Residence em Avaré",
      description:
        "Conheça o Vila Noah, Resort Residence às margens da Represa Jurumirim, com lotes a partir de 500 m², lazer, natureza e serviços.",
      ogImage: { src: IMG.complexoAguas, alt: "Vila Noah Resort Residence" },
      favicon: "/favicon.svg",
    },
    theme: {
      deep: "#163330",
      accent: "#B9886C",
      mist: "#ECEFEA",
      ink: "#1C2522",
      paper: "#FAFAF7",
    },
    header: {
      logo: { src: IMG.logoVilaNoah, alt: "Vila Noah Resort Residence" },
      cta: { label: "Agende sua visita", href: AGENDAR },
    },
    form: {
      title: "Agende sua visita",
      text: "Deixe seu contato. Um consultor fala com você para combinar o melhor dia.",
      nameLabel: "Nome",
      emailLabel: "E-mail",
      phoneLabel: "WhatsApp",
      consentText: "Aceito receber contato da Empreend sobre o Vila Noah.",
      privacyLink: { label: "Política de privacidade", href: "#", newTab: true },
      submitLabel: "Quero agendar minha visita",
      sendingLabel: "Enviando…",
      successTitle: "Recebemos seu contato.",
      successText: "Um consultor vai chamar você no WhatsApp em breve para combinar a visita.",
      errorText: "Não conseguimos enviar agora. Confira os dados ou fale com a gente pelo WhatsApp.",
      whatsappAfterSubmit: false,
    },
    tracking: {
      gtmId: "",
      formEvent: "generate_lead",
      ctaEvent: "cta_click",
      includeUserData: false,
    },
    whatsapp: {
      enabled: true,
      number: WHATS,
      message: "Olá! Quero saber mais sobre o Vila Noah Resort Residence.",
      label: "Falar no WhatsApp",
    },
    retention: {
      stickyBar: true,
      stickyLabel: "Agende sua visita",
      exitIntent: true,
      exitTitle: "Antes de ir: que tal conhecer o Vila Noah de perto?",
      exitText: "Deixe seu WhatsApp e combinamos uma visita sem compromisso.",
      scrollProgress: true,
    },
    footer: {
      logo: { src: IMG.logoEmpreend, alt: "Empreend Construtora e Urbanismo" },
      text: "Vila Noah Resort Residence é um empreendimento da Empreend Construtora e Urbanismo.",
      address: "Rua Santos Dumont, 924, Zona 3 — CEP 87050-100, Maringá, PR",
      contacts: [
        { label: "(44) 3226-0700", href: "tel:+554432260700" },
        { label: "(44) 99166-5557", href: `https://wa.me/${WHATS}`, newTab: true },
        { label: "contato@empreend.com.br", href: "mailto:contato@empreend.com.br" },
      ],
      links: [
        { label: "Agende sua visita", href: AGENDAR },
        { label: "Como chegar", href: "#endereco" },
        { label: "Site da Empreend", href: "https://empreend.m2z.app.br/", newTab: true },
      ],
      social: [
        { label: "Instagram", href: "https://www.instagram.com/empreendconstrutora/", newTab: true },
        { label: "Facebook", href: "https://www.facebook.com/empreendconstrutora", newTab: true },
      ],
      legal:
        "Loteamento registrado no Ofício de Registro de Imóveis de Avaré/SP sob o nº R02/91711. Imagens meramente ilustrativas.",
      copyright: "© 2026 Empreend. Todos os direitos reservados.",
    },
  },
  sections: order.map((t) => makeSection(t, t)),
  private: { webhookUrl: "" },
};
