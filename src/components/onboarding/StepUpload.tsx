import { useRef, useState } from 'react'

interface StepUploadProps {
  file: File | null
  onFileSelected: (file: File | null) => void
  onAnalyze: () => void
  submitting: boolean
  error: string
}

function StepUpload({ file, onFileSelected, onAnalyze, submitting, error }: StepUploadProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) onFileSelected(dropped)
  }

  return (
    <div className="step-upload">
      <h2>Upload your contract</h2>
      <p className="helper-note">PDF, Word (.docx), or plain text.</p>

      {/* A <label htmlFor> wrapping a hidden <input type="file"> is the standard,
          browser-native way to make an arbitrary styled area open the file picker on
          click — more reliable than a <div onClick> calling ref.click(), which doesn't
          consistently work across browsers. tabIndex + onKeyDown add keyboard support,
          since a bare <label> doesn't respond to Enter/Space on its own. */}
      <label
        htmlFor="onboarding-file-input"
        className={`dropzone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <input
          ref={inputRef}
          id="onboarding-file-input"
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
          disabled={submitting}
          hidden
        />
        {file ? (
          <>
            <p>Selected file:</p>
            <p className="filename">{file.name}</p>
          </>
        ) : (
          <p>Drag &amp; drop your file here, or click to choose one.</p>
        )}
      </label>

      <button className="btn-primary" onClick={onAnalyze} disabled={!file || submitting}>
        {submitting ? 'Analyzing…' : 'Analyze'}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default StepUpload
