export default function Alert({ children, variant = 'warning', className = '' }) {
  const variants = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  return (
    <div className={`p-4 border rounded ${variants[variant]} ${className}`}>{children}</div>
  )
}
