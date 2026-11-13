export default function AuthLoading({ label = 'Carregando' }) {
  return (
    <div className="auth-screen auth-screen--loading" role="status" aria-live="polite">
      <div className="auth-screen__glow" aria-hidden="true" />
      <div className="auth-loading">
        <span className="auth-loading__pulse" aria-hidden="true" />
        <p>{label}...</p>
      </div>
    </div>
  )
}
