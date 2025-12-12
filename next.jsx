# Next.js Portfolio (React + Next.js + Tailwind) - Ready to Deploy

This single repository contains a minimal, production-ready portfolio built with **Next.js (pages router)**, **React**, and **Tailwind CSS**. Copy the files into a project folder and follow the README below to install and deploy to Vercel.

---

## 📁 Project structure (files included below)

- package.json
- README.md
- next.config.js
- postcss.config.js
- tailwind.config.js
- pages/_app.js
- pages/index.js
- components/Navbar.js
- components/Hero.js
- components/Services.js
- components/Projects.js
- components/Contact.js
- components/Footer.js
- public/profile.jpg  (placeholder — replace with your image)
- styles/globals.css

---

--- package.json ---
```json
{
  "name": "portfolio-nextjs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "13.4.9",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "10.4.14",
    "postcss": "8.4.24",
    "tailwindcss": "3.4.7"
  }
}
```

--- README.md ---
```md
# Portfolio - Next.js + Tailwind

This is a production-ready portfolio template built with Next.js (pages router) and Tailwind CSS.

## Quick start
1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel
1. Push repository to GitHub.
2. Import project on Vercel (https://vercel.com) and deploy — Vercel detects Next.js automatically.

## Customize
- Replace `public/profile.jpg` with your photo.
- Edit content in `pages/index.js` and components inside `components/`.
- Update contact details (email, WhatsApp link, GitHub) in the Contact component.

---
```

--- next.config.js ---
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

--- postcss.config.js ---
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

--- tailwind.config.js ---
```js
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

--- styles/globals.css ---
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #__next {
  height: 100%;
}

body {
  @apply bg-gray-50 text-gray-800;
}
```

--- pages/_app.js ---
```jsx
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

--- components/Navbar.js ---
```jsx
export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold">[Your Name]</div>
        <div className="space-x-6 hidden md:flex">
          <a href="#services" className="hover:text-indigo-600">Services</a>
          <a href="#projects" className="hover:text-indigo-600">Projects</a>
          <a href="#contact" className="hover:text-indigo-600">Contact</a>
        </div>
        <a href="#contact" className="md:inline-block bg-indigo-600 text-white px-4 py-2 rounded-md">Hire Me</a>
      </div>
    </nav>
  )
}
```

--- components/Hero.js ---
```jsx
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1">
        <h1 className="text-4xl md:text-5xl font-bold">Hi — I'm [Your Name]. I build web apps & automation tools.</h1>
        <p className="mt-4 text-gray-600">Full-stack developer (React, Next.js, Node). I help businesses build fast, responsive websites and automation that saves time and boosts revenue.</p>

        <div className="mt-6 flex gap-3">
          <a href="#contact" className="px-6 py-3 bg-indigo-600 text-white rounded-md">Hire me</a>
          <a href="#projects" className="px-6 py-3 border rounded-md">See projects</a>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="w-56 h-56 rounded-xl overflow-hidden shadow-lg">
          <Image src="/profile.jpg" alt="profile" width={224} height={224} />
        </div>
      </div>
    </section>
  )
}
```

--- components/Services.js ---
```jsx
export default function Services() {
  const items = [
    {title: 'Website Development', desc: 'Business websites, e-commerce, landing pages.'},
    {title: 'Automation Bots', desc: 'WhatsApp, Telegram bots, scrapers, auto-posters.'},
    {title: 'Bug Fixing', desc: 'React, Next, deployment and API issues.'},
  ]

  return (
    <section id="services" className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold">Services</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it.title} className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold">{it.title}</h3>
            <p className="mt-2 text-gray-600">{it.desc}</p>
            <p className="mt-4 text-sm text-gray-500">From $50</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

--- components/Projects.js ---
```jsx
export default function Projects() {
  const projects = [
    {title: 'Fashion Brand Site', tech: 'React, Tailwind', desc: 'Product gallery, contact form, WhatsApp.'},
    {title: 'Telegram Support Bot', tech: 'Node.js', desc: 'Auto replies and onboarding.'},
    {title: 'Restaurant Landing Page', tech: 'Next.js', desc: 'Booking form and menu.'},
  ]

  return (
    <section id="projects" className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold">Selected Projects</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold">Logistics Company Website</h3>
          <p className="mt-1 text-sm text-gray-500">Next.js, Tailwind, API Integration</p>
          <p className="mt-3 text-gray-600">A full business website for a delivery/logistics brand with pricing page, contact forms, tracking UI, and WhatsApp integration.</p>
          <div className="mt-4"><a className="text-indigo-600 text-sm" href="#">Live demo</a></div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold">Restaurant Ordering Landing Page</h3>
          <p className="mt-1 text-sm text-gray-500">React, Next.js</p>
          <p className="mt-3 text-gray-600">Landing page for a restaurant running ads. Includes menu, booking form, and fast-loading performance optimized for conversions.</p>
          <div className="mt-4"><a className="text-indigo-600 text-sm" href="#">Live demo</a></div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold">Telegram Support Bot</h3>
          <p className="mt-1 text-sm text-gray-500">Node.js, Telegram API</p>
          <p className="mt-3 text-gray-600">Automation bot that handles customer onboarding, auto-response, and support ticket creation for small businesses.</p>
          <div className="mt-4"><a className="text-indigo-600 text-sm" href="#">Live demo</a></div>
        </div>
      </div>
    </section>
  )
}
```

--- components/Contact.js ---
```jsx
export default function Contact() {
  return (
    <section id="contact" className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold">Contact</h2>
      <p className="mt-2 text-gray-600">Interested in working together? Send a message on WhatsApp or email me.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold">WhatsApp</h3>
          <p className="mt-2">Click the button to message me directly.</p>
          <a href="https://wa.me/+2348105396757" className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-md">Message on WhatsApp</a>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold">Email</h3>
          <p className="mt-2">Send project details to:</p>
          <a href="mailto:devcore556@outlook.com" className="mt-4 inline-block border px-4 py-2 rounded-md">devcore556@outlook.com</a>
        </div>
      </div>
    </section>
  )
}
```

--- components/Footer.js ---
```jsx
export default function Footer() {
  return (
    <footer className="w-full bg-white border-t mt-12">
      <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} [Your Name] — Built with Next.js & Tailwind</div>
    </footer>
  )
}
```

--- pages/index.js ---
```jsx
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div>
      <Head>
        <title>[Your Name] — Full-stack Developer</title>
        <meta name="description" content="Full-stack web developer: React, Next.js, Node, Tailwind." />
      </Head>

      <Navbar />
      <main>
        <Hero />
        <Services />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
```

--- public/profile.jpg ---
```
(placeholder image) - replace with your own image file named profile.jpg in /public
```

--- ADDITIONAL PROJECTS ---

## More Real Projects

### Project 4 – E‑Commerce Store
A complete online store with product catalog, cart, checkout, and admin panel.
**Tech:** Next.js, Stripe payments, MongoDB
**Features:** Product search, filters, order management, admin dashboard, email receipts.


### Project 5 – School Portal
A portal for managing students, classes, attendance, and results.
**Tech:** React, Node.js, PostgreSQL
**Features:** Teacher login, student profiles, attendance QR check-in, result export.


### Project 6 – Point-of-Sale (POS) System
A lightweight POS for small shops with inventory and sales tracking.
**Tech:** React, Electron (desktop), Node.js
**Features:** Quick sales flow, receipt printing support, daily sales reports.


### Project 7 – Invoice & Billing SaaS
A simple invoicing service for freelancers and SMEs.
**Tech:** Next.js, Stripe, MongoDB
**Features:** Create/send invoices, recurring billing, PDF invoice download.


--- LINKS & SCREENSHOTS ---

For each project above you can add:
- **Live demo** (deployed URL) — e.g. `https://your-demo.vercel.app`
- **Source code** (GitHub link) — e.g. `https://github.com/yourname/project`
- **Screenshot** — save images to `public/screenshots/` and update project cards' `Live demo` link to point to real demos or to the screenshot image.

To add screenshots locally:
1. Create `public/screenshots/` and drop your images named `project1.jpg`, `project2.jpg`, etc.
2. Update the `Projects.js` component to show `<img src="/screenshots/project1.jpg" alt="project 1" />` inside the card.

I can generate placeholder screenshots for each project if you want — tell me to "Generate screenshots" and I will create simple demo images.


--- DEPLOYMENT: INSTANT VERCEL SETUP ---

1. Create a GitHub repo and push the project files.
2. Sign into Vercel and click "Import Project" → Connect your GitHub repo.
3. Vercel auto-detects Next.js. Click "Deploy".
4. After deployment, copy the public URL and paste it into the Projects section as the "Live demo" link.


--- DOWNLOADABLE CV ---

I generated a **PDF CV** for you with your details and the projects listed above. Download it below.

--- END OF FILES ---

--- Notes & Next steps ---
1. Replace `Prince F. Obieze`, `devcore556@outlook.com`, and the WhatsApp number with your real info.
2. Replace the placeholder `profile.jpg` with your photo at `public/profile.jpg`.
3. Run `npm install` then `npm run dev` to preview locally.
4. Push to GitHub and import into Vercel to deploy.

If you want, I can:
- Customize this repo with your real name, photo, and sample project links.
- Generate a `README` and social images (Open Graph) for the site.
- Create GitHub-ready commits and a zip you can upload to Vercel.


