const TABS = [
  { id: 'classificacao', label: 'Classificação' },
  { id: 'jogos', label: 'Jogos' },
  { id: 'rodada', label: 'Rodada' },
  { id: 'artilharia', label: 'Artilharia' },
  { id: 'forma', label: 'Forma' },
  { id: 'estatisticas', label: 'Estatísticas' },
]

function BrasileiraoTabs({ activeTab, onTabChange }) {
  return (
    <div className="brasileirao-tabs" role="tablist" aria-label="Abas do Brasileirão">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`brasileirao-tabs__btn ${activeTab === tab.id ? 'brasileirao-tabs__btn--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default BrasileiraoTabs
