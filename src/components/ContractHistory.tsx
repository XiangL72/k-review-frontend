import { useState, useEffect } from 'react'
import './ContractHistory.css'

interface Contract {
  id: number
  content: string
  createdAt: string
}

interface ContractHistoryProps {
  onSelectContract: (id: number) => void
}

function ContractHistory({ onSelectContract }: ContractHistoryProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8080/api/contracts/analyzed')
      .then(res => res.json())
      .then(data => {
        setContracts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading history...</p>
  if (contracts.length === 0) return <p className="empty">No contracts analyzed yet.</p>

  return (
    <div className="history">
      <h3>Past Contracts</h3>
      {contracts.map(contract => (
        <div
          key={contract.id}
          className="history-card"
          onClick={() => onSelectContract(contract.id)}
        >
          <div className="history-preview">
            {contract.content.substring(0, 120)}...
          </div>
          <div className="history-date">
            {new Date(contract.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContractHistory