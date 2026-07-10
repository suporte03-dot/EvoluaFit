import { useState } from 'react'
import { sectionIds } from './data/siteData'
import { useScrollSpy } from './hooks/useScrollSpy'
import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedNews from './components/FeaturedNews'
import NewsGrid from './components/NewsGrid'
import FanPanel from './components/FanPanel'
import TrendingSports from './components/TrendingSports'
import CategoryCards from './components/CategoryCards'
import Calendar from './components/Calendar'
import Curiosities from './components/Curiosities'
import Stories from './components/Stories'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'
import NewsModal from './components/NewsModal'
import './App.css'

function App() {
  const [selectedNews, setSelectedNews] = useState(null)
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
        <CategoryCards />
        <Calendar />
        <Curiosities />
        <Stories />
        <Newsletter />
      </main>
      <Footer />
      <NewsModal article={selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  )
}

export default App
