import { useRef } from 'react'
import { useFitness } from '../context/FitnessContext'

export default function BackupSettings() {
  const { exportData, importData, clearAll } = useFitness()
  const fileRef = useRef(null)

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importData(file)
    } catch {
      alert('Arquivo inválido. Selecione um backup JSON do EvoluaFit.')
    }
    e.target.value = ''
  }

  const handleClear = () => {
    if (window.confirm('Isso apagará todos os dados locais. Deseja continuar?')) {
      clearAll()
    }
  }

  return (
    <div className="backup-settings glass-card">
      <h3>Backup e dados</h3>
      <p>Exporte, importe ou limpe seus dados salvos no navegador (localStorage).</p>
      <div className="backup-settings__actions">
        <button type="button" className="btn btn--primary" onClick={exportData}>
          Exportar backup
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
          Importar backup
        </button>
        <input ref={fileRef} type="file" accept=".json" hidden onChange={handleImport} />
        <button type="button" className="btn btn--danger" onClick={handleClear}>
          Limpar tudo
        </button>
      </div>
    </div>
  )
}
