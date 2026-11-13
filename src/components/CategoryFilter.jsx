import { newsFilters } from '../data/siteData'

function CategoryFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="category-filter" role="tablist" aria-label="Filtrar por modalidade">
      {newsFilters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          role="tab"
          aria-selected={activeFilter === filter.id}
          className={`category-filter__chip ${activeFilter === filter.id ? 'category-filter__chip--active' : ''}`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
