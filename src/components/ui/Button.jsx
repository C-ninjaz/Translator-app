export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}) {
  const variants = {
    primary:
      'bg-brand-600 hover:bg-brand-500 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500',
    secondary:
      'bg-gray-900 hover:bg-gray-800 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500',
    outline:
      'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100',
  }
  const sizes = {
    sm: 'px-2.5 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-5 py-2.5 text-base rounded-lg',
  }
  const base = 'inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition'
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
