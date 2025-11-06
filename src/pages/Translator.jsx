import { useCallback, useMemo, useState } from 'react'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { translateText } from '../services/translate'
import { hasVoice, speakText, voicesFor } from '../utils/speech'
import { transliterate } from '../utils/transliterate'

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
  const [ttsError, setTtsError] = useState('')
  const [outputVoiceReady, setOutputVoiceReady] = useState(true)
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoiceName, setSelectedVoiceName] = useState('')
  const hasRapidApiKey = Boolean(import.meta.env.VITE_RAPIDAPI_KEY)

  const canTranslate = useMemo(() => text.trim().length > 0 && !loading, [text, loading])

  const transliteration = useMemo(() => transliterate(translated, target), [translated, target])

  const speak = useCallback(async (t, lang) => {
    setTtsError('')
    const ok = await speakText(t, lang)
    if (!ok) setTtsError(`No voice available for ${lang || 'selected language'}.`)
  }, [])

  // Track if target language has a voice and populate list (best effort)
  useMemo(() => {
    let mounted = true
    ;(async () => {
      try {
        const [has, list] = await Promise.all([hasVoice(target), voicesFor(target)])
        if (mounted) {
          setOutputVoiceReady(has)
          setAvailableVoices(list)
          setSelectedVoiceName((prev) => (list.find(v => v.name === prev) ? prev : (list[0]?.name || '')))
        }
      } catch {
        if (mounted) {
          setOutputVoiceReady(true)
          setAvailableVoices([])
          setSelectedVoiceName('')
        }
      }
    })()
    return () => { mounted = false }
  }, [target])

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
              <Button variant="outline" onClick={() => speak(text, 'en-US')} disabled={!text}>
                Speak
              </Button>
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
            {transliteration && (
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">{transliteration}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {availableVoices.length > 1 && (
                <select className="input" value={selectedVoiceName} onChange={(e) => setSelectedVoiceName(e.target.value)}>
                  {availableVoices.map(v => (
                    <option key={v.name} value={v.name}>{v.name.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              )}
              <Button variant="outline" onClick={() => speakText(translated, target, { voiceName: selectedVoiceName })} disabled={!translated || !outputVoiceReady}>
                Speak
              </Button>
              <Button variant="outline" onClick={() => navigator.clipboard?.writeText(translated)} disabled={!translated}>
                Copy
              </Button>
              <Button variant="outline" onClick={() => setTranslated('')} disabled={!translated}>
                Clear
              </Button>
              <a
                className="ml-auto text-sm underline text-brand-600 hover:text-brand-500"
                href={`https://translate.google.com/?sl=en&tl=${encodeURIComponent(target)}&text=${encodeURIComponent(text)}&op=translate`}
                target="_blank" rel="noreferrer"
              >
                See dictionary
              </a>
            </div>
          </CardBody>
        </Card>
      </div>

      {!hasRapidApiKey && (
        <Alert variant="warning">
          Note: Add your RapidAPI key to <code>.env</code> as <code>VITE_RAPIDAPI_KEY</code> and restart the dev server to enable translation.
        </Alert>
      )}
      {ttsError && (
        <Alert variant="warning">{ttsError}</Alert>
      )}
    </section>
  )
}
