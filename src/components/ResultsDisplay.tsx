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

interface ResultsDisplayProps {
  result: AnalysisResult
}

function ResultsDisplay({ result }: ResultsDisplayProps) {
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

export default ResultsDisplay