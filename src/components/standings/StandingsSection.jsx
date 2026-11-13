import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  fetchStandings,
  getCompetitionById,
  getCompetitions,
  refreshStandings,
  searchStandings,
} from '../../services/standingsService'
import { formatGoalDifference, formatLastUpdated } from '../../utils/standingsUtils'
import SectionReveal from '../SectionReveal'
import SectionTitle from '../SectionTitle'
import StandingsSearch from './StandingsSearch'
import StandingsFilters from './StandingsFilters'
import CompetitionTabs from './CompetitionTabs'
import CompetitionCards from './CompetitionCards'
import StandingsTable from './StandingsTable'
import WorldCupGroups from './WorldCupGroups'
import KnockoutBracket from './KnockoutBracket'
import StandingsToast from './StandingsToast'

const GROUP_KNOCKOUT_PHASES = [
  { id: 'grupos', label: 'Grupos' },
  { id: 'oitavas', label: 'Oitavas' },
  { id: 'quartas', label: 'Quartas' },
  { id: 'semifinal', label: 'Semifinal' },
  { id: 'final', label: 'Final' },
]

function GroupsView({ competition, onTeamClick }) {
  if (!competition?.groups?.length) return null

  return (
    <div className="standings-groups">
      <p className="standings-groups__demo-note">Grupos ilustrativos — dados demonstrativos.</p>
      <div className="standings-groups__grid">
        {competition.groups.map((group) => (
          <div key={group.id} className="standings-groups__group card">
            <h3 className="standings-groups__name">{group.name}</h3>
            <div className="standings-table-scroll">
              <table className="standings-table standings-table--compact">
                <thead className="standings-table__head">
                  <tr>
                    <th>Posição</th>
                    <th>Time</th>
                    <th>J</th>
                    <th>Pts</th>
                    <th>SG</th>
                  </tr>
                </thead>
                <tbody>
                  {group.teams.map((team, index) => (
                    <tr
                      key={team.id}
                      className={`standings-table__row ${index < 2 ? 'standings-table__row--zone-classification' : ''}`}
                      onClick={() => onTeamClick(team)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onTeamClick(team)
                        }
                      }}
                    >
                      <td>{team.position}</td>
                      <td className="standings-table__team">{team.name}</td>
                      <td>{team.played}</td>
                      <td className="standings-table__pts">{team.points}</td>
                      <td className="standings-table__gd">{formatGoalDifference(team.goalDifference)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <div className="standings-legend">
        <span className="standings-legend__item">
          <span className="standings-legend__swatch" style={{ background: '#00E887' }} />
          Classificados
        </span>
        <span className="standings-legend__item">
          <span className="standings-legend__swatch" style={{ background: '#4DA3FF' }} />
          Pré-classificação / vagas extras
        </span>
      </div>
    </div>
  )
}

function GroupsKnockoutView({ competition, activePhase, onPhaseChange, onTeamClick }) {
  const showGroups = activePhase === 'grupos'

  return (
    <div className="groups-knockout-view">
      <div className="world-cup-groups__phases">
        {GROUP_KNOCKOUT_PHASES.map((phase) => (
          <button
            key={phase.id}
            type="button"
            className={`world-cup-groups__phase ${activePhase === phase.id ? 'world-cup-groups__phase--active' : ''}`}
            onClick={() => onPhaseChange(phase.id)}
          >
            {phase.label}
          </button>
        ))}
      </div>

      {showGroups ? (
        <GroupsView competition={competition} onTeamClick={onTeamClick} />
      ) : (
        <KnockoutBracket
          knockout={competition.knockout}
          activePhase={activePhase}
          onPhaseChange={onPhaseChange}
          showPhaseTabs={false}
          hasGroups
          onTeamClick={(payload) => {
            const found = competition.groups
              ?.flatMap((g) => g.teams)
              .find((t) => t.name.toLowerCase() === payload.name?.toLowerCase())
            if (found) onTeamClick(found)
          }}
        />
      )}
    </div>
  )
}

function ComingSoon({ competition }) {
  return (
    <div className="standings-coming-soon card">
      <span className="standings-coming-soon__icon" aria-hidden="true">📊</span>
      <h3>{competition?.name ?? 'Em breve'}</h3>
      <p>{competition?.notes ?? 'As tabelas desta modalidade estarão disponíveis em breve na Arena 360.'}</p>
      <span className="standings-coming-soon__badge">Em breve</span>
    </div>
  )
}

function StandingsSection({ onCompetitionDetails, onTeamDetails }) {
  const tableRef = useRef(null)
  const [sportFilter, setSportFilter] = useState('futebol')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCompetitionId, setActiveCompetitionId] = useState('brasileirao-serie-a')
  const [knockoutPhase, setKnockoutPhase] = useState('oitavas')
  const [worldCupPhase, setWorldCupPhase] = useState('grupos')
  const [groupsKnockoutPhase, setGroupsKnockoutPhase] = useState('grupos')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)

  useEffect(() => {
    fetchStandings().then(({ lastUpdated: ts }) => setLastUpdated(ts))
  }, [])

  const sportCompetitions = useMemo(() => {
    const base = getCompetitions(sportFilter)
    if (!searchQuery.trim()) return base
    return searchStandings(searchQuery, base)
  }, [sportFilter, searchQuery, dataVersion])

  useEffect(() => {
    if (sportCompetitions.length === 0) return
    const exists = sportCompetitions.some((c) => c.id === activeCompetitionId)
    if (!exists) {
      setActiveCompetitionId(sportCompetitions[0].id)
    }
  }, [sportCompetitions, activeCompetitionId])

  const activeCompetition = useMemo(
    () => getCompetitionById(activeCompetitionId),
    [activeCompetitionId, dataVersion],
  )

  useEffect(() => {
    if (activeCompetition?.type === 'groups-knockout') {
      setGroupsKnockoutPhase('grupos')
    } else if (activeCompetition?.type === 'knockout') {
      setKnockoutPhase('oitavas')
    } else if (activeCompetition?.type === 'world-cup') {
      setWorldCupPhase('grupos')
    }
  }, [activeCompetitionId, activeCompetition?.type])

  const footballTabs = useMemo(
    () => (sportFilter === 'futebol' ? getCompetitions('futebol') : []),
    [sportFilter, dataVersion],
  )

  const cardCompetitions = useMemo(() => {
    if (searchQuery.trim()) return sportCompetitions
    if (sportFilter === 'futebol') return sportCompetitions.filter((c) => c.featured)
    return sportCompetitions
  }, [sportCompetitions, searchQuery, sportFilter])

  const handleViewTable = (id) => {
    setActiveCompetitionId(id)
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleTeamClick = (team) => {
    if (activeCompetition) {
      onTeamDetails?.({ competition: activeCompetition, team })
    }
  }

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const { lastUpdated: ts } = await refreshStandings()
      setLastUpdated(ts)
      setDataVersion((v) => v + 1)
      setToastVisible(true)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const renderContent = () => {
    if (!activeCompetition) {
      return (
        <div className="standings-empty card">
          <h3>Nenhum resultado encontrado</h3>
          <p>Tente outro termo de busca ou selecione outra modalidade.</p>
        </div>
      )
    }

    if (activeCompetition.type === 'coming-soon') {
      return <ComingSoon competition={activeCompetition} />
    }

    switch (activeCompetition.type) {
      case 'league':
        return (
          <StandingsTable competition={activeCompetition} onTeamClick={handleTeamClick} />
        )
      case 'knockout':
        return (
          <KnockoutBracket
            knockout={activeCompetition.knockout}
            activePhase={knockoutPhase}
            onPhaseChange={setKnockoutPhase}
          />
        )
      case 'groups-knockout':
        return (
          <GroupsKnockoutView
            competition={activeCompetition}
            activePhase={groupsKnockoutPhase}
            onPhaseChange={setGroupsKnockoutPhase}
            onTeamClick={handleTeamClick}
          />
        )
      case 'world-cup':
        return (
          <WorldCupGroups
            competition={activeCompetition}
            activePhase={worldCupPhase}
            onPhaseChange={setWorldCupPhase}
            onTeamClick={handleTeamClick}
            knockoutComponent={
              <KnockoutBracket
                knockout={activeCompetition.knockout}
                activePhase={worldCupPhase === 'grupos' ? 'oitavas' : worldCupPhase}
                onPhaseChange={setWorldCupPhase}
                showPhaseTabs={false}
              />
            }
          />
        )
      default:
        return <ComingSoon competition={activeCompetition} />
    }
  }

  const hasResults = sportCompetitions.length > 0

  return (
    <section id="tabelas" className="section standings">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Classificações"
            title="Tabelas e Campeonatos"
            subtitle="Acompanhe classificações, grupos, fases eliminatórias e os principais campeonatos do Brasil e do mundo."
          />
        </SectionReveal>

        <SectionReveal>
          <div className="standings-disclaimer">
            <p className="standings-disclaimer__text">
              Dados demonstrativos — atualizar conforme fonte oficial.
            </p>
            <div className="standings-disclaimer__actions">
              <span className="standings-disclaimer__updated">
                Última atualização: {formatLastUpdated(lastUpdated)}
              </span>
              <button
                type="button"
                className="standings-disclaimer__refresh btn btn--sm btn--outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Atualizando…' : 'Atualizar tabelas'}
              </button>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal>
          <StandingsSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </SectionReveal>

        <SectionReveal>
          <StandingsFilters activeSport={sportFilter} onSportChange={setSportFilter} />
        </SectionReveal>

        {sportFilter === 'futebol' && hasResults && (
          <SectionReveal>
            <CompetitionTabs
              competitions={footballTabs}
              activeId={activeCompetitionId}
              onSelect={setActiveCompetitionId}
            />
          </SectionReveal>
        )}

        {hasResults ? (
          <>
            <SectionReveal>
              <CompetitionCards
                competitions={cardCompetitions}
                activeId={activeCompetitionId}
                onSelect={setActiveCompetitionId}
                onViewTable={handleViewTable}
              />
            </SectionReveal>

            <SectionReveal>
              <div className="standings__content" ref={tableRef}>
                {activeCompetition && (
                  <div className="standings__content-header">
                    <h3 className="standings__content-title">{activeCompetition.name}</h3>
                    <button
                      type="button"
                      className="standings__details-btn"
                      onClick={() => onCompetitionDetails?.(activeCompetition)}
                    >
                      Ver detalhes
                    </button>
                  </div>
                )}
                {renderContent()}
              </div>
            </SectionReveal>
          </>
        ) : (
          <SectionReveal>
            <div className="standings-empty card">
              <h3>Nenhum resultado encontrado</h3>
              <p>Não encontramos campeonatos ou times para &quot;{searchQuery}&quot;.</p>
            </div>
          </SectionReveal>
        )}
      </div>

      <StandingsToast
        message="Tabelas atualizadas com os dados disponíveis."
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </section>
  )
}

export default StandingsSection
