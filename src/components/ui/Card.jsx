export function Card({ className = '', children }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function CardBody({ className = '', children }) {
  return <div className={`card-body ${className}`}>{children}</div>
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`card-body border-b border-gray-200 dark:border-gray-700 pb-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}
