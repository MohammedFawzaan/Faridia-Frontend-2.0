import type { LucideIcon } from 'lucide-react'

interface TabsProps<T extends string> {
  tabs: { value: T; label: string; icon?: LucideIcon }[]
  active: T
  onChange: (value: T) => void
}

export function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="tabs tabs-box w-full bg-base-200 sm:w-fit">
      {tabs.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={value === active}
          className={`tab gap-2 font-semibold ${value === active ? 'tab-active text-primary' : 'text-base-content'}`}
          onClick={() => onChange(value)}
        >
          {Icon && <Icon className="size-4" aria-hidden="true" />}
          {label}
        </button>
      ))}
    </div>
  )
}
