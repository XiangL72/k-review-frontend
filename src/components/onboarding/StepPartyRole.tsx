import type { RoleKey } from './OnboardingFlow'

interface StepPartyRoleProps {
  selected: RoleKey | null
  onSelect: (role: RoleKey) => void
  onNext: () => void
  labelA: string
  labelB: string
}

function StepPartyRole({ selected, onSelect, onNext, labelA, labelB }: StepPartyRoleProps) {
  return (
    <div className="step-party-role">
      <h2>Which side are you on?</h2>
      <p className="helper-note">This tells the AI whose side to weigh risk from.</p>

      <div className="role-grid">
        <button
          className={`role-card ${selected === 'A' ? 'selected' : ''}`}
          onClick={() => onSelect('A')}
          aria-pressed={selected === 'A'}
        >
          {labelA}
        </button>
        <button
          className={`role-card ${selected === 'B' ? 'selected' : ''}`}
          onClick={() => onSelect('B')}
          aria-pressed={selected === 'B'}
        >
          {labelB}
        </button>
      </div>

      <button className="btn-primary" onClick={onNext} disabled={!selected}>
        Continue
      </button>
    </div>
  )
}

export default StepPartyRole
