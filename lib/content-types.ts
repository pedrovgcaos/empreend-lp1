export type LinkData = { label: string; href: string; newTab?: boolean };
export type ImageData = { src: string; alt: string };

export type HeroData = {
  logo: ImageData;
  title: string;
  text: string;
  button: LinkData;
  image: ImageData;
};

export type HistoriaData = {
  title: string;
  paragraphs: { text: string }[];
  imageMain: ImageData;
  imageSecondary: ImageData;
};

export type AguaData = {
  title: string;
  text: string;
  button: LinkData;
  image: ImageData;
  highlights: { value: string; label: string }[];
};

export type NumerosData = {
  title: string;
  text: string;
  items: { prefix: string; value: string; unit: string; label: string }[];
  button: LinkData;
  image: ImageData;
};

export type LazerData = {
  title: string;
  hint: string;
  cards: { title: string; text: string; image: ImageData }[];
  button: LinkData;
};

export type NaturezaData = {
  title: string;
  text: string;
  credit: string;
  image: ImageData;
  gallery: { image: ImageData }[];
};

export type EmpreendData = {
  logo: ImageData;
  title: string;
  text: string;
  stats: { value: string; label: string }[];
  button: LinkData;
  image: ImageData;
};

export type EnderecoData = {
  label: string;
  address: string;
  city: string;
  mapQuery: string;
  primaryButton: LinkData;
  secondaryButton: LinkData;
};

export type ChamadaData = {
  title: string;
  text: string;
  button: LinkData;
  image: ImageData;
  showForm: boolean;
};

export type SectionDataMap = {
  hero: HeroData;
  historia: HistoriaData;
  agua: AguaData;
  numeros: NumerosData;
  lazer: LazerData;
  natureza: NaturezaData;
  empreend: EmpreendData;
  endereco: EnderecoData;
  chamada: ChamadaData;
};

export type SectionType = keyof SectionDataMap;

export type Section<T extends SectionType = SectionType> = {
  id: string;
  type: T;
  anchor: string;
  visible: boolean;
  data: SectionDataMap[T];
};

export type Settings = {
  seo: { title: string; description: string; ogImage: ImageData; favicon: string };
  theme: { deep: string; accent: string; mist: string; ink: string; paper: string };
  header: { logo: ImageData; cta: LinkData };
  form: {
    title: string;
    text: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    consentText: string;
    privacyLink: LinkData;
    submitLabel: string;
    sendingLabel: string;
    successTitle: string;
    successText: string;
    errorText: string;
    whatsappAfterSubmit: boolean;
  };
  tracking: { gtmId: string; formEvent: string; ctaEvent: string; includeUserData: boolean };
  whatsapp: { enabled: boolean; number: string; message: string; label: string };
  retention: {
    stickyBar: boolean;
    stickyLabel: string;
    exitIntent: boolean;
    exitTitle: string;
    exitText: string;
    scrollProgress: boolean;
  };
  footer: {
    logo: ImageData;
    text: string;
    address: string;
    contacts: LinkData[];
    links: LinkData[];
    social: LinkData[];
    legal: string;
    copyright: string;
  };
};

/** Campos que nunca vão para o navegador do visitante. */
export type PrivateSettings = { webhookUrl: string };

export type SiteContent = {
  version: number;
  settings: Settings;
  sections: Section[];
  private: PrivateSettings;
};

export type PublicContent = Omit<SiteContent, "private">;
