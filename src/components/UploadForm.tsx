import { useState } from 'react'
import './UploadForm.css'

interface UploadFormProps {
  onAnalysisComplete: (result: any) => void
}

function UploadForm({ onAnalysisComplete }: UploadFormProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please paste contract text first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const submitRes = await fetch('http://localhost:8080/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      })
      const contract = await submitRes.json()

      const analyzeRes = await fetch(`http://localhost:8080/api/contracts/${contract.id}/analyze`, {
        method: 'POST'
      })
      const analysis = await analyzeRes.json()

      onAnalysisComplete(analysis)
    } catch (err) {
      setError('Error connecting to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste contract text here..."
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Contract'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default UploadForm