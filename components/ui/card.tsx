import * as React from "react"

export function Card({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-2xl border bg-white ${className}`}>{children}</div>
}

export function CardHeader({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

export function CardTitle({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
}

export function CardContent({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>
}
