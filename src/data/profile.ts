/**
 * Curated profile content.
 *
 * Deliberately weighted toward capability and evidence rather than biography:
 * what he can build, what he has shipped, what he has won. Anything that can
 * be read off the GitHub API lives in data/github.json instead — never both.
 */
export const identity = {
  name: "JOEL D'LIMA",
  handle: 'JoelDlima',
  role: 'Electronics & Computer Engineering',
  /** One line. It has to earn its place next to a 82px name. */
  pitch: 'Embedded + full-stack. ESP32/C++ firmware, React/TypeScript/Node, AI features.',
  /** The plain-language version of the pitch, for the reader who did not
   *  unpack the first line: what he builds and where he is doing it now.
   *  Recruiter guidance is blunt about this — personality plus clarity. */
  focus:
    'Shipped 6 products, 1 recognized by Lenovo. ' +
    'Electronics & Computer Engineering · ECOMP 27.',
  location: 'Goa, India',
  status: 'Software Engineering Intern @ Visteon',
  email: 'joeldlima123@gmail.com',
  linkedin: 'www.linkedin.com/in/joel-dlima-9b0244292',
  portfolio: 'https://joel-portfolio-eight.vercel.app/work',
} as const

// ---------------------------------------------------------------------------
// Capability
// ---------------------------------------------------------------------------

export interface Domain {
  key: string
  label: string
  /** One clause on what he actually does in this domain. */
  note: string
  tools: string[]
}

export const domains: Domain[] = [
  {
    key: 'embedded',
    label: 'Embedded',
    note: 'Boards, buses and the firmware on top',
    tools: ['ESP32', 'ESP32-CAM', 'C++', 'C', 'PlatformIO', 'Arduino', 'I2C / SPI / UART', 'Verilog'],
  },
  {
    key: 'frontend',
    label: 'Interface',
    note: 'Typed React front ends, built with Vite',
    tools: ['React', 'TypeScript', 'JavaScript', 'Vite', 'Tailwind', 'HTML / CSS'],
  },
  {
    key: 'backend',
    label: 'Services & Data',
    note: 'APIs, storage and the glue between them',
    tools: ['Python', 'Node.js', 'Flask', 'Supabase', 'PostgreSQL', 'REST'],
  },
  {
    key: 'ai',
    label: 'AI Systems',
    note: 'Model APIs wired into real products',
    tools: ['Gemini API', 'Groq', 'Ollama', 'MediaPipe', 'TensorFlow', 'NLP'],
  },
  {
    key: 'tooling',
    label: 'Ship & Operate',
    note: 'Getting it built, deployed and kept alive',
    tools: ['Git', 'GitHub Actions', 'Vercel', 'Google Cloud', 'Linux'],
  },
]

// ---------------------------------------------------------------------------
// Work
// ---------------------------------------------------------------------------

export interface Project {
  /** Repo name, or null when the work lives in a private repo. */
  repo: string | null
  title: string
  /** Two lines maximum once wrapped. Say what it does, not what it aspires to. */
  blurb: string
  stack: string[]
  demo?: string
  /** Shown as a corner marker on the card. */
  tag?: string
}

export const featured: Project[] = [
  {
    repo: null,
    title: 'Smart Well Management',
    blurb:
      'TDS, turbidity and pH telemetry from an ESP32 to a live dashboard.',
    stack: ['C++', 'ESP32', 'React'],
    tag: 'EMBEDDED',
  },
  {
    repo: null,
    title: 'UCLI',
    blurb:
      'Unified command-line interface for streamlined dev workflows.',
    stack: ['Python', 'CLI'],
    tag: 'TOOLING',
  },
  {
    repo: null,
    title: 'AgroProfit',
    blurb:
      'Mandi price intelligence with a Gemini advisory layer.',
    stack: ['Python', 'React', 'Gemini'],
    tag: 'AI',
  },
  {
    repo: null,
    title: 'Palliative Care',
    blurb:
      'SpO2, ECG and fall-detection telemetry with threshold emergency alerts.',
    stack: ['C++', 'ESP32', 'React'],
    tag: 'HEALTH',
  },
]

/** Private or team work worth naming but not linking. */
export const alsoBuilt: { title: string; blurb: string }[] = [
  {
    title: 'AgroProfit',
    blurb: 'Mandi price intelligence with a Gemini advisory layer',
  },
  {
    title: 'Smart Eco-Well',
    blurb: 'TDS, turbidity and pH telemetry from an ESP32 to a live dashboard',
  },
  {
    title: 'Palliative Care',
    blurb: 'SpO2, ECG and fall-detection telemetry with threshold emergency alerts',
  },
  {
    title: 'Lead Genius',
    blurb: 'NLP role detection plus DNS MX validation over a search pipeline',
  },
  {
    title: 'RideScore',
    blurb: 'On-device driving-behaviour scoring from ESP32 inertial data',
  },
]

// ---------------------------------------------------------------------------
// Track record
// ---------------------------------------------------------------------------

export interface Award {
  rank: string
  title: string
  detail: string
}

export const awards: Award[] = [
  {
    rank: 'TOP 25',
    title: 'HackIndia',
    detail: 'State level, Goa',
  },
  {
    rank: '3RD',
    title: 'Smart India Hackathon',
    detail: 'Software track, college level',
  },
  {
    rank: '3RD',
    title: 'Smart India Hackathon',
    detail: 'Hardware track, college level',
  },
  {
    rank: 'AWARDED',
    title: 'Lenovo LEAP Culmination',
    detail: 'Recognised for AI-driven agriculture',
  },
]

export interface Role {
  org: string
  title: string
  period: string
  note: string
  current?: boolean
}

export const roles: Role[] = [
  {
    org: 'Visteon',
    title: 'Software Engineering Intern',
    period: 'Jul – Oct 2026',
    note: 'Automotive embedded software, PPO track',
    current: true,
  },
  {
    org: 'EpicForce',
    title: 'Software Developer',
    period: 'Feb – Jun 2026',
    note: 'Rebuilt the InnerVerse dashboard and quiz flow in React',
  },
]

export const academics = {
  cgpa: '9.7',
  scale: '/ 10',
  degree: 'B.E. Electronics & Computer Engineering',
  institution: 'Agnel Institute of Technology and Design',
  graduating: '2027',
  extra: '2× Lenovo 8-week programs · AI and Web Technologies',
} as const
