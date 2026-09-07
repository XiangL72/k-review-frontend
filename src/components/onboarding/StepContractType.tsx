import type { ContractTypeKey } from './OnboardingFlow'

// Hardcoded, not fetched from GET /api/contracts/types, to stay consistent with the
// hardcoded A/B role mapping in OnboardingFlow.tsx (see comment there) — mixing a
// dynamic type list with a static role mapping would be an inconsistent source of truth.
const CONTRACT_TYPES: { key: ContractTypeKey; label: string; description: string }[] = [
  { key: 'LEASE', label: 'Lease', description: 'Landlord & tenant agreements' },
  { key: 'EMPLOYMENT', label: 'Employment', description: 'Employer & employee agreements' },
  { key: 'SALES', label: 'Sales', description: 'Buyer & seller agreements' },
  { key: 'GENERAL', label: 'General', description: 'Any other contract' },
]

interface StepContractTypeProps {
  selected: ContractTypeKey | null
  onSelect: (type: ContractTypeKey) => void
  onNext: () => void
}

function StepContractType({ selected, onSelect, onNext }: StepContractTypeProps) {
  return (
    <div className="step-contract-type">
      <h2>What type of contract is this?</h2>
      <p className="helper-note">The contract type sets which roles you'll choose next.</p>

      <div className="card-grid">
        {CONTRACT_TYPES.map(type => (
          <button
            key={type.key}
            className={`card ${selected === type.key ? 'selected' : ''}`}
            onClick={() => onSelect(type.key)}
            aria-pressed={selected === type.key}
          >
            <div className="card-title">
              <span>{type.label}</span>
              {selected === type.key && <span className="card-check">✓</span>}
            </div>
            <div className="card-desc">{type.description}</div>
          </button>
        ))}
      </div>

      <button className="btn-primary" onClick={onNext} disabled={!selected}>
        Continue
      </button>
    </div>
  )
}

export default StepContractType
