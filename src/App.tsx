import { useState } from 'react'
import UploadForm from './components/UploadForm'
import ResultsDisplay from './components/ResultsDisplay'

function App() {
  const [result, setResult] = useState<any>(null)

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h1>K-Review</h1>
      <p>Paste your contract text below for analysis.</p>
      <UploadForm onAnalysisComplete={setResult} />
      {result && <ResultsDisplay result={result} />}
    </div>
  )
}

export default App