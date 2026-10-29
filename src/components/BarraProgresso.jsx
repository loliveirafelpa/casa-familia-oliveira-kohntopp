export default function BarraProgresso({ feitas, total, className = '' }) {
  const pct = total ? Math.round((feitas / total) * 100) : 0
  return (
    <div
      role="progressbar"
      aria-valuenow={feitas}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${feitas} de ${total} tarefas feitas`}
      className={`h-2 overflow-hidden rounded-full bg-nevoa ${className}`}
    >
      <div className="h-full rounded-full bg-salvia transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}
