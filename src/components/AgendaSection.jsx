import { useEffect, useMemo, useRef, useState } from 'react'
import {
  agendaEvents,
  agendaFeaturedEvent,
  filterAgendaEvents,
} from '../data/agendaData'
import SectionReveal from './SectionReveal'
import AgendaHeader from './agenda/AgendaHeader'
import AgendaSummary from './agenda/AgendaSummary'
import AgendaFilters from './agenda/AgendaFilters'
import AgendaTimeline from './agenda/AgendaTimeline'
import AgendaFeatured from './agenda/AgendaFeatured'
import AgendaEventList from './agenda/AgendaEventList'

function AgendaSection({ onEventDetails, periodPreset, onPeriodPresetApplied }) {
  const filtersRef = useRef(null)
  const [sportFilter, setSportFilter] = useState('todos')
  const [periodFilter, setPeriodFilter] = useState('todos')
  const [dayFilter, setDayFilter] = useState(null)

  useEffect(() => {
    if (!periodPreset) return
    setDayFilter(null)
    setPeriodFilter(periodPreset)
    onPeriodPresetApplied?.()
  }, [periodPreset, onPeriodPresetApplied])

  const filteredEvents = useMemo(() => {
    const nonFeatured = agendaEvents.filter((e) => !e.featured)
    return filterAgendaEvents(nonFeatured, {
      sport: sportFilter,
      period: dayFilter ? 'todos' : periodFilter,
      dayISO: dayFilter,
    })
  }, [sportFilter, periodFilter, dayFilter])

  const showFeatured = useMemo(() => {
    if (!agendaFeaturedEvent) return false
    if (sportFilter !== 'todos' && agendaFeaturedEvent.filter !== sportFilter) return false
    if (dayFilter && agendaFeaturedEvent.dateISO !== dayFilter) return false
    if (periodFilter !== 'todos' && !dayFilter) {
      const inPeriod = filterAgendaEvents([agendaFeaturedEvent], {
        sport: 'todos',
        period: periodFilter,
        dayISO: null,
      })
      if (inPeriod.length === 0) return false
    }
    return true
  }, [sportFilter, periodFilter, dayFilter])

  const handleWeekClick = () => {
    setDayFilter(null)
    setPeriodFilter('semana')
  }

  const handleFilterFocus = () => {
    filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    filtersRef.current?.querySelector('button')?.focus()
  }

  const handleSportChange = (id) => {
    setSportFilter(id)
  }

  const handlePeriodChange = (id) => {
    setDayFilter(null)
    setPeriodFilter(id)
  }

  const handleDaySelect = (dayKey) => {
    setPeriodFilter('todos')
    setDayFilter((current) => (current === dayKey ? null : dayKey))
  }

  return (
    <section id="agenda" className="section agenda">
      <div className="container">
        <SectionReveal>
          <AgendaHeader
            onWeekClick={handleWeekClick}
            onFilterFocus={handleFilterFocus}
          />
        </SectionReveal>

        <SectionReveal>
          <AgendaSummary />
        </SectionReveal>

        <SectionReveal>
          <AgendaFilters
            filtersRef={filtersRef}
            sportFilter={sportFilter}
            periodFilter={periodFilter}
            onSportChange={handleSportChange}
            onPeriodChange={handlePeriodChange}
          />
        </SectionReveal>

        <SectionReveal>
          <AgendaTimeline activeDay={dayFilter} onDaySelect={handleDaySelect} />
        </SectionReveal>

        {showFeatured && (
          <SectionReveal>
            <AgendaFeatured
              event={agendaFeaturedEvent}
              onDetails={onEventDetails}
            />
          </SectionReveal>
        )}

        <SectionReveal>
          <AgendaEventList events={filteredEvents} onDetails={onEventDetails} />
        </SectionReveal>
      </div>
    </section>
  )
}

export default AgendaSection
