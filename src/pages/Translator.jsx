import { useCallback, useMemo, useState } from 'react'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { translateText } from '../services/translate'

const LANGS = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'it', name: 'Italian' },
]

export default function Translator() {
  const [text, setText] = useState('')
  const [target, setTarget] = useState('es')
  const [translated, setTranslated] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const hasRapidApiKey = Boolean(import.meta.env.VITE_RAPIDAPI_KEY)

  const canTranslate = useMemo(() => text.trim().length > 0 && !loading, [text, loading])

  const handleTranslate = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const result = await translateText({ text, target, source: 'en' })
      setTranslated(result)
    } catch (e) {
      setError(e.message ?? 'Failed to translate')
    } finally {
      setLoading(false)
    }
  }, [text, target])

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Text Translator</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Input" subtitle="Type the text in English to translate" />
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <label className="label">English text</label>
              <textarea
                className="textarea w-full"
                placeholder="Type text in English..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="label m-0">Target language</label>
              <select
                className="input"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
              <Button className="ml-auto" onClick={handleTranslate} disabled={!canTranslate}>
                {loading ? (
                  <span className="inline-flex items-center gap-2"><Spinner className="h-4 w-4" /> Translating…</span>
                ) : (
                  'Translate'
                )}
              </Button>
            </div>
            {error && <Alert variant="error">{error}</Alert>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Output" subtitle="Translated text" />
          <CardBody className="space-y-3">
            <textarea className="textarea w-full bg-gray-50 dark:bg-gray-900" value={translated} readOnly />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigator.clipboard?.writeText(translated)} disabled={!translated}>
                Copy
              </Button>
              <Button variant="outline" onClick={() => setTranslated('')} disabled={!translated}>
                Clear
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {!hasRapidApiKey && (
        <Alert variant="warning">
          Note: Add your RapidAPI key to <code>.env</code> as <code>VITE_RAPIDAPI_KEY</code> and restart the dev server to enable translation.
        </Alert>
      )}
    </section>
  )
}
