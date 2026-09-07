import { useRef, useState } from 'react'

export type InputMode = 'upload' | 'paste'

interface StepUploadProps {
  file: File | null
  text: string
  mode: InputMode
  onModeChange: (mode: InputMode) => void
  onFileSelected: (file: File | null) => void
  onTextChange: (text: string) => void
  onAnalyze: () => void
  submitting: boolean
  error: string
}

function StepUpload({
  file,
  text,
  mode,
  onModeChange,
  onFileSelected,
  onTextChange,
  onAnalyze,
  submitting,
  error,
}: StepUploadProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) onFileSelected(dropped)
  }

  const canAnalyze = mode === 'upload' ? file !== null : text.trim().length > 0

  return (
    <div className="step-upload">
      <h2>Upload your contract</h2>
      <p className="helper-note">Upload a PDF or Word file, or paste the text directly.</p>

      <div className="mode-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'upload'}
          className={mode === 'upload' ? 'active' : ''}
          onClick={() => onModeChange('upload')}
          disabled={submitting}
        >
          Upload file
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'paste'}
          className={mode === 'paste' ? 'active' : ''}
          onClick={() => onModeChange('paste')}
          disabled={submitting}
        >
          Paste text
        </button>
      </div>

      {mode === 'upload' ? (
        /* A <label htmlFor> wrapping a hidden <input type="file"> is the standard,
           browser-native way to make an arbitrary styled area open the file picker on
           click — more reliable than a <div onClick> calling ref.click(), which doesn't
           consistently work across browsers. tabIndex + onKeyDown add keyboard support,
           since a bare <label> doesn't respond to Enter/Space on its own. */
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
      ) : (
        <textarea
          className="paste-textarea"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste your contract text here..."
          disabled={submitting}
        />
      )}

      <button className="btn-primary" onClick={onAnalyze} disabled={!canAnalyze || submitting}>
        {submitting ? 'Analyzing…' : 'Analyze'}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default StepUpload
