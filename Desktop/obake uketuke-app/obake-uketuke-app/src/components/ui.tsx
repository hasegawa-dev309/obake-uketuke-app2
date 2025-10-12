import React from 'react'

export function Field({ label, hint, error, children }:{
  label:string; hint?:string; error?:string; children:React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {(hint || error) && (
        <p className={`text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>{error ?? hint}</p>
      )}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-base border border-surface-muted bg-white px-3 outline-none focus:ring-2 focus:ring-brand"
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-10 w-full rounded-base border border-surface-muted bg-white px-3 outline-none focus:ring-2 focus:ring-brand"
    />
  )
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="h-10 px-4 rounded-base bg-brand text-white font-medium hover:opacity-90 disabled:opacity-60"
    />
  )
}

export function Card({children}:{children:React.ReactNode}) {
  return <section className="bg-surface-card rounded-base shadow-card p-6 space-y-4">{children}</section>
}
