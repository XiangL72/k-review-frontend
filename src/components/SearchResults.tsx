import './SearchResults.css'

interface Contract {
  id: number
  content: string
  createdAt: string
}

interface SearchResultsProps {
  results: Contract[]
  searching: boolean
  onSelectContract: (id: number) => void
}

function SearchResults({ results, searching, onSelectContract }: SearchResultsProps) {
  if (searching) {
    return (
      <div className="search-results">
        <p className="search-status">Searching...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="search-results">
        <p className="search-status">No contracts matched your search.</p>
      </div>
    )
  }

  return (
    <div className="search-results">
      <div className="search-results-head">
        <h3>
          Search results <span className="count">{results.length}</span>
        </h3>
      </div>

      <div className="result-list">
        {results.map(contract => (
          <div
            key={contract.id}
            className="result-row"
            onClick={() => onSelectContract(contract.id)}
          >
            <div className="result-preview">
              {contract.content.substring(0, 200)}{contract.content.length > 200 ? '...' : ''}
            </div>
            <div className="result-date">
              {new Date(contract.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchResults