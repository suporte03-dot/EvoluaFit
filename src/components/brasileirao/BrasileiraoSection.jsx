import { useCallback, useEffect, useState } from 'react'
import {
  formatSportsUpdate,
  getBrasileiraoData,
  getBrasileiraoMatches,
  getBrasileiraoTable,
  getCurrentRound,
  getLastSportsUpdate,
  getTopScorers,
  updateSportsData,
} from '../../services/sportsDataService'
import SectionReveal from '../SectionReveal'
import SectionTitle from '../SectionTitle'
import BrasileiraoTabs from './BrasileiraoTabs'
import BrasileiraoStandings from './BrasileiraoStandings'
import MatchList from './MatchList'
import RoundMatches from './RoundMatches'
import TopScorers from './TopScorers'
import TeamForm from './TeamForm'
import BrasileiraoStats from './BrasileiraoStats'
import MatchModal from './MatchModal'

function BrasileiraoSection() {
  const [activeTab, setActiveTab] = useState('classificacao')
  const [teams, setTeams] = useState(getBrasileiraoTable)
  const [matches, setMatches] = useState(getBrasileiraoMatches)
  const [scorers, setScorers] = useState(getTopScorers)
  const [currentRound, setCurrentRound] = useState(getCurrentRound)
  const [lastUpdate, setLastUpdate] = useState(getLastSportsUpdate)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)

  const refreshData = useCallback(() => {
    setTeams(getBrasileiraoTable())
    setMatches(getBrasileiraoMatches())
    setScorers(getTopScorers())
    setCurrentRound(getCurrentRound())
    setLastUpdate(getLastSportsUpdate())
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await updateSportsData()
      refreshData()
      setToastVisible(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'classificacao':
        return <BrasileiraoStandings teams={teams} />
      case 'jogos':
        return <MatchList matches={matches} onSelectMatch={setSelectedMatch} groupByRound />
      case 'rodada':
        return (
          <RoundMatches
            matches={matches}
            currentRound={currentRound}
            onSelectMatch={setSelectedMatch}
          />
        )
      case 'artilharia':
        return <TopScorers scorers={scorers} />
      case 'forma':
        return <TeamForm teams={teams} />
      case 'estatisticas':
        return <BrasileiraoStats teams={teams} />
      default:
        return null
    }
  }

  return (
    <section id="brasileirao" className="section brasileirao">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Futebol Nacional"
            title="Brasileirão Série A"
            subtitle="Classificação, jogos, rodada, artilharia e desempenho dos clubes."
          />
        </SectionReveal>

        <SectionReveal>
          <div className="brasileirao-disclaimer">
            <p>Dados demonstrativos — atualize conforme fonte oficial.</p>
            <div className="brasileirao-disclaimer__actions">
              <span>Última atualização: {formatSportsUpdate(lastUpdate)}</span>
              <button
                type="button"
                className="btn btn--sm btn--outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Atualizando…' : 'Atualizar dados'}
              </button>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal>
          <BrasileiraoTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </SectionReveal>

        <SectionReveal>
          <div className="brasileirao__content">{renderTabContent()}</div>
        </SectionReveal>
      </div>

      {toastVisible && (
        <div className="brasileirao-toast" role="status">
          <span>Dados do Brasileirão atualizados.</span>
          <button type="button" onClick={() => setToastVisible(false)} aria-label="Fechar">✕</button>
        </div>
      )}

      <MatchModal
        match={selectedMatch}
        allMatches={matches}
        onClose={() => setSelectedMatch(null)}
      />
    </section>
  )
}

export default BrasileiraoSection
