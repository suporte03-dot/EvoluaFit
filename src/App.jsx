import { useState } from 'react'
import { sectionIds } from './data/siteData'
import { useScrollSpy } from './hooks/useScrollSpy'
import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedNews from './components/FeaturedNews'
import NewsGrid from './components/NewsGrid'
import FanPanel from './components/FanPanel'
import TrendingSports from './components/TrendingSports'
import SportsCategories from './components/SportsCategories'
import AgendaSection from './components/AgendaSection'
import Curiosities from './components/Curiosities'
import Stories from './components/Stories'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'
import NewsModal from './components/NewsModal'
import EventModal from './components/agenda/EventModal'
import './App.css'

function App() {
  const [selectedNews, setSelectedNews] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const activeSection = useScrollSpy(sectionIds)

  return (
    <div className="app">
      <Header activeSection={activeSection} />
      <main>
        <Hero />
        <FeaturedNews onReadMore={setSelectedNews} />
        <NewsGrid onReadMore={setSelectedNews} />
        <FanPanel />
        <TrendingSports />
        <SportsCategories />
        <AgendaSection onEventDetails={setSelectedEvent} />
        <Curiosities />
        <Stories />
        <Newsletter />
      </main>
      <Footer />
      <NewsModal article={selectedNews} onClose={() => setSelectedNews(null)} />
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  )
}

export default App
