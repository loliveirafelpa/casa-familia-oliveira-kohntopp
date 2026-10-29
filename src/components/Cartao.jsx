export default function Cartao({ className = '', children }) {
  return <section className={`rounded-2xl bg-branco p-5 shadow-cartao sm:p-6 ${className}`}>{children}</section>
}
