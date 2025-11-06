import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'

const DEFAULT_LENGTH = 16

function getCryptoRandomInt(max) {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0] % max
  }
  return Math.floor(Math.random() * max)
}

export default function Random() {
  const [length, setLength] = useState(DEFAULT_LENGTH)
  const [useLower, setUseLower] = useState(true)
  const [useUpper, setUseUpper] = useState(true)
  const [useDigits, setUseDigits] = useState(true)
  const [useSymbols, setUseSymbols] = useState(false)
  const [value, setValue] = useState('')

  const charset = useMemo(() => {
    let s = ''
    if (useLower) s += 'abcdefghijklmnopqrstuvwxyz'
    if (useUpper) s += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (useDigits) s += '0123456789'
    if (useSymbols) s += '!@#$%^&*()-_=+[]{};:,.<>/?'
    return s || 'abcdefghijklmnopqrstuvwxyz'
  }, [useLower, useUpper, useDigits, useSymbols])

  const generate = useCallback(() => {
    let out = ''
    for (let i = 0; i < Number(length); i++) {
      const idx = getCryptoRandomInt(charset.length)
      out += charset[idx]
    }
    setValue(out)
  }, [length, charset])

  useEffect(() => {
    // Auto-generate when options change
    generate()
  }, [generate])

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Random String Generator</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Options" subtitle="Select characters and length" />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="w-36 label">Length</label>
              <input
                type="number"
                min={1}
                max={1024}
                className="input w-28"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-36 label">Lowercase</label>
              <input type="checkbox" className="input" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-36 label">Uppercase</label>
              <input type="checkbox" className="input" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-36 label">Digits</label>
              <input type="checkbox" className="input" checked={useDigits} onChange={(e) => setUseDigits(e.target.checked)} />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-36 label">Symbols</label>
              <input type="checkbox" className="input" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />
            </div>
            <Button onClick={generate}>Generate</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Result" subtitle="Your generated string" />
          <CardBody className="space-y-3">
            <textarea className="textarea w-full bg-gray-50 dark:bg-gray-900" value={value} readOnly />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigator.clipboard?.writeText(value)} disabled={!value}>
                Copy
              </Button>
              <Button variant="outline" onClick={() => setValue('')} disabled={!value}>
                Clear
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}
