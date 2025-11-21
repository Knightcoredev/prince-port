import Image from 'next/image'

export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1">
        <h1 className="text-4xl md:text-5xl font-bold">Hi — I'm Prince F. Obieze. I build web apps & automation tools.</h1>
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