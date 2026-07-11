import { useEffect, useState } from 'react'
import { sectionIds } from './data/siteData'
import { useScrollSpy } from './hooks/useScrollSpy'
import { scrollToSection } from './utils/scrollToSection'
import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedNews from './components/FeaturedNews'
import NewsGrid from './components/NewsGrid'
import BrasileiraoSection from './components/brasileirao/BrasileiraoSection'
import FanPanel from './components/FanPanel'
import TrendingSports from './components/TrendingSports'
import SportsCategories from './components/SportsCategories'
import AgendaSection from './components/AgendaSection'
import StandingsSection from './components/standings/StandingsSection'
import CompetitionModal from './components/standings/CompetitionModal'
import Curiosities from './components/Curiosities'
import Stories from './components/Stories'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'
import NewsModal from './components/NewsModal'
import EventModal from './components/agenda/EventModal'
import SportModal from './components/SportModal'
import StoryModal from './components/StoryModal'
import CuriosityModal from './components/CuriosityModal'
import './App.css'

function App() {
  const [selectedNews, setSelectedNews] = useState(null)
  const [newsList, setNewsList] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedSport, setSelectedSport] = useState(null)
  const [selectedStory, setSelectedStory] = useState(null)
  const [selectedCuriosity, setSelectedCuriosity] = useState(null)
  const [agendaPeriodPreset, setAgendaPeriodPreset] = useState(null)
  const [sportHighlight, setSportHighlight] = useState(null)
  const [selectedCompetition, setSelectedCompetition] = useState(null)
  const [selectedStandingTeam, setSelectedStandingTeam] = useState(null)
  const activeSection = useScrollSpy(sectionIds)

  useEffect(() => {
    if (!sportHighlight) return undefined

    const timer = window.setTimeout(() => setSportHighlight(null), 4000)
    return () => window.clearTimeout(timer)
  }, [sportHighlight])

  const handleFanPanelNavigate = (sectionId, options = {}) => {
    if (options.agendaPeriod) {
      setAgendaPeriodPreset(options.agendaPeriod)
    }
    if (options.sportHighlight) {
      setSportHighlight(options.sportHighlight)
    }
    scrollToSection(sectionId)
  }

  const openNews = (article, list = []) => {
    setNewsList(list.length ? list : [article])
    setSelectedNews(article)
  }

  const openNewsFromSport = (article) => {
    setSelectedSport(null)
    openNews(article, [article])
  }

  const openEventFromSport = (event) => {
    setSelectedSport(null)
    setSelectedEvent(event)
  }

  return (
    <div className="app">
      <Header
        activeSection={activeSection}
        onSelectNews={(article) => openNews(article, [article])}
        onSelectEvent={setSelectedEvent}
        onSelectStory={setSelectedStory}
        onSelectCuriosity={setSelectedCuriosity}
        onSelectModality={setSelectedSport}
        onSelectTeam={() => scrollToSection('brasileirao')}
        onSelectCompetition={() => scrollToSection('tabelas')}
      />
      <main>
        <Hero />
        <FeaturedNews onReadMore={(article, list) => openNews(article, list)} />
        <NewsGrid onReadMore={(article, list) => openNews(article, list)} />
        <BrasileiraoSection />
        <FanPanel onNavigate={handleFanPanelNavigate} />
        <TrendingSports onSportHighlight={setSportHighlight} />
        <SportsCategories
          highlightSport={sportHighlight}
          onSelectCategory={(category) => {
            setSportHighlight(null)
            setSelectedSport(category)
          }}
        />
        <StandingsSection
          onCompetitionDetails={(competition) => {
            setSelectedStandingTeam(null)
            setSelectedCompetition(competition)
          }}
          onTeamDetails={({ competition, team }) => {
            setSelectedCompetition(competition)
            setSelectedStandingTeam(team)
          }}
        />
        <AgendaSection
          onEventDetails={setSelectedEvent}
          periodPreset={agendaPeriodPreset}
          onPeriodPresetApplied={() => setAgendaPeriodPreset(null)}
        />
        <Curiosities onSelectCuriosity={setSelectedCuriosity} />
        <Stories onSelectStory={setSelectedStory} />
        <div id="contato">
          <Newsletter />
          <Footer />
        </div>
      </main>
      <NewsModal
        article={selectedNews}
        articles={newsList}
        onNavigate={setSelectedNews}
        onClose={() => setSelectedNews(null)}
      />
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <SportModal
        category={selectedSport}
        onClose={() => setSelectedSport(null)}
        onReadNews={openNewsFromSport}
        onViewEvent={openEventFromSport}
      />
      <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />
      <CuriosityModal curiosity={selectedCuriosity} onClose={() => setSelectedCuriosity(null)} />
      <CompetitionModal
        competition={selectedCompetition}
        selectedTeam={selectedStandingTeam}
        onTeamSelect={setSelectedStandingTeam}
        onClose={() => {
          setSelectedCompetition(null)
          setSelectedStandingTeam(null)
        }}
      />
    </div>
  )
}

export default App
