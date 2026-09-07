import { useState, useEffect } from 'react'
import './ContractHistory.css'
import { API_BASE_URL } from '../config/api'

interface Contract {
  id: number
  content: string
  createdAt: string
}

interface ContractHistoryProps {
  onSelectContract: (id: number) => void
  disabled: boolean
}

function ContractHistory({ onSelectContract, disabled }: ContractHistoryProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/contracts/analyzed`)
      .then(res => res.json())
      .then(data => {
        setContracts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="history-status">Loading history…</p>
  if (contracts.length === 0) {
    return <p className="history-status">No contracts analyzed yet.</p>
  }

  return (
    <div className="history">
      <div className="history-head">
        <h3>
          Past contracts <span className="count">{contracts.length}</span>
        </h3>
      </div>

      <div className={`history-list ${disabled ? 'history-list-disabled' : ''}`}>
        {contracts.map(contract => (
          <div
            key={contract.id}
            className="history-row"
            onClick={() => {
              if (disabled) return
              onSelectContract(contract.id)
            }}
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
    </div>
  )
}

export default ContractHistory