import { useState, useEffect } from 'react'
import './ResultsDisplay.css'

interface Clause {
  id: number
  type: string
  text: string
  riskLevel: string
}

interface AnalysisResult {
  id: number
  summary: string
  overallRiskScore: number
  clauses: Clause[]
}

type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED'

interface ResultsDisplayProps {
  status: JobStatus | null
  result: AnalysisResult | null
  onReset: () => void
}

function ResultsDisplay({ status, result, onReset }: ResultsDisplayProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (status !== 'PENDING' && status !== 'PROCESSING') {
      setElapsed(0)
      return
    }

    setElapsed(0)
    const intervalId = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [status])

  if (status === null) {
    return null
  }

  if (status === 'PENDING' || status === 'PROCESSING') {
    return (
      <div className="results">
        <div className="summary-card">
          <div className="loading-row">
            <div className="spinner" />
            <span>Analyzing your contract — this usually takes 5-15 seconds. ({elapsed}s)</span>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'FAILED') {
    return (
      <div className="results">
        <div className="summary-card error-card">
          <p>❌ Something went wrong analyzing your contract.</p>
          <p className="error-help">This usually means the AI service was busy or your contract format was unusual. Please try again.</p>
          <button className="try-again-btn" onClick={onReset}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (status === 'COMPLETE' && result) {
    return (
      <div className="results">
        <div className="summary-card">
          <strong>Summary</strong>
          <p>{result.summary}</p>
          <div className="risk-score">
            Risk Score: {result.overallRiskScore}/10
          </div>
        </div>

        <h3>Extracted Clauses</h3>

        {result.clauses.length === 0 && <p>No clauses detected.</p>}

        {result.clauses.map((clause) => (
          <div key={clause.id} className={`clause-card risk-${clause.riskLevel}`}>
            <div className="clause-header">{clause.type} — {clause.riskLevel}</div>
            <div className="clause-text">{clause.text}</div>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export default ResultsDisplay