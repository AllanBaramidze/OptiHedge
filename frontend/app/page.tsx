import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-linear-to-b from-gray-900 to-black text-white">
      <h1 className="text-5xl font-bold mb-8">Welcome to OptiHedge</h1>
      <p className="text-xl mb-12 text-center max-w-2xl">
        AI-powered portfolio analysis & hedging for retail traders.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/upload" className="bg-blue-600 hover:bg-blue-700 px-8 py-6 rounded-xl text-center text-2xl font-semibold transition">
          Upload Portfolio
        </Link>
        <Link href="/dashboard" className="bg-green-600 hover:bg-green-700 px-8 py-6 rounded-xl text-center text-2xl font-semibold transition">
          View Dashboard
        </Link>
        <Link href="/risk" className="bg-purple-600 hover:bg-purple-700 px-8 py-6 rounded-xl text-center text-2xl font-semibold transition">
          Assess Risk
        </Link>
      </div>
    </main>
  );
}4