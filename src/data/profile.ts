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
  pitch: 'Firmware on the board, the API in between, the interface people touch.',
  location: 'Goa, India',
  status: 'Software Engineering Intern @ Visteon',
  email: 'joeldlima123@gmail.com',
  linkedin: 'joel-dlima',
  portfolio: 'https://portfolio-v1-seven-nu.vercel.app',
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
    repo: 'BharatVanni-AI',
    title: 'BharatVaani AI',
    blurb:
      'Turns government publications into audiobooks. Vite front end, Python serverless back end, Gemini multimodal TTS.',
    stack: ['JavaScript', 'Vite', 'Python', 'Gemini', 'Supabase'],
    tag: 'AI',
  },
  {
    repo: 'esp32_project',
    title: 'ESP32-CAM Hand Detection',
    blurb:
      'Board streams video over Wi-Fi, MediaPipe counts raised fingers, LEDs follow. Finds itself on the network unaided.',
    stack: ['C++', 'PlatformIO', 'Python', 'MediaPipe'],
    tag: 'EMBEDDED',
  },
  {
    repo: 'Nexus-AI',
    title: 'Nexus AI',
    blurb:
      'Windows desktop assistant. Command automation and macro replay, with an explicit confirm step before anything risky runs.',
    stack: ['Python', 'Groq', 'Windows'],
    tag: 'DESKTOP',
  },
  {
    repo: 'CropGuardv2',
    title: 'CropGuard',
    blurb:
      'Crop disease detection that answers in language a farmer can act on, not a confidence score.',
    stack: ['TypeScript', 'React', 'Tailwind'],
    demo: 'https://crop-guardv2.vercel.app',
    tag: 'AI',
  },
  {
    repo: 'MindCare_TeamNexus',
    title: 'MindCare',
    blurb:
      'Mental health platform for campuses — AI companion, counsellor booking and moderated peer support.',
    stack: ['TypeScript', 'React', 'Supabase'],
    tag: 'PLATFORM',
  },
  {
    repo: 'yt-cli',
    title: 'yt-cli',
    blurb:
      'Terminal YouTube client over yt-dlp. Interactive menu, or scriptable flags for automation. Streams straight to VLC.',
    stack: ['Python', 'yt-dlp'],
    tag: 'CLI',
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
