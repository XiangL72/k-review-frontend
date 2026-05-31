import { useState } from 'react'

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
      // Step 1: submit the contract
      const submitRes = await fetch('http://localhost:8080/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      })
      const contract = await submitRes.json()

      // Step 2: analyze it
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
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste contract text here..."
        style={{ width: '100%', height: '200px', padding: '10px', fontSize: '14px' }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '10px 24px',
          fontSize: '16px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '10px'
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze Contract'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  )
}

export default UploadForm