import { useState } from 'react'
import UploadForm from './components/UploadForm'
import ResultsDisplay from './components/ResultsDisplay'
import ContractHistory from './components/ContractHistory'
import './App.css'

function App() {
  const [result, setResult] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAnalysisComplete = (analysis: any) => {
    setResult(analysis)
    setRefreshKey(prev => prev + 1)
  }

  const handleSelectContract = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/contracts/${id}/analyze`, {
        method: 'POST'
      })
      const analysis = await res.json()
      setResult(analysis)
    } catch (err) {
      console.error('Failed to load analysis:', err)
    }
  }

  return (
    <div className="app">
      <h1>K-Review</h1>
      <p>AI-powered contract analysis platform</p>
      <UploadForm onAnalysisComplete={handleAnalysisComplete} />
      {result && <ResultsDisplay result={result} />}
      <ContractHistory key={refreshKey} onSelectContract={handleSelectContract} />
    </div>
  )
}

export default App