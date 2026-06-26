import { useState, useEffect, useRef, useCallback } from "react";
import {
  ExternalLink, Copy, Check, ArrowUpRight,
  Flame, Radar, Tent, Compass, Menu, X,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   SHERPA42 · STRATEGY OS — GROUND CONTROL
   Brand: #0001FF · #000000 · #FFFFFF · Bebas Neue + Space Mono
──────────────────────────────────────────────────────────── */

const C = {
  void: "#000000",
  ash: "#0A0A0A",
  ash2: "#121212",
  signal: "#0001FF",
  paper: "#FFFFFF",
  smoke: "#6B6B6B",
  smoke2: "#9A9A9A",
  line: "#EAEAEA",
  line2: "#F4F4F4",
  lineDark: "#1C1C1C",
};

const COORD = `27°59'17"N · 86°55'31"E`;
const TPL_PAPER = "https://docs.google.com/presentation/d/1CZi9Jyjv8VcvoYaTUHWycooc1sYmVZfnDvj8vhX7nnA/edit";
const TPL_PITCH = "https://docs.google.com/presentation/d/1X8wX2ftbi1dPT5LqJp11QJjI0WJC7p7Zlz4itJW9x1o/edit";

const NAV = [
  { id: "manifesto",   num: "01", label: "Manifesto",             alt: "BASE CAMP", sub: [] },
  { id: "como",        num: "02", label: "Como Trabalhamos",      alt: "5943 m",    sub: [] },
  { id: "rituais",     num: "03", label: "Rituais de Brainstorm", alt: "6400 m",    sub: [] },
  { id: "paper",       num: "04", label: "Paper",                 alt: "7000 m",    sub: [] },
  { id: "pitch",       num: "05", label: "Apresentação & Pitch",  alt: "7900 m",    sub: [] },
  { id: "scorecard",   num: "06", label: "Pitch Scorecard",       alt: "8400 m",    sub: ["Avaliação de Lideranças", "Checklist do Time", "Extra Mile"] },
  { id: "ferramentas", num: "07", label: "Ferramentas",           alt: "8650 m",    sub: ["Framework de Decupagem", "How Might We", "Kit de Ideação"] },
  { id: "portfolio",   num: "08", label: "Portfólio de Inovação", alt: "SUMMIT",    sub: ["Ignite", "Radar", "Camp", "Compass"] },
];

const FONT_DISPLAY = "'Bebas Neue', sans-serif";
const FONT_MONO = "'Space Mono', monospace";

/* ── Hooks ───────────────────────────────────────────────── */

function useFonts() {
  useEffect(() => {
    if (document.getElementById("sh42-fonts")) return;
    const el = document.createElement("link");
    el.id = "sh42-fonts";
    el.rel = "stylesheet";
    el.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";
    document.head.appendChild(el);
  }, []);
}

function usePrefersReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const h = () => setR(m.matches);
    m.addEventListener?.("change", h);
    return () => m.removeEventListener?.("change", h);
  }, []);
  return r;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const h = (e) => setMatches(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [query]);
  return matches;
}

/* ── Topographic contour ambient (Everest) ───────────────── */
const Topo = ({ stroke = C.signal, w = 520, h = 520, opacity = 1 }) => (
  <svg width={w} height={h} viewBox="0 0 520 520" fill="none" style={{ display: "block", opacity }} aria-hidden="true">
    {Array.from({ length: 11 }).map((_, i) => {
      const rx = 250 - i * 21;
      const ry = rx * 0.62;
      return (
        <ellipse key={i} cx="260" cy="260" rx={rx} ry={ry}
          stroke={stroke} strokeWidth="0.75" opacity={0.05 + i * 0.012}
          transform={`rotate(${-12 + i * 1.5} 260 260)`} />
      );
    })}
  </svg>
);

/* ── Live blinking status dot ─────────────────────────────── */
const LiveDot = () => {
  const reduce = usePrefersReducedMotion();
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setOn((o) => !o), 900);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <span
      aria-hidden="true"
      style={{
        width: 6, height: 6, borderRadius: "50%", background: C.signal,
        display: "inline-block", opacity: on ? 1 : 0.25,
        transition: "opacity 0.3s",
        boxShadow: on ? `0 0 6px ${C.signal}` : "none",
      }}
    />
  );
};

/* ── Station header ──────────────────────────────────────── */
const Station = ({ num, alt, eyebrow, title, intro }) => (
  <div style={{ marginBottom: 44, position: "relative" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, color: C.signal, fontWeight: 700 }}>
        ESTAÇÃO {num}
      </span>
      <span style={{ width: 24, height: 1, background: C.line }} />
      <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, color: C.smoke }}>{alt}</span>
    </div>
    {eyebrow && (
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 3, color: C.smoke, textTransform: "uppercase", marginBottom: 12 }}>
        {eyebrow}
      </div>
    )}
    <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 0.92, color: C.void, margin: 0, letterSpacing: 0.5, maxWidth: 640 }}>
      {title}
    </h1>
    <div style={{ width: 40, height: 3, background: C.signal, marginTop: 22 }} />
    {intro && (
      <p style={{ fontFamily: FONT_MONO, fontSize: 11, lineHeight: 2, color: "#333", maxWidth: 540, marginTop: 22 }}>
        {intro}
      </p>
    )}
  </div>
);

const Body = ({ children, max = 560 }) => (
  <p style={{ fontFamily: FONT_MONO, fontSize: 11, lineHeight: 2, color: "#333", maxWidth: max, marginBottom: 18 }}>
    {children}
  </p>
);

/* ─────────────────────────────  HOME  ───────────────────── */
const Home = ({ go }) => {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: -120, right: -160, pointerEvents: "none" }}>
        <Topo w={620} h={620} opacity={0.5} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 48px", borderBottom: `1px solid ${C.line}`, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: C.smoke }}>
        <LiveDot />
        <span style={{ color: C.void, fontWeight: 700 }}>GROUND CONTROL</span>
        <span>· SISTEMA ONLINE</span>
        <span style={{ marginLeft: "auto" }}>{COORD}</span>
      </div>

      <div style={{ padding: "64px 48px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 4, color: C.signal, marginBottom: 20 }}>
          SHERPA42 · ESTRATÉGIA & PLANEJAMENTO · STRATEGY OS v1.0
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(44px, 8vw, 76px)", lineHeight: 0.9, color: C.void, margin: "0 0 24px", letterSpacing: 0.5 }}>
          BEM-VINDES AO<br />CENTRO DE CONTROLE<br />
          <span style={{ color: C.signal }}>DA EXPEDIÇÃO.</span>
        </h1>
        <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#444", lineHeight: 2, maxWidth: 520, margin: 0 }}>
          Cultura, processo, rituais e ferramentas em um só lugar. Aqui é onde guiamos marcas influentes ao topo.
          Sete estações até as coordenadas.{" "}
          <span style={{ color: C.void, fontWeight: 700 }}>Let's keep climbing.</span>
        </p>
      </div>

      <div style={{ padding: "0 48px 64px", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, color: C.smoke, marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
          ROTA DE SUBIDA <span style={{ flex: 1, height: 1, background: C.line }} />
        </div>
        {NAV.map((s) => (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            onMouseEnter={() => setHov(s.id)}
            onMouseLeave={() => setHov(null)}
            aria-label={`Ir para ${s.label}`}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 22,
              padding: "20px 24px",
              background: hov === s.id ? C.void : "transparent",
              border: "none", borderBottom: `1px solid ${C.line}`,
              cursor: "pointer", textAlign: "left", transition: "background 0.18s",
            }}
          >
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: hov === s.id ? C.signal : C.line, minWidth: 48, transition: "color 0.18s" }}>
              {s.num}
            </span>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: hov === s.id ? C.paper : C.void, letterSpacing: 0.5, flex: 1, transition: "color 0.18s" }}>
              {s.label}
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: hov === s.id ? C.smoke2 : C.smoke, minWidth: 76, textAlign: "right" }}>
              {s.alt}
            </span>
            <ArrowUpRight size={16} color={hov === s.id ? C.signal : C.line} style={{ transition: "color 0.18s" }} />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ────────────────────────  MANIFESTO  ───────────────────── */
const Manifesto = () => {
  const mindset = [
    ["Olhar de turista", "Todo desafio é território novo. Curiosidade antes de conclusão — sempre o olhar de quem chega pela primeira vez."],
    ["Deixe o ego na porta", "A melhor ideia vence, não a mais alta na hierarquia. Trabalho em equipe é a chave."],
    ["Inconformismo", "Nunca se acomodar. \"Mais do mesmo\" não é entrega. Buscar a excelência é o piso, não o teto."],
    ["Ownership", "Responsabilidade e proatividade do começo ao fim. O projeto é seu até o topo."],
    ["Colaboração criativa", "Empatia, colaboração e experimentação. O todo vale mais do que a soma das partes que competem."],
  ];
  return (
    <div style={{ padding: "56px 48px", maxWidth: 700, position: "relative" }}>
      <Station
        num="01" alt="BASE CAMP" eyebrow="Quem somos · O que acreditamos"
        title={<>NÃO RESPONDEMOS<br />BRIEFINGS.<br /><span style={{ color: C.signal }}>ANTECIPAMOS.</span></>}
      />
      <Body>
        O departamento de Estratégia e Planejamento é a bússola criativa da Sherpa42. Transformamos desafios complexos
        em experiências de marca que importam — e, mais do que responder ao que o cliente pede, provocamos as perguntas
        que ele ainda não fez.
      </Body>
      <Body>
        Somos estrategistas criativos. Decodificamos cultura, marca, negócio e público, e traduzimos tudo isso em pontos
        de vista que viram projeto. A estratégia ganha vida na execução: por isso não paramos no insight — descemos até a ideia.
      </Body>

      <div style={{ margin: "44px 0 36px" }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, color: C.signal, fontWeight: 700, marginBottom: 20 }}>
          NOSSO MINDSET
        </div>
        {mindset.map(([t, d], i) => (
          <div key={t} style={{ display: "flex", gap: 18, padding: "16px 0", borderTop: i === 0 ? `1px solid ${C.line}` : "none", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.line, minWidth: 28 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.void, letterSpacing: 0.5, marginBottom: 5 }}>{t}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.smoke, lineHeight: 1.85 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.void, padding: "32px 34px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: -100, right: -80, pointerEvents: "none" }}>
          <Topo w={300} h={300} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.signal, letterSpacing: 2, marginBottom: 14 }}>{COORD}</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, color: C.paper, lineHeight: 0.95, letterSpacing: 1 }}>
            LET'S KEEP<br />CLIMBING.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────  COMO TRABALHAMOS  ─────────────────── */
const Como = () => {
  const steps = [
    ["Kickoff", "Hora de fazer perguntas, definir o que será sucesso e estabelecer acordos com o time e o cliente."],
    ["Pesquisa & Imersão", "Decifrar o briefing e mergulhar no contexto cultural, da marca, do negócio e da audiência."],
    ["Draft & Insights", "Reunir e analisar descobertas, levantando os primeiros caminhos para o projeto."],
    ["Brainstorm", "Compartilhar direcionais e explorar ideias divergentes. Quantidade é premissa para qualidade."],
    ["Paper", "Consolidar as ideias no papel, respondendo ao briefing com uma visão ponta a ponta."],
    ["Briefings de Parceiros", "Estruturar direcionais de cenografia, tecnologia e conteúdo, colaborando com a criação."],
    ["Deck", "Showtime. Construir a narrativa que guia o cliente das descobertas à ideia — com clareza e encantamento."],
  ];
  return (
    <div style={{ padding: "56px 48px", maxWidth: 720 }}>
      <Station
        num="02" alt="5943 m" eyebrow="O processo, do briefing ao palco"
        title={<>O CAMINHO<br />ATÉ O TOPO</>}
        intro="Nosso processo não é um trilho rígido — é uma rota. Pessoas acima de processos, liberdade com responsabilidade. Mas todo projeto sobe pelas mesmas estações."
      />
      <div style={{ position: "relative", marginLeft: 8 }}>
        <div style={{ position: "absolute", left: 23, top: 12, bottom: 12, width: 2, background: C.line }} />
        {steps.map(([t, d], i) => (
          <div key={t} style={{ display: "flex", gap: 22, position: "relative", paddingBottom: i === steps.length - 1 ? 0 : 26 }}>
            <div style={{ width: 48, minWidth: 48, height: 48, borderRadius: "50%", border: `2px solid ${C.void}`, background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontSize: 20, color: C.signal, zIndex: 1 }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.void, letterSpacing: 0.5, marginBottom: 4 }}>{t}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.smoke, lineHeight: 1.85, maxWidth: 460 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────  RITUAIS  ────────────────────────── */
const Rituais = () => {
  const princ = [
    ["Quantidade primeiro", "Gerar o máximo de ideias rudimentares antes de se agarrar à primeira promissora e desenvolvê-la até o fim."],
    ["Diverge, depois converge", "Análise e síntese em tempos separados. Abrir o leque por completo antes de fechar em um caminho."],
    ["Sem julgamento", "O medo de errar ou ser julgado é o maior inimigo da inovação. Aqui, nenhuma ideia nasce errada."],
    ["Obstáculo = oportunidade", "Otimismo como método. Não importa o tamanho do problema, o tempo curto ou a verba apertada."],
  ];
  return (
    <div style={{ padding: "56px 48px", maxWidth: 700 }}>
      <Station
        num="03" alt="6400 m" eyebrow="Como criamos juntos"
        title={<>QUANTIDADE É<br />PREMISSA PARA<br /><span style={{ color: C.signal }}>QUALIDADE.</span></>}
        intro="O brainstorm é onde divergimos antes de convergir. Facilitado sempre pelo estrategista criativo, é o ritual em que o time explora o máximo de caminhos antes de escolher um."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: C.line, marginTop: 8 }}>
        {princ.map(([t, d]) => (
          <div key={t} style={{ background: C.paper, padding: "24px 22px" }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 21, color: C.void, letterSpacing: 0.5, marginBottom: 8 }}>{t}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.smoke, lineHeight: 1.85 }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 2, background: C.signal, padding: "22px 24px" }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: "rgba(255,255,255,0.7)", letterSpacing: 2, marginBottom: 8 }}>FACILITAÇÃO</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.paper, lineHeight: 1.1, letterSpacing: 0.5 }}>
          O ESTRATEGISTA CRIATIVO CONDUZ. SEMPRE.
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────  PAPER  ────────────────────────── */
const Paper = () => {
  const povs = [
    ["Negócios / PMO", "A narrativa está alinhada ao briefing? Resolvemos o problema real de comunicação da marca? Todos os entregáveis estão contemplados?"],
    ["Pré-Produção", "Garante a viabilidade de execução — prazos e recursos — e orça o projeto formalmente. Contato constante com o planejador é essencial."],
    ["Criação", "O Diretor de Arte desdobra a proposta e constrói a base visual: moodboards, referências e o caminho para o KV e os layouts."],
    ["3D", "Traduz o conceito em estrutura espacial: ativações, fluxos de entrada, áreas de convivência e a organização dos espaços."],
  ];
  return (
    <div style={{ padding: "56px 48px", maxWidth: 720 }}>
      <Station
        num="04" alt="7000 m" eyebrow="O primeiro marco da ideia"
        title={<>ONDE A NARRATIVA<br />VIRA OFICIAL</>}
        intro="O Paper é um mix de creative brief e draft de caminhos de execução — o momento em que a narrativa criativa do projeto é oficializada pela primeira vez. Sempre um deck. Nunca um documento."
      />
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, color: C.signal, fontWeight: 700, marginBottom: 16 }}>
        QUEM LÊ O PAPER — E O QUE PROCURA
      </div>
      {povs.map(([t, d], i) => (
        <div key={t} style={{ display: "flex", gap: 18, padding: "18px 0", borderTop: i === 0 ? `1px solid ${C.line}` : "none", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.signal, minWidth: 28, paddingTop: 4, fontWeight: 700 }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.void, letterSpacing: 0.5, marginBottom: 5 }}>{t}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.smoke, lineHeight: 1.85 }}>{d}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 28, border: `1px solid ${C.line}`, padding: "20px 22px" }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, color: C.smoke, marginBottom: 12 }}>ESTRUTURA · 7 BLOCOS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Capa", "Objetivo", "Contexto & Desafios", "Insight / Oportunidade", "Conceito & Caminho Criativo", "Detalhamento", "Observações"].map((b, i) => (
            <span key={b} style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.void, border: `1px solid ${C.line}`, padding: "6px 10px", letterSpacing: 0.5 }}>
              <span style={{ color: C.signal, marginRight: 6 }}>{String(i + 1).padStart(2, "0")}</span>{b}
            </span>
          ))}
        </div>
      </div>
      <a href={TPL_PAPER} target="_blank" rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 20, background: C.void, color: C.paper, textDecoration: "none", padding: "12px 18px", fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1 }}>
        <ExternalLink size={11} color="#5C7CFF" /> ABRIR TEMPLATE NO GOOGLE SLIDES
      </a>
    </div>
  );
};

/* ─────────────────  APRESENTAÇÃO & PITCH  ───────────────── */
const Pitch = () => {
  const blocks = [
    ["Capa", "Projeto, cliente, data."],
    ["Introdução", "Qual o desafio que respondemos? Briefing, premissas, objetivos, entregáveis."],
    ["Decodificação do desafio", "O que descobrimos? Marca, público, negócio e a tensão central."],
    ["Estratégia", "O que acreditamos? Insight, direcional e pilares conectados ao brief."],
    ["Proposta criativa", "O que propomos? Conceito, Big Idea, racional e moodboard."],
    ["Detalhamento da experiência", "Como funciona? Jornada, mecânicas, ativações e operação."],
    ["Ecossistema & roadmap", "Como seguimos? Etapas, faseamento e calendarização."],
    ["Resumo executivo", "O que esperamos gerar? TL;DR, KPIs e RTBs."],
    ["Encerramento", "Fechamento inspirador e convite à ação."],
  ];
  return (
    <div style={{ padding: "56px 48px", maxWidth: 720, position: "relative" }}>
      <div style={{ position: "absolute", top: 40, right: -120, pointerEvents: "none" }}>
        <Topo w={400} h={400} opacity={0.6} />
      </div>
      <Station
        num="05" alt="7900 m" eyebrow="A defesa do projeto"
        title={<span style={{ color: C.signal }}>SHOWTIME.</span>}
        intro="O deck é onde o projeto se defende. Storytelling e visual inspirador conduzem o cliente da tensão à solução. Em live marketing, apresentar mal faz agência brilhante perder — a defesa importa tanto quanto a ideia: ritmo, segurança, estética e clareza."
      />
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, color: C.signal, fontWeight: 700, marginBottom: 16, position: "relative", zIndex: 1 }}>
        A NARRATIVA · 9 ATOS
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        {blocks.map(([t, d], i) => (
          <div key={t} style={{ display: "flex", gap: 18, padding: "14px 0", borderTop: i === 0 ? `1px solid ${C.line}` : "none", borderBottom: `1px solid ${C.line}`, alignItems: "baseline" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.line, minWidth: 34 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: C.void, letterSpacing: 0.5, minWidth: 230 }}>{t}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.smoke, lineHeight: 1.7, flex: 1 }}>{d}</span>
          </div>
        ))}
      </div>
      <a href={TPL_PITCH} target="_blank" rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 20, background: C.void, color: C.paper, textDecoration: "none", padding: "12px 18px", fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1, position: "relative", zIndex: 1 }}>
        <ExternalLink size={11} color="#5C7CFF" /> ABRIR TEMPLATE NO GOOGLE SLIDES
      </a>
    </div>
  );
};

/* ───────────────────  PITCH SCORECARD  ──────────────────── */
const Scorecard = () => {
  const [tab, setTab] = useState("liderancas");
  const [status, setStatus] = useState({});
  const [checks, setChecks] = useState({});
  const [extra, setExtra] = useState("");

  const cycle = (id) => {
    const seq = ["", "FORTE", "ATENÇÃO", "CRÍTICO"];
    const i = seq.indexOf(status[id] || "");
    setStatus((p) => ({ ...p, [id]: seq[(i + 1) % seq.length] }));
  };
  const stColor = (v) =>
    v === "FORTE" ? C.signal : v === "ATENÇÃO" ? "#B58900" : v === "CRÍTICO" ? "#C8102E" : C.line;

  const areas = [
    ["Planejamento", [
      ["p1", "Leitura estratégica da marca", "Entendemos o problema real além do briefing — momento da marca, KPI do CMO, histórico, comportamento do consumidor?"],
      ["p2", "Big Idea clara e defensável", "A ideia é simples de entender e forte para virar narrativa interna? O decisor compra a história antes da operação?"],
      ["p3", "Freshness & inovação", "Transmite repertório cultural e visão contemporânea? O cliente sente que não é \"mais do mesmo\"?"],
    ]],
    ["Criação", [
      ["c1", "Força visual do deck", "A apresentação é visualmente inspiradora e coerente com o conceito? O design reforça a ideia ou só ilustra?"],
      ["c2", "Clareza do conceito", "Moodboards e pranchas comunicam a experiência? O cliente consegue imaginar o projeto ao folhear?"],
      ["c3", "Coerência ideia × execução", "A Big Idea para de pé se for simplificada? A operação aguenta a criatividade?"],
    ]],
    ["Produção", [
      ["pr1", "Detalhamento operacional", "Cronograma, logística, fluxo de público, fornecedores, plano B e visibilidade contemplados com maturidade?"],
      ["pr2", "Locação / Venue", "A venue reforça o storytelling, melhora o fluxo e a percepção premium? Venue errada mata projeto."],
      ["pr3", "Resolver sem drama", "Transmitimos calma, contingência e senioridade? O cliente sente quem vai protegê-lo se der problema?"],
    ]],
    ["Negócios", [
      ["n1", "Orçamento inteligente", "Verba bem distribuída entre impacto, produção, tecnologia, experiência e contingência? Madura e defensável?"],
      ["n2", "Relacionamento com o decisor", "O cliente consegue defender a Sherpa42 internamente? Há confiança, histórico e sensação de parceria?"],
    ]],
    ["Projetos", [
      ["pj1", "Viabilidade de prazo e escopo", "O cronograma é realista dado o nível de complexidade? Os entregáveis estão todos mapeados?"],
      ["pj2", "Alinhamento do squad", "O time está coeso? Cada área entende seu papel no pitch e na execução? Sem ruídos internos?"],
    ]],
  ];

  const cl = [
    ["Estratégia", [["l1", "Entendemos o problema real além do briefing?"], ["l2", "A leitura estratégica está explícita no deck?"], ["l3", "O conceito é simples de explicar em uma frase?"], ["l4", "A ideia pode virar narrativa interna no cliente?"]]],
    ["Criação", [["l5", "O deck é visualmente forte e coerente com o conceito?"], ["l6", "Moodboards e pranchas comunicam a experiência?"], ["l7", "O projeto parece fresco e diferente do mercado?"]]],
    ["Produção", [["l8", "A operação transmite segurança no detalhe?"], ["l9", "Temos plano B para os pontos críticos?"]]],
    ["Negócios", [["l10", "O orçamento está bem distribuído e defensável?"], ["l11", "O cliente justifica a escolha pela Sherpa42 internamente?"]]],
    ["Projetos", [["l12", "Todos os entregáveis do briefing estão contemplados?"], ["l13", "O cronograma é factível?"], ["l14", "O time está alinhado e confiante para a defesa?"]]],
  ];
  const total = cl.reduce((a, g) => a + g[1].length, 0);
  const done = Object.values(checks).filter(Boolean).length;

  const TABS = [
    ["liderancas", "Avaliação de Lideranças"],
    ["checklist", "Checklist do Time"],
    ["extramile", "Extra Mile"],
  ];

  return (
    <div style={{ padding: "56px 48px", maxWidth: 760 }}>
      <Station
        num="06" alt="8400 m" eyebrow="Ritual de checagem antes da concorrência"
        title={<>ESTAMOS<br />FORTES PARA<br /><span style={{ color: C.signal }}>VENCER?</span></>}
        intro="Uma avaliação honesta antes do pitch. Não para burocratizar — para chegar mais forte. As lideranças conduzem, o time se autoavalia, e definimos juntos o nosso extra mile."
      />

      <div style={{ display: "flex", borderBottom: `1px solid ${C.line}`, marginBottom: 30 }}>
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", padding: "11px 18px", border: "none", cursor: "pointer", background: "transparent", color: tab === id ? C.signal : C.smoke, borderBottom: tab === id ? `2px solid ${C.signal}` : "2px solid transparent", fontWeight: tab === id ? 700 : 400, marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "liderancas" && (
        <div>
          <p style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.smoke, marginBottom: 24, lineHeight: 1.8 }}>
            Conduzida pelos heads das cinco áreas. Clique no indicador para alternar entre os estados.
          </p>
          {areas.map(([area, items]) => (
            <div key={area} style={{ marginBottom: 30 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: 1.5, color: C.signal, marginBottom: 8 }}>
                {area.toUpperCase()}
              </div>
              {items.map(([id, t, d]) => (
                <div key={id} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "13px 0", borderBottom: `1px solid ${C.line}` }}>
                  <button
                    onClick={() => cycle(id)}
                    aria-label={`Avaliar: ${t}`}
                    style={{ minWidth: 86, padding: "6px 4px", border: `1px solid ${status[id] ? stColor(status[id]) : C.line}`, background: status[id] ? stColor(status[id]) : "transparent", cursor: "pointer", fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 1, fontWeight: 700, color: status[id] ? C.paper : C.smoke, transition: "all 0.15s" }}>
                    {status[id] || "AVALIAR"}
                  </button>
                  <div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, color: C.void, marginBottom: 3 }}>{t}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.smoke, lineHeight: 1.75 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === "checklist" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
            <p style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.smoke, margin: 0, maxWidth: 380, lineHeight: 1.7 }}>
              Respondido pelo estrategista e squad antes da apresentação final.
            </p>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: C.signal, lineHeight: 1 }}>
              {done}<span style={{ color: C.line }}>/{total}</span>
            </div>
          </div>
          <div style={{ height: 3, background: C.line, marginBottom: 30 }}>
            <div style={{ height: 3, background: C.signal, width: `${(done / total) * 100}%`, transition: "width 0.3s" }} />
          </div>
          {cl.map(([g, items]) => (
            <div key={g} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: 1.5, color: C.signal, marginBottom: 6 }}>
                {g.toUpperCase()}
              </div>
              {items.map(([id, l]) => (
                <div key={id} onClick={() => setChecks((p) => ({ ...p, [id]: !p[id] }))}
                  role="checkbox" aria-checked={!!checks[id]} tabIndex={0}
                  onKeyDown={(e) => e.key === " " && setChecks((p) => ({ ...p, [id]: !p[id] }))}
                  style={{ display: "flex", gap: 13, alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.line}`, cursor: "pointer" }}>
                  <div style={{ width: 18, height: 18, minWidth: 18, border: `2px solid ${checks[id] ? C.signal : C.line}`, background: checks[id] ? C.signal : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                    {checks[id] && <Check size={11} color={C.paper} strokeWidth={3} />}
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: checks[id] ? C.smoke : C.void, textDecoration: checks[id] ? "line-through" : "none", lineHeight: 1.6 }}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === "extramile" && (
        <div>
          <div style={{ background: C.void, padding: "32px 34px", marginBottom: 26, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -90, right: -70, pointerEvents: "none" }}>
              <Topo w={280} h={280} />
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.signal, letterSpacing: 2, marginBottom: 12 }}>EXTRA MILE</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: C.paper, lineHeight: 0.95, letterSpacing: 0.5 }}>
                QUAL É O NOSSO<br />EXTRA MILE<br />NESSE PROJETO?
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.smoke2, lineHeight: 1.8, marginTop: 14, maxWidth: 380 }}>
                Se não há uma resposta clara, ainda há trabalho a fazer.
              </div>
            </div>
          </div>
          <Body max={620}>
            O Extra Mile não tem roteiro fixo — é o que decidimos, projeto a projeto, que vai além do esperado. Uma
            locação que ninguém imaginou. Um elemento de produção que nenhuma outra agência teria coragem de propor.
            Uma referência cultural cirúrgica. Um detalhe que prova que estudamos o cliente de verdade.
          </Body>
          <div style={{ border: `1px solid ${C.line}`, padding: 20 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.smoke, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
              Extra Mile deste projeto
            </div>
            <textarea
              value={extra} onChange={(e) => setExtra(e.target.value)}
              placeholder="Descreva o que este projeto tem de diferente…"
              aria-label="Descrição do Extra Mile"
              style={{ width: "100%", minHeight: 120, border: "none", outline: "none", fontFamily: FONT_MONO, fontSize: 11, lineHeight: 1.8, resize: "vertical", color: C.void, background: "transparent", padding: 0, boxSizing: "border-box" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* ────────────────────  FERRAMENTAS  ─────────────────────── */
const Ferramentas = () => {
  const [copied, setCopied] = useState(null);
  const cp = useCallback((text, id) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  }, []);

  const steps = [
    {
      num: "01", title: "BRIEFING", label: "Entenda o desafio",
      desc: "Antes de qualquer pesquisa, decodifique o que o cliente realmente quer — e o que ele precisa, mas não disse.",
      prompt: "Você é um estrategista criativo sênior de experiential marketing. Analise o briefing abaixo e responda:\n\n1. Qual é o problema real de comunicação da marca?\n2. O que o cliente disse vs. o que realmente precisa?\n3. Quais os KPIs explícitos e implícitos?\n4. Quais as principais restrições e oportunidades?\n\nBriefing: [COLE AQUI]",
    },
    {
      num: "02", title: "COMPETITIVO", label: "Mapeie o território",
      desc: "Entenda o que a marca e os concorrentes já fizeram para não repetir — e achar a oportunidade vazia.",
      prompt: "Você é um estrategista de brand experience. Para a marca [MARCA] no segmento [SEGMENTO], faça um mapeamento competitivo:\n\n1. Quais territórios criativos já estão saturados?\n2. O que ninguém está fazendo ainda?\n3. Quais tendências de experiência são relevantes para este público?\n4. Qual o ponto cego do mercado que podemos explorar?",
    },
    {
      num: "03", title: "CAMINHOS", label: "Gere hipóteses",
      desc: "Com o território mapeado, explore direcionamentos antes de convergir em um conceito.",
      prompt: "Você é um estrategista criativo. Com base no insight abaixo, gere 3 caminhos estratégicos distintos. Cada um com:\n\n- Nome do território\n- Tensão que explora\n- Direcional criativo em uma frase\n- Por que é relevante para a marca\n\nInsight: [COLE AQUI]\nMarca: [MARCA] · Público: [PÚBLICO]",
    },
    {
      num: "04", title: "ROTEIRO", label: "Estruture a narrativa",
      desc: "Monte o roteiro do deck com a lógica de storytelling que leva o cliente da tensão à solução.",
      prompt: "Você é um estrategista criativo especialista em pitch de experiential marketing. Monte o roteiro do deck seguindo:\n\n1. Introdução / Debrief\n2. Decodificação do desafio\n3. Estratégia e insight\n4. Conceito criativo\n5. Detalhamento da experiência\n6. Resumo executivo\n\nProjeto: [DESCREVA] · Conceito: [CONCEITO]",
    },
    {
      num: "05", title: "COPY", label: "Dê voz ao projeto",
      desc: "Escreva os textos do deck com o tom certo — inspirador, claro e fiel à marca.",
      prompt: "Você é um redator estratégico de experiential marketing. Escreva os textos do deck:\n\n- Tom: [TOM DA MARCA]\n- Headlines impactantes por seção\n- Descrições claras das mecânicas\n- Frase de fechamento inspiradora\n\nSeções: [LISTE] · Conceito: [CONCEITO]",
    },
  ];

  return (
    <div style={{ padding: "56px 48px", maxWidth: 760 }}>
      <Station
        num="07" alt="8650 m" eyebrow="O cinto de utilidades do estrategista"
        title={<>FERRAMENTAS</>}
        intro="O repertório ferramental é o cinto de utilidades do estrategista. Recursos vivos, prontos para o dia a dia. Comece pela decupagem."
      />
      <div style={{ background: C.void, padding: "22px 28px", marginBottom: 26, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: -110, right: -60, pointerEvents: "none" }}>
          <Topo w={260} h={260} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.signal, letterSpacing: 2, marginBottom: 6 }}>FERRAMENTA 01</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.paper, letterSpacing: 0.5 }}>FRAMEWORK DE DECUPAGEM ESTRATÉGICA</div>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.smoke, textAlign: "right", lineHeight: 1.6, position: "relative", zIndex: 1, minWidth: 60 }}>
          5 ETAPAS<br />5 PROMPTS
        </div>
      </div>

      {steps.map((s) => (
        <div key={s.num} style={{ marginBottom: 12, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.signal}` }}>
          <div style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.signal, letterSpacing: 1 }}>{s.num}</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.void, letterSpacing: 0.5 }}>{s.title}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.smoke }}>— {s.label}</span>
            </div>
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.smoke, lineHeight: 1.8, margin: "0 0 14px", maxWidth: 540 }}>{s.desc}</p>
            <div style={{ background: C.line2, padding: "14px 16px", position: "relative" }}>
              <pre style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#3a3a3a", lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", paddingRight: 84 }}>
                {s.prompt}
              </pre>
              <button onClick={() => cp(s.prompt, s.num)}
                aria-label={`Copiar prompt ${s.title}`}
                style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 5, background: copied === s.num ? C.signal : C.void, color: C.paper, border: "none", padding: "6px 10px", fontFamily: FONT_MONO, fontSize: 8, cursor: "pointer", letterSpacing: 1, transition: "background 0.2s" }}>
                {copied === s.num ? <><Check size={9} /> COPIADO</> : <><Copy size={9} /> COPIAR</>}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* FERRAMENTA 02 — HMW */}
      <div style={{ background: C.void, padding: "22px 28px", margin: "26px 0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: -110, right: -60, pointerEvents: "none" }}>
          <Topo w={260} h={260} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#5C7CFF", letterSpacing: 2, marginBottom: 6 }}>FERRAMENTA 02</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.paper, letterSpacing: 0.5 }}>HOW MIGHT WE · COMO PODEMOS?</div>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.smoke, textAlign: "right", lineHeight: 1.6, position: "relative", zIndex: 1, minWidth: 60 }}>
          PESQUISA →<br />PERGUNTA
        </div>
      </div>
      <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.smoke, lineHeight: 1.85, maxWidth: 560, marginBottom: 18 }}>
        Transforma pesquisa em perguntas que destravam ideias. Você não salta da descoberta para a solução. Passa pelo insight e reescreve o desafio como uma pergunta aberta.
      </p>
      {[
        ["01", "Pesquise", "Desk e field research. Identifique as necessidades e motivações do público antes de qualquer ideia."],
        ["02", "Crie cartões de insight", "Organize as descobertas em três camadas: aprendizados, temas e insights."],
        ["03", "Formule as perguntas", "Reescreva cada insight como \"Como podemos…?\". A pergunta certa já carrega a direção da resposta."],
      ].map(([n, t, d]) => (
        <div key={n} style={{ display: "flex", gap: 16, padding: "14px 0", borderTop: n === "01" ? `1px solid ${C.line}` : "none", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.signal, minWidth: 30 }}>{n}</span>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: C.void, letterSpacing: 0.5, marginBottom: 4 }}>{t}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.smoke, lineHeight: 1.8 }}>{d}</div>
          </div>
        </div>
      ))}
      <div style={{ background: C.line2, padding: "16px 18px", marginTop: 14 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.smoke, letterSpacing: 1.5, marginBottom: 8 }}>EXEMPLO</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#3a3a3a", lineHeight: 1.8 }}>
          Insight: "as pessoas têm medo de voltar a eventos, mas sentem falta do encontro presencial."<br />
          <span style={{ color: C.signal }}>↳ Como podemos</span> devolver a segurança sem matar a emoção do ao vivo?
        </div>
      </div>

      {/* KIT DE IDEAÇÃO */}
      <div style={{ marginTop: 40, marginBottom: 16 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.signal, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>KIT DE IDEAÇÃO</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: C.void, letterSpacing: 0.5, marginBottom: 8 }}>TÉCNICAS PARA A SESSÃO</div>
        <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.smoke, lineHeight: 1.8, maxWidth: 560 }}>
          Dinâmicas curtas para abrir, gerar e priorizar. Use conforme o momento do brainstorm. Facilitação sempre com o estrategista criativo.
        </p>
      </div>
      {[
        ["QUEBRA-GELO", "Reverse Brainstorming", "Em vez de resolver o problema, liste como piorá-lo. A inversão destrava o grupo e expõe o óbvio. Abre a sessão sem pressão."],
        ["GERAÇÃO", "SWAP Ideation", "Cada pessoa começa uma ideia e passa adiante. O grupo desenvolve o que o outro iniciou. O ego fica na porta."],
        ["GERAÇÃO", "Galeria de Ideias", "Espalhe as ideias na parede e circule como numa exposição. Cada um comenta e constrói sobre o que vê."],
        ["PRIORIZAÇÃO", "Dot Voting", "Cada participante distribui votos fixos entre as ideias. Rápido e democrático. Corta a dominância de voz."],
        ["PRIORIZAÇÃO", "Matriz de Decisão", "Cruze impacto e esforço num quadrante. Mostra onde a ideia vale o investimento e o que fica para depois."],
      ].map(([cat, name, desc]) => (
        <div key={name} style={{ display: "flex", gap: 16, padding: "15px 0", borderTop: `1px solid ${C.line}`, alignItems: "flex-start" }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 7.5, color: C.signal, letterSpacing: 1, fontWeight: 700, minWidth: 86, paddingTop: 4 }}>{cat}</span>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.void, letterSpacing: 0.5, marginBottom: 3 }}>{name}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.smoke, lineHeight: 1.8 }}>{desc}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 28, border: `1px dashed ${C.line}`, padding: "16px 20px", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.smoke, letterSpacing: 1.5 }}>
          NOVAS FERRAMENTAS ENTRAM AQUI CONFORME O TIME EVOLUI O REPERTÓRIO.
        </span>
      </div>
    </div>
  );
};

/* ───────────────────  PORTFÓLIO DE INOVAÇÃO  ────────────── */
const Portfolio = () => {
  const fronts = [
    {
      icon: Flame, name: "IGNITE", tag: "Proativos · Proprietários",
      desc: "A frente proativa da Sherpa para antecipar oportunidades e provocar novas conversas com o mercado. A partir de insights, comportamentos e sinais culturais, propomos ideias com potencial de negócio antes de qualquer briefing ou concorrência.",
      value: "Geração de negócios e reforço do posicionamento da Sherpa.",
      residual: "Ideias originais que criam conexões e abrem portas com clientes e prospects.",
    },
    {
      icon: Radar, name: "RADAR", tag: "Cool Hunting · Trend Report",
      desc: "A curadoria de conteúdo e tendências em experiências de marca. Uma editoria que mapeia sinais, comportamentos emergentes e referências criativas, sempre com uma lente original, aplicável e inspiradora.",
      value: "Construção de autoridade e conexão com novos públicos.",
      residual: "Conteúdo proprietário que abastece a cultura da agência e inspira clientes e parceiros.",
    },
    {
      icon: Tent, name: "CAMP", tag: "Eventos · Conteúdos",
      desc: "A plataforma de eventos proprietários para dialogar com o mercado de forma inspiradora, colaborativa e ousada. Talks, painéis e roundtables que colocam marcas, especialistas e clientes em conversas sobre o futuro do mercado.",
      value: "Reforço de relacionamento e posicionamento da Sherpa.",
      residual: "Talks, painéis e experiências para clientes e parceiros de negócio.",
    },
    {
      icon: Compass, name: "COMPASS", tag: "Workshop Estratégico · Sprint",
      desc: "O produto estratégico que ajuda marcas a enxergar com clareza seus desafios e desenhar os próximos passos. Metodologia proprietária que combina dados, repertório criativo e benchmarks para transformar perguntas em planos de experiência.",
      value: "Receita incremental, reforço de posicionamento e autoridade.",
      residual: "Sprint de ideação que explora caminhos criativos para o desafio da marca.",
    },
  ];
  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ background: C.void, padding: "56px 48px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -90, right: -120, pointerEvents: "none" }}>
          <Topo w={560} h={560} opacity={0.7} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, color: "#5C7CFF", fontWeight: 700 }}>ESTAÇÃO 08</span>
            <span style={{ width: 24, height: 1, background: C.lineDark }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, color: C.smoke }}>SUMMIT</span>
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(38px, 6vw, 60px)", lineHeight: 0.92, color: C.paper, margin: 0, letterSpacing: 0.5 }}>
            DA ESTRATÉGIA<br />AO CRAFT <span style={{ color: C.signal }}>∞</span>
          </h1>
          <p style={{ fontFamily: FONT_MONO, fontSize: 11, lineHeight: 2, color: C.smoke2, maxWidth: 540, marginTop: 22 }}>
            A inovação é um mindset, um movimento cultural. É como seguimos à frente: olhando para o futuro e abrindo
            novos caminhos de crescimento para a agência. O Portfólio de Inovação reúne quatro frentes proprietárias
            que pavimentam esse caminho. Cada uma abre uma fonte de receita, reforça o posicionamento da Sherpa e
            cria sinergia de negócio.
          </p>
        </div>
      </div>

      <div style={{ padding: "44px 48px" }}>
        {fronts.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.name} style={{ border: `1px solid ${C.line}`, marginBottom: 16 }}>
              <div style={{ padding: "26px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, minWidth: 44, background: C.void, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={C.signal} strokeWidth={1.6} />
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: C.void, letterSpacing: 1, lineHeight: 1 }}>{f.name}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.signal, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 }}>{f.tag}</div>
                  </div>
                </div>
                <p style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#3a3a3a", lineHeight: 1.9, margin: "0 0 18px" }}>{f.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: C.line }}>
                  <div style={{ background: C.line2, padding: "14px 16px" }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 7.5, color: C.signal, letterSpacing: 1.5, fontWeight: 700, marginBottom: 7 }}>PROPOSTA DE VALOR</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.void, lineHeight: 1.7 }}>{f.value}</div>
                  </div>
                  <div style={{ background: C.line2, padding: "14px 16px" }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 7.5, color: C.smoke, letterSpacing: 1.5, fontWeight: 700, marginBottom: 7 }}>RESIDUAL</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: "#3a3a3a", lineHeight: 1.7 }}>{f.residual}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ background: C.signal, padding: "24px 28px", marginTop: 8 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.paper, letterSpacing: 0.5, lineHeight: 1.05 }}>QUATRO FRENTES, UM MOVIMENTO.</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.paper, lineHeight: 1.8, marginTop: 8, maxWidth: 480 }}>
            Produtos e iniciativas que abrem receita, reforçam a marca e criam sinergia de negócio. Let's keep climbing.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────  SIDEBAR  ────────────────────────── */
const Sidebar = ({ active, go, isMobile, onClose }) => {
  const [hov, setHov] = useState(null);
  const activeIdx = NAV.findIndex((n) => n.id === active);

  return (
    <aside
      aria-label="Navegação"
      style={{
        width: 256, minWidth: 256, background: C.void,
        display: "flex", flexDirection: "column",
        height: "100vh", overflow: "hidden",
        ...(isMobile ? { position: "fixed", left: 0, top: 0, zIndex: 50 } : { position: "relative" }),
      }}
    >
      {/* header */}
      <div style={{ padding: "22px 22px 18px", borderBottom: `1px solid ${C.lineDark}`, position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => go("home")}
          aria-label="Ir para o início"
          style={{ background: "transparent", border: "none", cursor: "pointer", textAlign: "left", flex: 1 }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.paper, letterSpacing: 2 }}>
            SHERPA<span style={{ color: C.signal }}>42</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
            <LiveDot />
            <span style={{ fontFamily: FONT_MONO, fontSize: 7.5, color: C.smoke, letterSpacing: 2.5 }}>
              STRATEGY OS · GROUND CONTROL
            </span>
          </div>
        </button>
        {isMobile && (
          <button onClick={onClose} aria-label="Fechar menu"
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 0 4px 8px", display: "flex", alignItems: "center" }}>
            <X size={16} color={C.smoke} />
          </button>
        )}
      </div>

      {/* ascent route */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 0", position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 7.5, color: "#333", letterSpacing: 2, padding: "0 22px 10px" }}>
          ROTA DE SUBIDA
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 31, top: 16, bottom: 16, width: 1, background: C.lineDark }} />
          {activeIdx >= 0 && (
            <div style={{ position: "absolute", left: 31, top: 16, width: 1, background: C.signal, height: `calc(${(activeIdx / (NAV.length - 1)) * 100}%)`, transition: "height 0.3s" }} />
          )}
          {NAV.map((s, i) => {
            const on = active === s.id;
            const passed = i <= activeIdx;
            return (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                onMouseEnter={() => setHov(s.id)}
                onMouseLeave={() => setHov(null)}
                aria-label={`${s.num} — ${s.label} · ${s.alt}`}
                aria-current={on ? "page" : undefined}
                style={{ width: "100%", padding: "9px 22px", textAlign: "left", border: "none", background: on ? C.ash2 : hov === s.id ? C.ash : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "background 0.12s", position: "relative" }}
              >
                <span style={{ width: 11, height: 11, minWidth: 11, borderRadius: "50%", border: `2px solid ${passed ? C.signal : "#2a2a2a"}`, background: on ? C.signal : C.void, zIndex: 1, transition: "all 0.2s" }} />
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, color: passed ? C.signal : "#2e2e2e", minWidth: 18 }}>{s.num}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: on ? C.paper : hov === s.id ? C.smoke2 : C.smoke, flex: 1, lineHeight: 1.3, transition: "color 0.12s" }}>{s.label}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 7, color: "#3a3a3a", letterSpacing: 0.5 }}>{s.alt}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* quick access */}
      <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.lineDark}`, position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 7, color: "#333", letterSpacing: 2, textTransform: "uppercase", marginBottom: 9 }}>
          Acesso Rápido
        </div>
        {[["Template Paper", TPL_PAPER], ["Template Pitch", TPL_PITCH]].map(([l, href]) => (
          <a key={l} href={href} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, textDecoration: "none" }}>
            <ExternalLink size={8} color="#5C7CFF" />
            <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.smoke2, letterSpacing: 0.5 }}>{l}</span>
          </a>
        ))}
        <div style={{ fontFamily: FONT_MONO, fontSize: 6.5, color: "#2a2a2a", marginTop: 10, letterSpacing: 1 }}>{COORD}</div>
      </div>
    </aside>
  );
};

/* ───────────────────────  APP  ──────────────────────────── */
const TOPBAR_H = 52;

export default function StrategyOS() {
  useFonts();
  const [active, setActive] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const go = useCallback((id) => {
    setActive(id);
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  /* Close sidebar on Escape */
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;
    const h = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isMobile, sidebarOpen]);

  const render = () => {
    switch (active) {
      case "home":        return <Home go={go} />;
      case "manifesto":   return <Manifesto />;
      case "como":        return <Como />;
      case "rituais":     return <Rituais />;
      case "paper":       return <Paper />;
      case "pitch":       return <Pitch />;
      case "scorecard":   return <Scorecard />;
      case "ferramentas": return <Ferramentas />;
      case "portfolio":   return <Portfolio />;
      default:            return <Home go={go} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.paper, overflow: "hidden" }}>

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: TOPBAR_H, background: C.void, zIndex: 30, display: "flex", alignItems: "center", padding: "0 16px", gap: 14, borderBottom: `1px solid ${C.lineDark}` }}>
          <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center" }}>
            <Menu size={18} color={C.paper} />
          </button>
          <button onClick={() => go("home")} aria-label="Início"
            style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: FONT_DISPLAY, fontSize: 18, color: C.paper, letterSpacing: 2 }}>
            SHERPA<span style={{ color: C.signal }}>42</span>
          </button>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <LiveDot />
            <span style={{ fontFamily: FONT_MONO, fontSize: 7, color: C.smoke, letterSpacing: 2 }}>STRATEGY OS</span>
          </div>
        </div>
      )}

      {/* Sidebar — desktop always visible; mobile as overlay */}
      {(!isMobile || sidebarOpen) && (
        <>
          {isMobile && (
            <div
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 40 }}
            />
          )}
          <Sidebar active={active} go={go} isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
        </>
      )}

      <main
        ref={mainRef}
        id="main-content"
        style={{ flex: 1, overflowY: "auto", background: C.paper, ...(isMobile ? { paddingTop: TOPBAR_H } : {}) }}
      >
        {render()}
      </main>
    </div>
  );
}
