import { useState } from 'react'
import './OnboardingFlow.css'
import StepWelcome from './StepWelcome'
import StepContractType from './StepContractType'
import StepPartyRole from './StepPartyRole'
import StepUpload from './StepUpload'
import { API_BASE_URL } from '../../config/api'

export type ContractTypeKey = 'LEASE' | 'EMPLOYMENT' | 'SALES' | 'GENERAL'
export type RoleKey = 'A' | 'B'

// Maps the UI's simple "A / B" choice to the actual backend PartyRole value for the
// chosen contract type (e.g. LANDLORD/TENANT for a Lease). Also used to *display* the
// real role name on the step 3 buttons (e.g. "Landlord" / "Tenant" once Lease is
// picked, falling back to "Party A" / "Party B" only for General). The backend's
// /api/contracts/types endpoint returns each type's valid roles as a Set, which has no
// guaranteed order — so "first role returned = A" can't be derived from it reliably —
// this mapping is hardcoded here instead, matching the fixed pairing the backend enums
// define.
const ROLE_MAP: Record<ContractTypeKey, { A: string; B: string }> = {
  LEASE: { A: 'LANDLORD', B: 'TENANT' },
  EMPLOYMENT: { A: 'EMPLOYER', B: 'EMPLOYEE' },
  SALES: { A: 'BUYER', B: 'SELLER' },
  GENERAL: { A: 'PARTY_A', B: 'PARTY_B' },
}

function prettifyRole(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const TOTAL_STEPS = 4

interface OnboardingFlowProps {
  onJobSubmitted: (jobId: string, contractId: number) => void
}

function OnboardingFlow({ onJobSubmitted }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [contractType, setContractType] = useState<ContractTypeKey | null>(null)
  const [role, setRole] = useState<RoleKey | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const goBack = () => setStep(s => Math.max(s - 1, 1))

  const selectContractType = (type: ContractTypeKey) => {
    setContractType(type)
    setRole(null) // role choices depend on type, so a stale selection can't carry over
  }

  const handleAnalyze = async () => {
    if (!file || !contractType || !role) return
    setSubmitting(true)
    setError('')

    try {
      const backendRole = ROLE_MAP[contractType][role]
      const backendType = contractType === 'GENERAL' ? null : contractType

      const formData = new FormData()
      formData.append('file', file)
      if (backendType) formData.append('contractType', backendType)
      formData.append('partyRole', backendRole)

      const submitRes = await fetch(`${API_BASE_URL}/api/contracts/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!submitRes.ok) {
        const body = await submitRes.json().catch(() => null)
        setError(body?.error ?? 'Could not submit the contract.')
        return
      }
      const contract = await submitRes.json()

      const analyzeRes = await fetch(`${API_BASE_URL}/api/contracts/${contract.id}/analyze`, {
        method: 'POST',
      })
      if (!analyzeRes.ok) {
        const body = await analyzeRes.json().catch(() => null)
        setError(body?.error ?? 'Could not start analysis.')
        return
      }
      const { jobId } = await analyzeRes.json()
      onJobSubmitted(jobId, contract.id)
    } catch {
      setError('Error connecting to server. Make sure the backend is running.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepWelcome onNext={goNext} />
      case 2:
        return (
          <StepContractType
            selected={contractType}
            onSelect={selectContractType}
            onNext={goNext}
          />
        )
      case 3: {
        const roleLabels = ROLE_MAP[contractType ?? 'GENERAL']
        return (
          <StepPartyRole
            selected={role}
            onSelect={setRole}
            onNext={goNext}
            labelA={prettifyRole(roleLabels.A)}
            labelB={prettifyRole(roleLabels.B)}
          />
        )
      }
      case 4:
        return (
          <StepUpload
            file={file}
            onFileSelected={setFile}
            onAnalyze={handleAnalyze}
            submitting={submitting}
            error={error}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="onboarding">
      {step > 1 && (
        <>
          <button className="btn-back" onClick={goBack} disabled={submitting}>
            ← Back
          </button>
          <div className="progress-dots">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span key={i} className={`dot ${i + 1 === step ? 'active' : ''}`} />
            ))}
          </div>
        </>
      )}
      <div className="onboarding-content">
        {/* key={step} forces React to remount this div on every step change, which
            re-triggers the CSS "enter" animation defined in OnboardingFlow.css —
            a lightweight alternative to a transition library for a one-directional
            fade+slide. */}
        <div className="onboarding-step" key={step}>
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

export default OnboardingFlow
