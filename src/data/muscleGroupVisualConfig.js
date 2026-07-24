/**
 * Visual registry for Biblioteca de Exercícios muscle-group cards.
 * Colors, short codes, expanding flags, and neon PNG assets.
 */

import absNeon from '../assets/muscle-groups/abs-neon.png'
import backNeon from '../assets/muscle-groups/back-neon.png'
import bicepsNeon from '../assets/muscle-groups/biceps-neon.png'
import calvesNeon from '../assets/muscle-groups/calves-neon.png'
import cardioNeon from '../assets/muscle-groups/cardio-neon.png'
import chestNeon from '../assets/muscle-groups/chest-neon.png'
import forearmNeon from '../assets/muscle-groups/forearm-neon.png'
import functionalNeon from '../assets/muscle-groups/functional-neon.png'
import glutesNeon from '../assets/muscle-groups/glutes-neon.png'
import legsNeon from '../assets/muscle-groups/legs-neon.png'
import lowerBackNeon from '../assets/muscle-groups/lower-back-neon.png'
import mobilityNeon from '../assets/muscle-groups/mobility-neon.png'
import shouldersNeon from '../assets/muscle-groups/shoulders-neon.png'
import stretchingNeon from '../assets/muscle-groups/stretching-neon.png'
import trapsNeon from '../assets/muscle-groups/traps-neon.png'
import tricepsNeon from '../assets/muscle-groups/triceps-neon.png'

/**
 * Central neon module registry (slug → image + accent).
 * Group ids in GROUP_VISUAL_CONFIG resolve against this map.
 */
export const NEON_MODULE_CONFIG = {
  chest: { image: chestNeon, accent: '#22D3EE' },
  back: { image: backNeon, accent: '#3B82F6' },
  legs: { image: legsNeon, accent: '#FB923C' },
  glutes: { image: glutesNeon, accent: '#C084FC' },
  shoulders: { image: shouldersNeon, accent: '#38BDF8' },
  biceps: { image: bicepsNeon, accent: '#FACC15' },
  triceps: { image: tricepsNeon, accent: '#A3E635' },
  abs: { image: absNeon, accent: '#E879F9' },
  lowerBack: { image: lowerBackNeon, accent: '#2DD4BF' },
  cardio: { image: cardioNeon, accent: '#FF4D6D' },
  mobility: { image: mobilityNeon, accent: '#6366F1' },
  stretching: { image: stretchingNeon, accent: '#38BDF8' },
  functional: { image: functionalNeon, accent: '#06B6D4' },
  calves: { image: calvesNeon, accent: '#FACC15' },
  traps: { image: trapsNeon, accent: '#60A5FA' },
  forearm: { image: forearmNeon, accent: '#22C55E' },
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = Number.parseInt(full, 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

function withNeon(base, moduleKey) {
  const neon = NEON_MODULE_CONFIG[moduleKey]
  if (!neon) return base
  return {
    ...base,
    color: neon.accent,
    rgb: hexToRgb(neon.accent),
    image: neon.image,
    neonKey: moduleKey,
  }
}

export const GROUP_VISUAL_CONFIG = {
  Todos: {
    shortCode: 'TO',
    tone: 'default',
    color: '#2DD4BF',
    rgb: '45, 212, 191',
    subtitle: 'Todos os grupos',
    expanding: false,
  },
  Peitoral: withNeon(
    {
      shortCode: 'PT',
      tone: 'peito',
      subtitle: 'Peito e empurrar',
      expanding: false,
    },
    'chest',
  ),
  Costas: withNeon(
    {
      shortCode: 'CO',
      tone: 'costas',
      subtitle: 'Puxar e postura',
      expanding: false,
    },
    'back',
  ),
  Pernas: withNeon(
    {
      shortCode: 'PN',
      tone: 'pernas',
      subtitle: 'Base e potência',
      expanding: false,
    },
    'legs',
  ),
  Glúteos: withNeon(
    {
      shortCode: 'GL',
      tone: 'gluteos',
      subtitle: 'Posterior e estabilidade',
      expanding: true,
    },
    'glutes',
  ),
  Ombros: withNeon(
    {
      shortCode: 'OM',
      tone: 'ombros',
      subtitle: 'Deltoides e mobilidade',
      expanding: false,
    },
    'shoulders',
  ),
  Bíceps: withNeon(
    {
      shortCode: 'BI',
      tone: 'biceps',
      subtitle: 'Flexão e controle',
      expanding: false,
    },
    'biceps',
  ),
  Tríceps: withNeon(
    {
      shortCode: 'TR',
      tone: 'triceps',
      subtitle: 'Extensão e trava',
      expanding: false,
    },
    'triceps',
  ),
  Abdômen: withNeon(
    {
      shortCode: 'AB',
      tone: 'abdomen',
      subtitle: 'Core e estabilidade',
      expanding: true,
    },
    'abs',
  ),
  Mobilidade: withNeon(
    {
      shortCode: 'MO',
      tone: 'mobilidade',
      subtitle: 'Movimento livre',
      expanding: true,
    },
    'mobility',
  ),
  Antebraço: withNeon(
    {
      shortCode: 'AN',
      tone: 'antebraco',
      subtitle: 'Pegada e controle',
      expanding: false,
    },
    'forearm',
  ),
  Lombar: withNeon(
    {
      shortCode: 'LO',
      tone: 'lombar',
      subtitle: 'Suporte e postura',
      expanding: false,
    },
    'lowerBack',
  ),
  Cardio: withNeon(
    {
      shortCode: 'CA',
      tone: 'cardio',
      subtitle: 'Resistência e energia',
      expanding: true,
    },
    'cardio',
  ),
  Trapézio: withNeon(
    {
      shortCode: 'TP',
      tone: 'trapezio',
      subtitle: 'Pescoço e postura',
      expanding: false,
    },
    'traps',
  ),
  Panturrilha: withNeon(
    {
      shortCode: 'PA',
      tone: 'panturrilha',
      subtitle: 'Impulso e estabilidade',
      expanding: false,
    },
    'calves',
  ),
  Funcional: withNeon(
    {
      shortCode: 'FU',
      tone: 'funcional',
      subtitle: 'Movimento integrado',
      expanding: false,
    },
    'functional',
  ),
  Alongamento: withNeon(
    {
      shortCode: 'AL',
      tone: 'alongamento',
      subtitle: 'Flexibilidade e relax',
      expanding: false,
    },
    'stretching',
  ),
}

/** Neon PNG assets mapped to browse group ids (legacy export) */
export const MUSCLE_GROUP_NEON_IMAGES = Object.fromEntries(
  Object.entries(GROUP_VISUAL_CONFIG)
    .filter(([, cfg]) => cfg.image)
    .map(([id, cfg]) => [id, cfg.image]),
)

const DEFAULT_VISUAL = {
  shortCode: 'MG',
  letter: 'MG',
  tone: 'default',
  color: '#2DD4BF',
  rgb: '45, 212, 191',
  subtitle: 'Grupo muscular',
  expanding: false,
  image: null,
  neonImage: null,
}

/** Resolve visual config for a muscle group id */
export function getMuscleGroupVisual(groupId) {
  const cfg = GROUP_VISUAL_CONFIG[groupId]
  if (!cfg) return DEFAULT_VISUAL
  return {
    ...cfg,
    letter: cfg.shortCode,
    neonImage: cfg.image || null,
  }
}

/** Legacy alias map used by older imports */
export const groupLetters = Object.fromEntries(
  Object.entries(GROUP_VISUAL_CONFIG).map(([id, cfg]) => [id, cfg.shortCode]),
)

export const FEATURED_GROUP_IDS = []

export { GROUP_VISUAL_CONFIG as GROUP_VISUALS }
