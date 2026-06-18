import { useState, useEffect } from 'react'
import UploadForm from './components/UploadForm'
import ResultsDisplay from './components/ResultsDisplay'
import ContractHistory from './components/ContractHistory'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import './App.css'
import { API_BASE_URL } from './config/api'

type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED'

interface Clause {
  id: number
  type: string
  text: string
  riskLevel: string
}

interface AnalysisResult {
  id: number
  summary: string
  overallRiskScore: number
  clauses: Clause[]
  contract: Contract
}

interface Contract {
  id: number
  content: string
  createdAt: string
}

function App() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [contractId, setContractId] = useState<number | null>(null)
  const [status, setStatus] = useState<JobStatus | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchResults, setSearchResults] = useState<Contract[] | null>(null)
  const [searching, setSearching] = useState(false)

  const handleJobSubmitted = (newJobId: string, newContractId: number) => {
    setJobId(newJobId)
    setContractId(newContractId)
    setStatus('PENDING')
    setResult(null)
  }

  const handleReset = () => {
    setJobId(null)
    setContractId(null)
    setStatus(null)
    setResult(null)
  }

  useEffect(() => {
    if (!jobId || !contractId) return
    if (status === 'COMPLETE' || status === 'FAILED') return

    const intervalId = setInterval(async () => {
      try {
        const statusRes = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/status`)
        if (!statusRes.ok) return

        const { status: newStatus } = await statusRes.json()
        setStatus(newStatus)

        if (newStatus === 'COMPLETE') {
          const resultRes = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/analysis`)
          if (resultRes.ok) {
            const analysis = await resultRes.json()
            setResult(analysis)
            setRefreshKey(prev => prev + 1)
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 2000)

    return () => clearInterval(intervalId)
  }, [jobId, contractId, status])

  const handleSelectContract = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contracts/${id}/analysis`)
      if (res.ok) {
        const analysis = await res.json()
        setResult(analysis)
        setStatus('COMPLETE')
        setSearchResults(null)
      }
    } catch (err) {
      console.error('Failed to load analysis:', err)
    }
}

  const handleSearch = async (query: string) => {
    setSearching(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/contracts/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const results: Contract[] = await res.json()
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchResults(null)
  }

  return (
    <div className="app">
      <h1>K-Review</h1>
      <p>AI-powered contract analysis platform</p>

      <SearchBar
        onSearch={handleSearch}
        onClear={handleClearSearch}
        hasResults={searchResults !== null}
      />

      {searchResults !== null ? (
        <SearchResults
          results={searchResults}
          searching={searching}
          onSelectContract={handleSelectContract}
        />
      ) : (
        <>
          <UploadForm onJobSubmitted={handleJobSubmitted} />
          <ResultsDisplay status={status} result={result} onReset={handleReset} />
          <ContractHistory
            key={refreshKey}
            onSelectContract={handleSelectContract}
            disabled={status === 'PENDING' || status === 'PROCESSING'}
          />
        </>
      )}
    </div>
  )
}

export default App