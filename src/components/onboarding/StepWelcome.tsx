interface StepWelcomeProps {
  onNext: () => void
}

function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="step-welcome">
      <span className="eyebrow">AI contract analysis</span>
      <h1>Clarity before commitment.</h1>
      <p className="subtext">Upload a contract and see exactly where the risk sits, in minutes.</p>
      <button className="btn-primary" onClick={onNext}>Get started</button>
    </div>
  )
}

export default StepWelcome
