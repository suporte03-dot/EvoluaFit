/**
 * Visual registry for Biblioteca de Exercícios muscle-group cards.
 * Colors, short codes, expanding flags, and neon PNG assets.
 */

import absNeon from '../assets/muscle-groups/abs-neon.png'
import backNeon from '../assets/muscle-groups/back-neon.png'
import bicepsNeon from '../assets/muscle-groups/biceps-neon.png'
import cardioNeon from '../assets/muscle-groups/cardio-neon.png'
import chestNeon from '../assets/muscle-groups/chest-neon.png'
import glutesNeon from '../assets/muscle-groups/glutes-neon.png'
import legsNeon from '../assets/muscle-groups/legs-neon.png'
import lowerBackNeon from '../assets/muscle-groups/lower-back-neon.png'
import mobilityNeon from '../assets/muscle-groups/mobility-neon.png'
import shouldersNeon from '../assets/muscle-groups/shoulders-neon.png'
import tricepsNeon from '../assets/muscle-groups/triceps-neon.png'

/** Neon PNG assets mapped to primary browse group ids */
export const MUSCLE_GROUP_NEON_IMAGES = {
  Peitoral: chestNeon,
  Costas: backNeon,
  Pernas: legsNeon,
  Glúteos: glutesNeon,
  Ombros: shouldersNeon,
  Bíceps: bicepsNeon,
  Tríceps: tricepsNeon,
  Abdômen: absNeon,
  Lombar: lowerBackNeon,
  Cardio: cardioNeon,
  Mobilidade: mobilityNeon,
}

export const GROUP_VISUAL_CONFIG = {
  Todos: {
    shortCode: 'TO',
    tone: 'default',
    color: '#2DD4BF',
    rgb: '45, 212, 191',
    subtitle: 'Todos os grupos',
    illustration: 'chest',
    expanding: false,
  },
  Peitoral: {
    shortCode: 'PT',
    tone: 'peito',
    color: '#22D3EE',
    rgb: '34, 211, 238',
    subtitle: 'Peito e empurrar',
    illustration: 'chest',
    expanding: false,
  },
  Costas: {
    shortCode: 'CO',
    tone: 'costas',
    color: '#3B82F6',
    rgb: '59, 130, 246',
    subtitle: 'Puxar e postura',
    illustration: 'back',
    expanding: false,
  },
  Pernas: {
    shortCode: 'PN',
    tone: 'pernas',
    color: '#FB923C',
    rgb: '251, 146, 60',
    subtitle: 'Base e potência',
    illustration: 'legs',
    expanding: false,
  },
  Glúteos: {
    shortCode: 'GL',
    tone: 'gluteos',
    color: '#C084FC',
    rgb: '192, 132, 252',
    subtitle: 'Posterior e estabilidade',
    illustration: 'glutes',
    expanding: true,
  },
  Ombros: {
    shortCode: 'OM',
    tone: 'ombros',
    color: '#38BDF8',
    rgb: '56, 189, 248',
    subtitle: 'Deltoides e mobilidade',
    illustration: 'shoulders',
    expanding: false,
  },
  Bíceps: {
    shortCode: 'BI',
    tone: 'biceps',
    color: '#FACC15',
    rgb: '250, 204, 21',
    subtitle: 'Flexão e controle',
    illustration: 'biceps',
    expanding: false,
  },
  Tríceps: {
    shortCode: 'TR',
    tone: 'triceps',
    color: '#A3E635',
    rgb: '163, 230, 53',
    subtitle: 'Extensão e trava',
    illustration: 'triceps',
    expanding: false,
  },
  Abdômen: {
    shortCode: 'AB',
    tone: 'abdomen',
    color: '#E879F9',
    rgb: '232, 121, 249',
    subtitle: 'Core e estabilidade',
    illustration: 'abs',
    expanding: true,
  },
  Mobilidade: {
    shortCode: 'MO',
    tone: 'mobilidade',
    color: '#6366F1',
    rgb: '99, 102, 241',
    subtitle: 'Movimento livre',
    illustration: 'mobility',
    expanding: true,
  },
  Antebraço: {
    shortCode: 'AN',
    tone: 'antebraco',
    color: '#4ADE80',
    rgb: '74, 222, 128',
    subtitle: 'Pegada e controle',
    illustration: 'forearm',
    expanding: false,
  },
  Lombar: {
    shortCode: 'LO',
    tone: 'lombar',
    color: '#2DD4BF',
    rgb: '45, 212, 191',
    subtitle: 'Suporte e postura',
    illustration: 'lower-back',
    expanding: false,
  },
  Cardio: {
    shortCode: 'CA',
    tone: 'cardio',
    color: '#FF4D6D',
    rgb: '255, 77, 109',
    subtitle: 'Resistência e energia',
    illustration: 'cardio',
    expanding: true,
  },
  Trapézio: {
    shortCode: 'TP',
    tone: 'trapezio',
    color: '#818CF8',
    rgb: '129, 140, 248',
    subtitle: 'Pescoço e postura',
    illustration: 'traps',
    expanding: false,
  },
  Panturrilha: {
    shortCode: 'PA',
    tone: 'panturrilha',
    color: '#FBBF24',
    rgb: '251, 191, 36',
    subtitle: 'Impulso e estabilidade',
    illustration: 'calves',
    expanding: false,
  },
  Funcional: {
    shortCode: 'FU',
    tone: 'funcional',
    color: '#2DD4BF',
    rgb: '45, 212, 191',
    subtitle: 'Movimento integrado',
    illustration: 'functional',
    expanding: false,
  },
  Alongamento: {
    shortCode: 'AL',
    tone: 'alongamento',
    color: '#7DD3FC',
    rgb: '125, 211, 252',
    subtitle: 'Flexibilidade e relax',
    illustration: 'stretch',
    expanding: false,
  },
}

const DEFAULT_VISUAL = {
  shortCode: 'MG',
  letter: 'MG',
  tone: 'default',
  color: '#2DD4BF',
  rgb: '45, 212, 191',
  subtitle: 'Grupo muscular',
  illustration: 'chest',
  expanding: false,
}

/** Resolve visual config for a muscle group id */
export function getMuscleGroupVisual(groupId) {
  const cfg = GROUP_VISUAL_CONFIG[groupId]
  if (!cfg) {
    return {
      ...DEFAULT_VISUAL,
      neonImage: null,
    }
  }
  return {
    ...cfg,
    letter: cfg.shortCode,
    neonImage: MUSCLE_GROUP_NEON_IMAGES[groupId] || null,
  }
}

/** Legacy alias map used by older imports */
export const groupLetters = Object.fromEntries(
  Object.entries(GROUP_VISUAL_CONFIG).map(([id, cfg]) => [id, cfg.shortCode]),
)

export const FEATURED_GROUP_IDS = []

export { GROUP_VISUAL_CONFIG as GROUP_VISUALS }
