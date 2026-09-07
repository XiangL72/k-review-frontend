import { useState, useEffect } from 'react'
import './ResultsDisplay.css'

interface Clause {
  id: number
  type: string
  text: string
  riskLevel: string
}

interface Contract {
  id: number
  content: string
  createdAt: string
  contractType: string | null
  partyRole: string | null
  partyRoleCustomLabel: string | null
}

interface AnalysisResult {
  id: number
  summary: string
  overallRiskScore: number
  clauses: Clause[]
  contract: Contract
}

type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED'

interface ResultsDisplayProps {
  status: JobStatus | null
  result: AnalysisResult | null
  onReset: () => void
}

function ResultsDisplay({ status, result, onReset }: ResultsDisplayProps) {
  const [elapsed, setElapsed] = useState(0)
  const [contractExpanded, setContractExpanded] = useState(false)

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
        <div className="panel loading-panel">
          <div className="spinner" />
          <div>
            <div className="loading-title">Analyzing your contract</div>
            <div className="loading-meta">
              This usually takes 5–15 seconds · {elapsed}s elapsed
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'FAILED') {
    return (
      <div className="results">
        <div className="panel error-panel">
          <div className="panel-label">Analysis failed</div>
          <p className="error-help">
            This usually means the AI service was busy or your contract format was
            unusual. Please try again.
          </p>
          <button className="btn btn-outline" onClick={onReset}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (status === 'COMPLETE' && result) {
    const preview = result.contract.content.substring(0, 300)
    const isLong = result.contract.content.length > 300
    const displayedText = contractExpanded || !isLong
      ? result.contract.content
      : preview + '...'

    return (
      <div className="results">
        <div className="results-head">
          <h2>Analysis</h2>
          <button className="btn btn-ghost" onClick={onReset}>
            New analysis
          </button>
        </div>

        <div className="panel summary-panel">
          <div className="summary-main">
            <div className="panel-label">Summary</div>
            <p className="summary-text">{result.summary}</p>
          </div>
          <div className="score">
            <div className="panel-label">Risk score</div>
            <div className="score-value">
              {result.overallRiskScore}
              <span className="score-total">/10</span>
            </div>
          </div>
        </div>

        <div className="panel contract-panel">
          <div className="panel-head">
            <div className="panel-label">Original contract</div>
            {isLong && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setContractExpanded(!contractExpanded)}
              >
                {contractExpanded ? 'Show less' : 'Show full text'}
              </button>
            )}
          </div>
          <p className="contract-text">{displayedText}</p>
        </div>

        <div className="results-head">
          <h3>
            Extracted clauses <span className="count">{result.clauses.length}</span>
          </h3>
        </div>

        {result.clauses.length === 0 && (
          <p className="muted">No clauses detected.</p>
        )}

        <div className="clause-list">
          {result.clauses.map((clause) => (
            <div key={clause.id} className="panel clause-card">
              <div className="panel-head">
                <span className="clause-type">{clause.type}</span>
                <span className={`risk-badge risk-${clause.riskLevel}`}>
                  <span className="risk-dot" />
                  {clause.riskLevel.toLowerCase()}
                </span>
              </div>
              <p className="clause-text">{clause.text}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default ResultsDisplay
