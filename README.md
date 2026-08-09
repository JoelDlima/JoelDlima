<!-- AGENT FACTS (Joel Dlima / github.com/JoelDlima):
     Electronics & Computer Engineering student, Agnel Institute of Technology and Design, Goa.
     CGPA 9.7 (Sem I-III: 10.0, Sem IV: 9.81, Sem V: 9.41), graduating 2027.
     SWE intern at Visteon (Jul-Oct 2026, PPO track). Internship has started.
     Previously 4 months React at EpicForce (InnerVerse).
     Domains: embedded IoT (ESP32), full-stack (React/TS/Node), AI tooling (Gemini API).
     Public repos: Road_SOS, CropGuardv2, esp32_project.
     Contact: joeldlima123@gmail.com | Portfolio: https://portfolio-v1-seven-nu.vercel.app
-->

<!-- ══════════════════════════ HERO ══════════════════════════ -->

<p align="center">
  <img
    src="./assets/joel-orbit-header.svg"
    alt="Joel D'Lima — Electronics and Computer Engineering. Embedded systems, full-stack software, AI tooling. Sensor to cloud to interface."
    width="100%"
  />
</p>

<p align="center">
  Electronics &amp; Computer Engineering &nbsp;·&nbsp; Embedded Systems &nbsp;·&nbsp; Full-Stack &nbsp;·&nbsp; AI
</p>

<p align="center">
  <a href="https://github.com/JoelDlima">GitHub</a> &nbsp;·&nbsp;
  <a href="https://linkedin.com/in/joel-dlima">LinkedIn</a> &nbsp;·&nbsp;
  <a href="mailto:joeldlima123@gmail.com">Email</a> &nbsp;·&nbsp;
  <a href="https://portfolio-v1-seven-nu.vercel.app">Portfolio</a>
</p>

---

<!-- ══════════════════════════ SIGNAL ══════════════════════════ -->

## Signal

I build systems that connect the physical world to useful software — ESP32 sensor arrays to cloud pipelines to AI-assisted interfaces. Most of my projects run the full path from bare pin to user screen.

---

<!-- ══════════════════════════ CURRENT ORBIT ══════════════════════════ -->

## Current orbit

| | |
|:--|:--|
| **Institution** | Agnel Institute of Technology and Design, Goa |
| **Degree** | B.E. Electronics and Computer Engineering · Class of 2027 |
| **CGPA** | 9.7 &nbsp;·&nbsp; Sem I–III: 10.0 · Sem IV: 9.81 · Sem V: 9.41 |
| **Now** | <img src="https://img.shields.io/badge/Visteon-0057A8?style=flat-square&logoColor=white"/> Software Engineering Intern · Jul–Oct 2026 · Panjim, Goa |
| **Track** | PPO evaluation at end of term |

---

<!-- ══════════════════════════ SYSTEMS MAP ══════════════════════════ -->

## Systems I work across

```mermaid
flowchart LR
    A["Physical world\nSensors / environment"] --> B["Edge device\nESP32 · C/C++"]
    B --> C["Telemetry\nI2C · SPI · UART · Wi-Fi"]
    C --> D["Cloud\nSupabase · REST APIs"]
    D --> E["Interfaces\nReact · TypeScript"]
    D --> F["AI advisory\nGemini API · Ollama"]
    F --> E

    style A fill:#1e2d12,stroke:#f6bd60,color:#cdd9e5
    style B fill:#1e2d12,stroke:#f6bd60,color:#cdd9e5
    style C fill:#1b263b,stroke:#8ecae6,color:#cdd9e5
    style D fill:#1b263b,stroke:#8ecae6,color:#cdd9e5
    style E fill:#12343b,stroke:#8ecae6,color:#cdd9e5
    style F fill:#2a1a4a,stroke:#b8a1ff,color:#cdd9e5
```

<sub>Amber → hardware &nbsp;·&nbsp; Cyan → software &nbsp;·&nbsp; Violet → AI</sub>

---

<!-- ══════════════════════════ SELECTED MISSIONS ══════════════════════════ -->

## Selected missions

> Private repos — walk-through available on request.

---

### Smart Eco-Well &nbsp; `Oct – Nov 2025`
**IoT water-quality monitoring system**

<p>
  <img src="https://img.shields.io/badge/ESP32-E7352C?style=flat-square&logo=espressif&logoColor=white"/>
  <img src="https://img.shields.io/badge/C%2B%2B-00599C?style=flat-square&logo=cplusplus&logoColor=white"/>
  <img src="https://img.shields.io/badge/I2C%20·%20SPI%20·%20UART-4B5563?style=flat-square&logo=arduino&logoColor=white"/>
  <img src="https://img.shields.io/badge/Wi--Fi%20Telemetry-0ea5e9?style=flat-square&logo=wifi&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cloud%20Dashboard-22D3EE?style=flat-square&logo=googlecloud&logoColor=white"/>
</p>

Interfaced TDS, turbidity, and pH sensors with an ESP32 over multiple serial protocols. Streamed live readings to a cloud database over Wi-Fi. Built a remote monitoring dashboard — water safety without a site visit.

```mermaid
graph LR
    A["TDS · Turbidity · pH"] -- "I2C / SPI / UART" --> B["ESP32"]
    B -- "Wi-Fi" --> C["Cloud DB"]
    C --> D["Live Dashboard"]

    style A fill:#1e2d12,stroke:#f6bd60,color:#cdd9e5
    style B fill:#1e2d12,stroke:#f6bd60,color:#cdd9e5
    style C fill:#1b263b,stroke:#8ecae6,color:#cdd9e5
    style D fill:#12343b,stroke:#8ecae6,color:#cdd9e5
```

**Hard part:** Stable simultaneous reads across three serial protocols on a single MCU without timing conflicts.

---

### AgroProfit &nbsp; `Sep 2025 – Jan 2026`
**AI agricultural market platform**

<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/Gemini%20API-8E75B2?style=flat-square&logo=googlegemini&logoColor=white"/>
</p>

Full-stack platform aggregating government mandi price data via automated synchronization pipelines. A Gemini advisory layer adds contextual crop recommendations — farmers see both the price and what to do about it.

```mermaid
graph LR
    A["Govt. mandi data"] --> B["Sync pipeline"]
    B --> C["Supabase"]
    C --> D["React dashboard"]
    C --> E["Gemini advisory"]
    E --> D

    style A fill:#1b263b,stroke:#8ecae6,color:#cdd9e5
    style B fill:#1b263b,stroke:#8ecae6,color:#cdd9e5
    style C fill:#12343b,stroke:#3FCF8E,color:#cdd9e5
    style D fill:#12343b,stroke:#8ecae6,color:#cdd9e5
    style E fill:#2a1a4a,stroke:#b8a1ff,color:#cdd9e5
```

**Result:** Recognized at the Lenovo LEAP Culmination Event for AI-driven innovation in agriculture.

---

### Palliative Care &nbsp; `Sep – Oct 2025`
**Remote patient monitoring prototype**

<p>
  <img src="https://img.shields.io/badge/ESP32-E7352C?style=flat-square&logo=espressif&logoColor=white"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/IoT%20Sensors-f6bd60?style=flat-square&logo=arduino&logoColor=black"/>
  <img src="https://img.shields.io/badge/Cloud-4285F4?style=flat-square&logo=googlecloud&logoColor=white"/>
  <img src="https://img.shields.io/badge/Role--based%20Access-6366F1?style=flat-square&logoColor=white"/>
</p>

> Prototype for remote monitoring and alerting. Not for clinical diagnosis or treatment.

SpO₂, HR, ECG, and fall-detection sensors → continuous vitals capture → cloud dashboard with role-based access, threshold alerts, geospatial tracking, and an AI caregiver assistant.

```mermaid
graph LR
    A["SpO₂ · HR · ECG · Fall sensors"] -- "ESP32" --> B["Edge device"]
    B --> C["Cloud dashboard\n(role-based)"]
    C --> D["Threshold alerts"]
    C --> E["AI assistant"]

    style A fill:#1e2d12,stroke:#f6bd60,color:#cdd9e5
    style B fill:#1e2d12,stroke:#f6bd60,color:#cdd9e5
    style C fill:#1b263b,stroke:#8ecae6,color:#cdd9e5
    style D fill:#3b1212,stroke:#ff6b6b,color:#cdd9e5
    style E fill:#2a1a4a,stroke:#b8a1ff,color:#cdd9e5
```

**Hard part:** Alerting logic tuned to suppress sensor-noise false positives without losing sensitivity where it matters.

---

### Lead Genius &nbsp; `Nov 2025 – Jan 2026`
**Automated lead-generation pipeline**

<p>
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/NLP-6366F1?style=flat-square&logoColor=white"/>
  <img src="https://img.shields.io/badge/Serper%20API-4B5563?style=flat-square&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/DNS%20MX%20Validation-22D3EE?style=flat-square&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSV%20%2F%20JSON%20Export-3FCF8E?style=flat-square&logoColor=white"/>
</p>

Automated pipeline: web search → multi-layer NLP role detection → DNS MX-validated email generation → clean structured exports. Verified contacts, not guesses.

```mermaid
graph LR
    A["Web search\nSerper API"] --> B["NLP role detection\nmulti-layer"]
    B --> C["Email pattern gen"]
    C --> D["DNS MX validation"]
    D --> E["CSV / JSON export"]

    style A fill:#1b263b,stroke:#8ecae6,color:#cdd9e5
    style B fill:#2a1a4a,stroke:#b8a1ff,color:#cdd9e5
    style C fill:#2a1a4a,stroke:#b8a1ff,color:#cdd9e5
    style D fill:#1b263b,stroke:#8ecae6,color:#cdd9e5
    style E fill:#12343b,stroke:#3FCF8E,color:#cdd9e5
```

**Hard part:** Ambiguous titles like "Head of Growth" vs "Growth Analyst" needed multiple NLP passes before the right email pattern could be selected.

---

<details>
<summary><b>Also built at hackathons</b></summary>

<br/>

**RideScore** &nbsp;
<img src="https://img.shields.io/badge/ESP32-E7352C?style=flat-square&logo=espressif&logoColor=white"/>
<img src="https://img.shields.io/badge/C%2B%2B-00599C?style=flat-square&logo=cplusplus&logoColor=white"/>

Real-time driving-behaviour scoring from ESP32 inertial sensor data — acceleration, braking, and cornering classified on-device.

<br/>

**AccessMate** &nbsp;
<img src="https://img.shields.io/badge/GDG%20Goa-4285F4?style=flat-square&logo=google&logoColor=white"/>

Accessibility-focused app built at GDG Goa's *Build for All* hackathon.

</details>

---

<!-- ══════════════════════════ FLIGHT LOG ══════════════════════════ -->

## Flight log

### Visteon Corporation
**Software Engineering Intern · Jul 2026–Oct 2026 · Panjim, Goa**

<p>
  <img src="https://img.shields.io/badge/Automotive%20Electronics-0057A8?style=flat-square&logoColor=white"/>
  <img src="https://img.shields.io/badge/Embedded%20Software-f6bd60?style=flat-square&logoColor=black"/>
  <img src="https://img.shields.io/badge/PPO%20Track-3FCF8E?style=flat-square&logoColor=white"/>
</p>

Global automotive electronics and software supplier. Internship runs during the first two months of final year; selected on PPO evaluation track.

Working within production-oriented automotive embedded and software engineering workflows.

---

### EpicForce (InnerVerse)
**Software Developer · Feb 2026–Jun 2026 · Remote**

<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/WordPress%20→%20React%20migration-21759B?style=flat-square&logo=wordpress&logoColor=white"/>
</p>

Early-stage startup building [InnerVerse](https://myinnerverse.in) — a self-awareness and personal-growth platform.

- Rebuilt dashboard UI and quiz components in React, improving usability
- Scoped the migration path: WordPress → React · Node.js · Supabase

---

<!-- ══════════════════════════ OPEN SOURCE ══════════════════════════ -->

## Open source

| Repo | What it is | Stack | Live |
|:--|:--|:--|:--|
| [**Road\_SOS**](https://github.com/JoelDlima/Road_SOS) | Roadside emergency assistance app | <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/> | [demo ↗](https://road-sos-sepia.vercel.app) |
| [**CropGuardv2**](https://github.com/JoelDlima/CropGuardv2) | Crop health and advisory tool | <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/> | [demo ↗](https://crop-guardv2.vercel.app) |
| [**esp32\_project**](https://github.com/JoelDlima/esp32_project) | ESP32 embedded experiments | <img src="https://img.shields.io/badge/C%2B%2B-00599C?style=flat-square&logo=cplusplus&logoColor=white"/> | — |
| [**medieval-translator-app**](https://github.com/JoelDlima/medieval-translator-app) | Gemini-powered medieval translator | <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white"/> | — |
| [**BharatVanni-AI**](https://github.com/JoelDlima/BharatVanni-AI) | Indian-language AI project | <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/> | — |
| [**yt-cli**](https://github.com/JoelDlima/yt-cli) | YouTube from your terminal | <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white"/> | — |
| [**joeldlima-portfolio**](https://github.com/JoelDlima/joeldlima-portfolio) | Personal site | <img src="https://img.shields.io/badge/HTML-E34F26?style=flat-square&logo=html5&logoColor=white"/> | [live ↗](https://portfolio-v1-seven-nu.vercel.app) |

<p align="center"><sub>Featured projects are in private repos. Happy to walk through any of them — just reach out.</sub></p>

---

<!-- ══════════════════════════ TECHNICAL CONSTELLATION ══════════════════════════ -->

## Technical constellation

<p align="center">
  <img src="https://skillicons.dev/icons?i=cpp,c,arduino,py,ts,js,react,nodejs,tailwind,flask,supabase,gcp,vercel,tensorflow,git&perline=8" alt="Tech stack: C++, C, Arduino/ESP32, Python, TypeScript, JavaScript, React, Node.js, Tailwind, Flask, Supabase, Google Cloud, Vercel, TensorFlow, Git"/>
</p>

| Domain | Stack |
|:--|:--|
| **Embedded** | ESP32 · ESP32-CAM · I2C · SPI · UART · GPIO · Sensor integration · C/C++ |
| **Software** | Python · TypeScript · JavaScript · React · Node.js · Flask · Tailwind CSS |
| **Data & Cloud** | Supabase · REST APIs · Google Cloud · Vercel · Wi-Fi telemetry |
| **AI & Automation** | Gemini API · Ollama · TensorFlow · NLP pipelines · Web scraping |
| **Also** | Verilog · Git · API integration · System prototyping · Technical documentation |

---

<!-- ══════════════════════════ SIGNALS RECEIVED ══════════════════════════ -->

## Signals received

- **Top 25, state level** — HackIndia, Goa · 2nd year
- **3rd place, Software Track** — Smart India Hackathon, college level
- **3rd place, Hardware Track** — Smart India Hackathon, college level
- **Lenovo LEAP Culmination recognition** — AI-driven innovation in agriculture (AgroProfit)
- **2× Lenovo 8-week self-paced programs** — AI · Web Technologies
- **CGPA 9.7** — Sem I–III: 10.0 · Sem IV: 9.81 · Sem V: 9.41

---

<!-- ══════════════════════════ CURRENT EXPERIMENTS ══════════════════════════ -->

## Current experiments

- Automotive software workflows and embedded engineering practice at Visteon
- Edge-side filtering and multi-protocol telemetry reliability
- Cleaner separation between data ingestion, APIs, and frontend interfaces
- AI features with observable, inspectable inputs and outputs
- Smaller, more testable systems — easier to explain, easier to debug

---

<!-- ══════════════════════════ CONTACT ══════════════════════════ -->

## Contact

Open to conversations about embedded systems, software engineering, and AI projects.

<p>
  <a href="mailto:joeldlima123@gmail.com"><img src="https://img.shields.io/badge/joeldlima123%40gmail.com-22D3EE?style=flat-square&logo=gmail&logoColor=white"/></a>
  &nbsp;
  <a href="https://linkedin.com/in/joel-dlima"><img src="https://img.shields.io/badge/joel--dlima-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/></a>
  &nbsp;
  <a href="https://portfolio-v1-seven-nu.vercel.app"><img src="https://img.shields.io/badge/Portfolio-000000?style=flat-square&logo=vercel&logoColor=white"/></a>
</p>

<br/>

<p align="center"><sub><i>From sensor pin to cloud dashboard — one clear path.</i></sub></p>
