import { allNews, categories, curiosities, stories } from '../data/siteData'
import { getAgendaEvents } from '../data/agendaData'
import { brasileiraoSerieA } from '../data/brasileiraoData'
import { competitions } from '../data/standingsData'

function matches(text, query) {
  return text?.toLowerCase().includes(query)
}

export function searchAllContent(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results = []

  allNews.forEach((item) => {
    if (
      matches(item.title, q) ||
      matches(item.excerpt, q) ||
      matches(item.category, q)
    ) {
      results.push({
        id: `news-${item.id}`,
        type: 'news',
        title: item.title,
        subtitle: item.category,
        data: item,
      })
    }
  })

  brasileiraoSerieA.teams.forEach((team) => {
    if (matches(team.name, q) || matches(team.shortName, q)) {
      results.push({
        id: `team-${team.id}`,
        type: 'team',
        title: team.name,
        subtitle: `Brasileirão · ${team.position}º · ${team.points} pts`,
        data: team,
      })
    }
  })

  competitions.forEach((comp) => {
    if (
      matches(comp.name, q) ||
      matches(comp.country, q) ||
      comp.teams?.some((t) => matches(t.name, q))
    ) {
      results.push({
        id: `comp-${comp.id}`,
        type: 'competition',
        title: comp.name,
        subtitle: comp.country ?? comp.sport,
        data: comp,
      })
    }
  })

  categories.forEach((cat) => {
    if (matches(cat.name, q) || matches(cat.description, q)) {
      results.push({
        id: `cat-${cat.id}`,
        type: 'modality',
        title: cat.name,
        subtitle: 'Modalidade',
        data: cat,
      })
    }
  })

  getAgendaEvents().forEach((event) => {
    if (
      matches(event.title, q) ||
      matches(event.sport, q) ||
      matches(event.location, q)
    ) {
      results.push({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        subtitle: `${event.sport} · ${event.date}`,
        data: event,
      })
    }
  })

  curiosities.forEach((item) => {
    if (matches(item.question, q) || matches(item.answer, q) || matches(item.sport, q)) {
      results.push({
        id: `curiosity-${item.id}`,
        type: 'curiosity',
        title: item.question,
        subtitle: item.sport,
        data: item,
      })
    }
  })

  stories.forEach((item) => {
    if (matches(item.title, q) || matches(item.excerpt, q) || matches(item.sport, q)) {
      results.push({
        id: `story-${item.id}`,
        type: 'story',
        title: item.title,
        subtitle: item.sport,
        data: item,
      })
    }
  })

  return results.slice(0, 12)
}
