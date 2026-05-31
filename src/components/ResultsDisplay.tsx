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
  const riskColor = (level: string) => {
    if (level === 'HIGH') return '#ef4444'
    if (level === 'MEDIUM') return '#f59e0b'
    return '#22c55e'
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{
        backgroundColor: '#f1f5f9',
        padding: '16px',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <strong>Summary:</strong> {result.summary}<br />
        <strong>Risk Score:</strong> {result.overallRiskScore}/10
      </div>

      <h3>Extracted Clauses</h3>

      {result.clauses.length === 0 && <p>No clauses detected.</p>}

      {result.clauses.map((clause) => (
        <div
          key={clause.id}
          style={{
            border: '1px solid #ddd',
            borderLeft: `4px solid ${riskColor(clause.riskLevel)}`,
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '10px'
          }}
        >
          <strong>{clause.type}</strong> — {clause.riskLevel}
          <p style={{ margin: '4px 0 0 0' }}>{clause.text}</p>
        </div>
      ))}
    </div>
  )
}

export default ResultsDisplay