import type {
  AguaData,
  ChamadaData,
  EmpreendData,
  EnderecoData,
  HeroData,
  HistoriaData,
  LazerData,
  NaturezaData,
  NumerosData,
  Section,
  Settings,
} from "@/lib/content-types";
import { Counter } from "./Counter";
import { Gallery } from "./Gallery";
import { LazerTabs } from "./LazerTabs";
import { LeadForm } from "./LeadForm";
import { Cta, Img, Logo, Paragraphs, Words } from "./ui";

type Ctx = { settings: Settings; preview?: boolean; first: boolean };

function Hero({ d, first }: { d: HeroData } & Ctx) {
  return (
    <div className="hero">
      <div className="hero__media">
        <Img img={d.image} eager={first} sizes="100vw" className="hero__img" />
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="wrap hero__content">
        {d.logo?.src ? <Logo img={d.logo} className="hero__logo" /> : null}
        {first ? (
          <h1 className="hero__title">
            <Words text={d.title} />
          </h1>
        ) : (
          <h2 className="hero__title">
            <Words text={d.title} />
          </h2>
        )}
        <div className="hero__line" aria-hidden="true" />
        <div className="hero__foot">
          <p className="hero__text">{d.text}</p>
          <Cta link={d.button} section="hero" className="hero__cta" />
        </div>
      </div>
    </div>
  );
}

function Historia({ d }: { d: HistoriaData } & Ctx) {
  return (
    <div className="wrap historia">
      <h2 className="title historia__title" data-reveal>
        {d.title}
      </h2>
      <div className="historia__body prose" data-reveal>
        {d.paragraphs.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </div>
      <div className="historia__main frame" data-reveal="wipe">
        <Img img={d.imageMain} sizes="(max-width: 900px) 100vw, 62vw" />
      </div>
      {d.imageSecondary?.src ? (
        <div className="historia__second frame frame--arch" data-reveal="wipe">
          <Img img={d.imageSecondary} sizes="(max-width: 900px) 60vw, 30vw" />
        </div>
      ) : null}
    </div>
  );
}

function Agua({ d }: { d: AguaData } & Ctx) {
  return (
    <div className="wrap agua">
      <div className="agua__media frame frame--arch" data-reveal="wipe">
        <Img img={d.image} sizes="(max-width: 900px) 100vw, 45vw" />
      </div>
      <div className="agua__text">
        <h2 className="title" data-reveal>
          {d.title}
        </h2>
        <div className="prose" data-reveal>
          <Paragraphs text={d.text} />
        </div>
        {d.highlights.length ? (
          <dl className="agua__facts" data-reveal>
            {d.highlights.map((h, i) => (
              <div key={i}>
                <dt>{h.value}</dt>
                <dd>{h.label}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div data-reveal>
          <Cta link={d.button} section="represa" variant="light" />
        </div>
      </div>
    </div>
  );
}

function Numeros({ d }: { d: NumerosData } & Ctx) {
  return (
    <>
      <div className="wrap numeros">
        <div className="numeros__intro">
          <h2 className="title" data-reveal>
            {d.title}
          </h2>
          <div className="prose" data-reveal>
            <Paragraphs text={d.text} />
          </div>
          <div data-reveal>
            <Cta link={d.button} section="numeros" />
          </div>
        </div>
        <ul className="numeros__list">
          {d.items.map((it, i) => (
            <li key={i} data-reveal>
              <span className="numeros__prefix">{it.prefix}</span>
              <span className="numeros__value">
                <Counter value={it.value} />
                {it.unit ? <span className="numeros__unit"> {it.unit}</span> : null}
              </span>
              <span className="numeros__label">{it.label}</span>
            </li>
          ))}
        </ul>
      </div>
      {d.image?.src ? (
        <div className="numeros__band" data-reveal="wipe">
          <div className="parallax">
            <Img img={d.image} sizes="100vw" />
          </div>
        </div>
      ) : null}
    </>
  );
}

function Lazer({ d }: { d: LazerData } & Ctx) {
  return (
    <div className="wrap">
      <div className="lazer__head">
        <h2 className="title" data-reveal>
          {d.title}
        </h2>
        <div data-reveal>
          <Cta link={d.button} section="lazer" variant="ghost" />
        </div>
      </div>
      <LazerTabs cards={d.cards} hint={d.hint} />
    </div>
  );
}

function Natureza({ d }: { d: NaturezaData } & Ctx) {
  return (
    <>
      <div className="natureza__hero">
        <div className="parallax">
          <Img img={d.image} sizes="100vw" />
        </div>
        <div className="wrap natureza__card-wrap">
          <div className="natureza__card" data-reveal>
            <h2 className="title">{d.title}</h2>
            <div className="prose">
              <Paragraphs text={d.text} />
            </div>
            {d.credit ? <p className="natureza__credit">{d.credit}</p> : null}
          </div>
        </div>
      </div>
      {d.gallery.length ? (
        <div className="wrap natureza__gallery" data-reveal>
          <Gallery items={d.gallery} />
        </div>
      ) : null}
    </>
  );
}

function Empreend({ d }: { d: EmpreendData } & Ctx) {
  return (
    <div className="wrap empreend">
      <div className="empreend__text">
        {d.logo?.src ? <Logo img={d.logo} className="empreend__logo" /> : null}
        <h2 className="title" data-reveal>
          {d.title}
        </h2>
        <div className="prose" data-reveal>
          <Paragraphs text={d.text} />
        </div>
        {d.stats.length ? (
          <dl className="empreend__stats" data-reveal>
            {d.stats.map((s, i) => (
              <div key={i}>
                <dt>
                  <Counter value={s.value.replace(/\s*m²$/, "")} />
                  {/m²$/.test(s.value) ? " m²" : ""}
                </dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div data-reveal>
          <Cta link={d.button} section="empreend" variant="light" />
        </div>
      </div>
      <div className="empreend__media frame" data-reveal="wipe">
        <Img img={d.image} sizes="(max-width: 900px) 100vw, 40vw" />
      </div>
    </div>
  );
}

function Endereco({ d, preview }: { d: EnderecoData } & Ctx) {
  const map = `https://maps.google.com/maps?q=${encodeURIComponent(d.mapQuery || `${d.address}, ${d.city}`)}&z=11&output=embed`;
  return (
    <div className="wrap endereco">
      <div className="endereco__text" data-reveal>
        <p className="endereco__label">{d.label}</p>
        <address>
          <span className="endereco__addr">{d.address}</span>
          <span className="endereco__city">{d.city}</span>
        </address>
        <div className="btn-row">
          <Cta link={d.primaryButton} section="endereco" />
          <Cta link={d.secondaryButton} section="endereco" variant="ghost" />
        </div>
      </div>
      <div className="endereco__map frame" data-reveal="wipe">
        {preview ? (
          <div className="endereco__map-ph">Mapa: {d.mapQuery}</div>
        ) : (
          <iframe
            title={`Mapa: ${d.address}`}
            src={map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>
    </div>
  );
}

function Chamada({ d, settings, preview }: { d: ChamadaData } & Ctx) {
  return (
    <div className="chamada">
      <div className="chamada__media">
        <div className="parallax">
          <Img img={d.image} sizes="100vw" />
        </div>
      </div>
      <div className="chamada__shade" aria-hidden="true" />
      <div className={`wrap chamada__inner${d.showForm ? "" : " chamada__inner--solo"}`}>
        <div className="chamada__text">
          <h2 className="title title--xl" data-reveal>
            {d.title}
          </h2>
          {d.text ? (
            <p className="chamada__lede" data-reveal>
              {d.text}
            </p>
          ) : null}
          {!d.showForm ? (
            <div data-reveal>
              <Cta link={d.button} section="chamada" variant="light" />
            </div>
          ) : null}
        </div>
        {d.showForm ? (
          <div className="chamada__form" data-reveal id="formulario">
            <h3 className="chamada__form-title">{settings.form.title}</h3>
            <p className="chamada__form-text">{settings.form.text}</p>
            <LeadForm settings={settings} location="secao" preview={preview} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SectionView({ section, ...ctx }: { section: Section } & Ctx) {
  const props = { ...ctx };
  let inner;
  switch (section.type) {
    case "hero":
      inner = <Hero d={section.data as HeroData} {...props} />;
      break;
    case "historia":
      inner = <Historia d={section.data as HistoriaData} {...props} />;
      break;
    case "agua":
      inner = <Agua d={section.data as AguaData} {...props} />;
      break;
    case "numeros":
      inner = <Numeros d={section.data as NumerosData} {...props} />;
      break;
    case "lazer":
      inner = <Lazer d={section.data as LazerData} {...props} />;
      break;
    case "natureza":
      inner = <Natureza d={section.data as NaturezaData} {...props} />;
      break;
    case "empreend":
      inner = <Empreend d={section.data as EmpreendData} {...props} />;
      break;
    case "endereco":
      inner = <Endereco d={section.data as EnderecoData} {...props} />;
      break;
    case "chamada":
      inner = <Chamada d={section.data as ChamadaData} {...props} />;
      break;
    default:
      return null;
  }
  return (
    <section id={section.anchor || undefined} className={`s s-${section.type}`} data-section={section.id}>
      {inner}
    </section>
  );
}
