import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Translate faster, build quicker
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          A sleek React + Tailwind app to translate English text via RapidAPI and generate random strings for your projects.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <Link to="/translate" className="card hover:shadow-md transition">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-2">Text Translator →</h2>
            <p className="text-gray-600 dark:text-gray-300">Convert English text to your favorite language.</p>
          </div>
        </Link>
        <Link to="/random" className="card hover:shadow-md transition">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-2">Random String Generator →</h2>
            <p className="text-gray-600 dark:text-gray-300">Create random strings with your chosen length and character sets.</p>
          </div>
        </Link>
      </div>
    </section>
  )
}
