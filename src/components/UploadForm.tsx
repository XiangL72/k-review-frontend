import { useState } from 'react'
import './UploadForm.css'

interface UploadFormProps {
  onJobSubmitted: (jobId: string, contractId: number) => void
}

function UploadForm({ onJobSubmitted }: UploadFormProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please paste contract text first.')
      return
    }

    setSubmitting(true)
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

      if (!analyzeRes.ok) {
        throw new Error(`Analyze failed: ${analyzeRes.status}`)
      }

      const { jobId } = await analyzeRes.json()
      onJobSubmitted(jobId, contract.id)
      setText('')
    } catch (err) {
      setError('Error connecting to server. Make sure the backend is running.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="upload-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste contract text here..."
        disabled={submitting}
      />
      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Analyze Contract'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default UploadForm