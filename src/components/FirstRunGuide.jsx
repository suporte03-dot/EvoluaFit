import { useState } from 'react'
import { scrollToSection } from '../utils/scrollToSection'
import EvoluaFitMark from './branding/EvoluaFitMark'

const STORAGE_KEY = 'evoluafit-onboarded'
const STEPS = [
  {
    kicker: '01',
    title: 'Hoje',
    body: 'Aqui você encontra exatamente o que precisa fazer agora.',
  },
  {
    kicker: '02',
    title: 'Treine em foco',
    body: 'Durante o treino, deixamos apenas o que importa na sua frente.',
  },
  {
    kicker: '03',
    title: 'Veja sua evolução',
    body: 'Cada treino alimenta seu histórico e aproxima você das suas metas.',
  },
]

export function hasCompletedOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

export default function FirstRunGuide({ onClose }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const last = step === STEPS.length - 1

  const finish = (goPlanilha = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    onClose?.()
    if (goPlanilha) scrollToSection('planilha')
  }

  return (
    <div className="onboard" role="dialog" aria-modal="true" aria-labelledby="onboard-title">
      <button type="button" className="onboard__backdrop" aria-label="Pular introdução" onClick={() => finish()} />
      <div className="onboard__card">
        <EvoluaFitMark size={48} />
        <p className="onboard__kicker">Passo {current.kicker}</p>
        <h2 id="onboard-title" className="onboard__title">
          {current.title}
        </h2>
        <p className="onboard__body">{current.body}</p>
        <div className="onboard__dots" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={i === step ? 'is-on' : ''} />
          ))}
        </div>
        <div className="onboard__actions">
          <button type="button" className="btn btn--ghost" onClick={() => finish()}>
            Pular
          </button>
          {last ? (
            <button type="button" className="btn btn--primary" onClick={() => finish(true)}>
              Começar
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={() => setStep((s) => s + 1)}>
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
