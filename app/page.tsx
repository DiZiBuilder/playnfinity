// src/app/page.tsx


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 via-black to-purple-950 text-white p-8">
      <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
        Playnfinity
      </h1>
      <p className="text-xl md:text-2xl mb-12 text-gray-300">
        TikTok for Games on YOM
      </p>
      <div className="flex flex-col sm:flex-row gap-6">
        <a href="/feed" className="bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition transform">
          Explore Games
        </a>
        <a href="/studio" className="border-2 border-pink-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-500 hover:text-black transition">
          Studio
        </a>
      </div>
      <p className="mt-16 text-sm text-gray-500">
        In partnership with YOM
      </p>
    </main>
  );
}