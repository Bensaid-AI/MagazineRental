import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800 border border-blue-300',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-300',
    destructive: 'bg-red-100 text-red-800 border border-red-300',
    outline: 'bg-white text-gray-800 border border-gray-300',
  }

  return (
    <div
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}

export { Badge }
