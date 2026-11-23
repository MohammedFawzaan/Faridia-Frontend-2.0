import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { TextField } from '@/components/ui/TextField'
import type { Symptom } from '@/types/opd'

interface SymptomPickerProps {
  options: Symptom[]
  selected: string[]
  onToggle: (name: string) => void
  disabled?: boolean
}

export function SymptomPicker({ options, selected, onToggle, disabled = false }: SymptomPickerProps) {
  const [filter, setFilter] = useState('')
  const term = filter.trim().toLowerCase()
  const visible = options.filter((option) => option.name.toLowerCase().includes(term))

  return (
    <div className="flex flex-col gap-3">
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Chosen symptoms">
          {selected.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="badge badge-primary badge-lg gap-1 font-semibold"
                onClick={() => onToggle(name)}
                disabled={disabled}
                aria-label={`Remove ${name}`}
              >
                {name}
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <TextField
        label="Find a symptom"
        type="search"
        leading={<Search className="size-4" />}
        placeholder="Type to filter the list"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        disabled={disabled}
      />
      {options.length === 0 ? (
        <p className="font-medium">There are no symptoms in the list yet.</p>
      ) : visible.length === 0 ? (
        <p className="font-medium">No symptom matches “{filter.trim()}”.</p>
      ) : (
        <ul className="flex max-h-52 flex-wrap gap-2 overflow-y-auto" aria-label="Symptom list">
          {visible.map((option) => {
            const active = selected.includes(option.name)
            return (
              <li key={option.id}>
                <button
                  type="button"
                  className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline btn-primary'}`}
                  onClick={() => onToggle(option.name)}
                  disabled={disabled}
                  aria-pressed={active}
                >
                  {option.name}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
