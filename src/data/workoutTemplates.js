export const splitTemplates = {
  2: [
    { day: 1, name: 'Full Body A', focus: ['Peito', 'Costas', 'Quadríceps', 'Abdômen'] },
    { day: 2, name: 'Full Body B', focus: ['Ombros', 'Posterior', 'Glúteos', 'Bíceps', 'Tríceps'] },
  ],
  3: [
    { day: 1, name: 'Push', focus: ['Peito', 'Ombros', 'Tríceps'] },
    { day: 2, name: 'Pull', focus: ['Costas', 'Bíceps', 'Abdômen'] },
    { day: 3, name: 'Legs', focus: ['Quadríceps', 'Posterior', 'Glúteos'] },
  ],
  4: [
    { day: 1, name: 'Superior A', focus: ['Peito', 'Costas', 'Ombros'] },
    { day: 2, name: 'Inferior A', focus: ['Quadríceps', 'Posterior', 'Glúteos'] },
    { day: 3, name: 'Superior B', focus: ['Peito', 'Costas', 'Bíceps', 'Tríceps'] },
    { day: 4, name: 'Inferior B', focus: ['Quadríceps', 'Posterior', 'Abdômen'] },
  ],
  5: [
    { day: 1, name: 'Peito + Tríceps', focus: ['Peito', 'Tríceps'] },
    { day: 2, name: 'Costas + Bíceps', focus: ['Costas', 'Bíceps'] },
    { day: 3, name: 'Pernas', focus: ['Quadríceps', 'Posterior', 'Glúteos'] },
    { day: 4, name: 'Ombros + Abdômen', focus: ['Ombros', 'Abdômen'] },
    { day: 5, name: 'Full Body leve', focus: ['Corpo inteiro'] },
  ],
  6: [
    { day: 1, name: 'Push A', focus: ['Peito', 'Ombros', 'Tríceps'] },
    { day: 2, name: 'Pull A', focus: ['Costas', 'Bíceps'] },
    { day: 3, name: 'Legs A', focus: ['Quadríceps', 'Posterior'] },
    { day: 4, name: 'Push B', focus: ['Peito', 'Ombros', 'Tríceps'] },
    { day: 5, name: 'Pull B', focus: ['Costas', 'Bíceps', 'Abdômen'] },
    { day: 6, name: 'Legs B', focus: ['Glúteos', 'Quadríceps', 'Posterior'] },
  ],
}

export const objectiveLabels = {
  hipertrofia: 'Hipertrofia',
  emagrecimento: 'Emagrecimento',
  condicionamento: 'Condicionamento',
  forca: 'Força',
  saude: 'Saúde geral',
}

export const levelConfig = {
  Iniciante: { setsMultiplier: 0.8, restBonus: 15, maxExercises: 5 },
  Intermediário: { setsMultiplier: 1, restBonus: 0, maxExercises: 6 },
  Avançado: { setsMultiplier: 1.2, restBonus: -10, maxExercises: 7 },
}
