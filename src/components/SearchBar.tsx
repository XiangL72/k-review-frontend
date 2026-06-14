import { useState } from 'react'
import './SearchBar.css'

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear: () => void
  hasResults: boolean
}

function SearchBar({ onSearch, onClear, hasResults }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    const trimmed = query.trim()
    if (trimmed.length === 0) return
    onSearch(trimmed)
  }

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search past contracts..."
      />
      <button onClick={handleSearch} className="search-btn">
        Search
      </button>
      {hasResults && (
        <button onClick={handleClear} className="clear-btn">
          Clear
        </button>
      )}
    </div>
  )
}

export default SearchBar