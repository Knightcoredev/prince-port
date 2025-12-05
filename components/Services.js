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