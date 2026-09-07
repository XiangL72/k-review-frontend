import { useState, useEffect } from 'react'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
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
  contractType: string | null
  partyRole: string | null
  partyRoleCustomLabel: string | null
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

  const hasResult = status !== null

  return (
    <div className={`app-shell${hasResult ? ' has-result' : ''}`}>
      <header className="nav">
        <div className="nav-inner">
          <div className="brand">
            <span className="brand-mark">K</span>
            <span className="brand-name">K-Review</span>
          </div>

          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            hasResults={searchResults !== null}
          />
        </div>
      </header>

      <main className="main">
        {searchResults !== null ? (
          <div className="container">
            <SearchResults
              results={searchResults}
              searching={searching}
              onSelectContract={handleSelectContract}
            />
          </div>
        ) : (
          <>
            <OnboardingFlow onJobSubmitted={handleJobSubmitted} />
            <div className="container workspace">
              <ResultsDisplay status={status} result={result} onReset={handleReset} />
              <ContractHistory
                key={refreshKey}
                onSelectContract={handleSelectContract}
                disabled={status === 'PENDING' || status === 'PROCESSING'}
              />
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-brand">K-Review</span>
          <span className="muted">AI-powered contract analysis</span>
        </div>
      </footer>
    </div>
  )
}

export default App
