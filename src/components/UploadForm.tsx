import { useState, useEffect } from 'react'
import './UploadForm.css'
import { API_BASE_URL } from '../config/api'

interface UploadFormProps {
  onJobSubmitted: (jobId: string, contractId: number) => void
}

interface ContractTypeOption {
  type: string
  roles: string[]
}

interface ContractTypesResponse {
  types: ContractTypeOption[]
  genericRoles: string[]
}

function prettifyEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    if (body && typeof body.error === 'string') {
      return body.error
    }
  } catch {
    // response wasn't JSON — fall through to the fallback message
  }
  return fallback
}

function UploadForm({ onJobSubmitted }: UploadFormProps) {
  const [typesData, setTypesData] = useState<ContractTypesResponse | null>(null)

  const [contractType, setContractType] = useState('') // '' = general/no specific type
  const [partyRole, setPartyRole] = useState('')
  const [customLabel, setCustomLabel] = useState('')

  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/contracts/types`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => setTypesData(data))
      .catch(() => setTypesData(null))
  }, [])

  const roleOptions: string[] = contractType
    ? typesData?.types.find(t => t.type === contractType)?.roles ?? []
    : typesData?.genericRoles ?? []

  const handleTypeChange = (value: string) => {
    setContractType(value)
    setPartyRole('')
    setCustomLabel('')
  }

  const handleSubmit = async () => {
    setError('')

    if (contractType && !partyRole) {
      setError('Please select which party you are.')
      return
    }
    if (partyRole === 'OTHER' && !customLabel.trim()) {
      setError('Please describe your role (e.g. "Guarantor").')
      return
    }
    if (inputMode === 'paste' && !text.trim()) {
      setError('Please paste contract text first.')
      return
    }
    if (inputMode === 'upload' && !file) {
      setError('Please choose a file to upload.')
      return
    }

    setSubmitting(true)

    try {
      let submitRes: Response

      if (inputMode === 'paste') {
        submitRes = await fetch(`${API_BASE_URL}/api/contracts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: text,
            contractType: contractType || null,
            partyRole: partyRole || null,
            partyRoleCustomLabel: partyRole === 'OTHER' ? customLabel : null,
          }),
        })
      } else {
        const formData = new FormData()
        formData.append('file', file as File)
        if (contractType) formData.append('contractType', contractType)
        if (partyRole) formData.append('partyRole', partyRole)
        if (partyRole === 'OTHER') formData.append('partyRoleCustomLabel', customLabel)

        submitRes = await fetch(`${API_BASE_URL}/api/contracts/upload`, {
          method: 'POST',
          body: formData,
        })
      }

      if (!submitRes.ok) {
        setError(await extractErrorMessage(submitRes, 'Could not submit the contract.'))
        return
      }

      const contract = await submitRes.json()

      const analyzeRes = await fetch(`${API_BASE_URL}/api/contracts/${contract.id}/analyze`, {
        method: 'POST',
      })

      if (!analyzeRes.ok) {
        setError(await extractErrorMessage(analyzeRes, 'Could not start analysis.'))
        return
      }

      const { jobId } = await analyzeRes.json()
      onJobSubmitted(jobId, contract.id)
      setText('')
      setFile(null)
    } catch {
      setError('Error connecting to server. Make sure the backend is running.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="upload-form">
      <div className="form-row">
        <label>Contract type</label>
        <select
          value={contractType}
          onChange={e => handleTypeChange(e.target.value)}
          disabled={submitting}
        >
          <option value="">General (no specific type)</option>
          {typesData?.types.map(t => (
            <option key={t.type} value={t.type}>{prettifyEnum(t.type)}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Which party are you?</label>
        <select
          value={partyRole}
          onChange={e => setPartyRole(e.target.value)}
          disabled={submitting || roleOptions.length === 0}
        >
          <option value="">Select a role...</option>
          {roleOptions.map(role => (
            <option key={role} value={role}>{prettifyEnum(role)}</option>
          ))}
        </select>
      </div>

      {partyRole === 'OTHER' && (
        <div className="form-row">
          <label>Describe your role</label>
          <input
            type="text"
            value={customLabel}
            onChange={e => setCustomLabel(e.target.value)}
            placeholder="e.g. Guarantor"
            disabled={submitting}
          />
        </div>
      )}

      <div className="input-mode-toggle">
        <button
          type="button"
          className={inputMode === 'paste' ? 'active' : ''}
          onClick={() => setInputMode('paste')}
          disabled={submitting}
        >
          Paste text
        </button>
        <button
          type="button"
          className={inputMode === 'upload' ? 'active' : ''}
          onClick={() => setInputMode('upload')}
          disabled={submitting}
        >
          Upload file
        </button>
      </div>

      {inputMode === 'paste' ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste contract text here..."
          disabled={submitting}
        />
      ) : (
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          disabled={submitting}
        />
      )}

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Analyze Contract'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default UploadForm
