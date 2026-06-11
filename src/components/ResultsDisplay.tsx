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
}

function ResultsDisplay({ status, result }: ResultsDisplayProps) {
  if (status === null) {
    return null
  }

  if (status === 'PENDING' || status === 'PROCESSING') {
    return (
      <div className="results">
        <div className="summary-card">
          <p>⏳ Analyzing your contract...</p>
        </div>
      </div>
    )
  }

  if (status === 'FAILED') {
    return (
      <div className="results">
        <div className="summary-card">
          <p>❌ Analysis failed. Please try again.</p>
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