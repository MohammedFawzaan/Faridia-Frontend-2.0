import { Plus, Trash2 } from 'lucide-react'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { MEDICINE_OTHER } from '@/schemas/consultation'
import type { Medicine } from '@/types/opd'

export interface MedicineLineValues {
  key: number
  medicineId: string
  name: string
  qty: string
}

export type MedicineLineErrors = Partial<Record<'medicineId' | 'name' | 'qty', string>>

interface MedicineLinesProps {
  medicines: Medicine[]
  lines: MedicineLineValues[]
  errors: Record<number, MedicineLineErrors>
  onChange: (lines: MedicineLineValues[]) => void
  disabled?: boolean
}

let nextKey = 1
const newMedicineLine = (): MedicineLineValues => ({ key: nextKey++, medicineId: '', name: '', qty: '1' })

export function MedicineLines({ medicines, lines, errors, onChange, disabled = false }: MedicineLinesProps) {
  const options = [
    ...medicines.map((medicine) => ({ value: String(medicine.id), label: medicine.name })),
    { value: MEDICINE_OTHER, label: 'Other (type the name)' },
  ]

  const update = (key: number, changes: Partial<MedicineLineValues>) =>
    onChange(lines.map((line) => (line.key === key ? { ...line, ...changes } : line)))

  return (
    <div className="flex flex-col gap-4">
      {lines.length === 0 && (
        <p className="font-medium">No medicines added. Use “Add medicine” if the patient needs any.</p>
      )}
      {lines.map((line, index) => {
        const medicine = medicines.find((item) => String(item.id) === line.medicineId)
        const lineErrors = errors[index] ?? {}
        return (
          <div key={line.key} className="flex flex-col gap-3 border-b border-base-300 pb-4 sm:flex-row sm:items-start">
            <div className="flex-1">
              <SelectField
                label={`Medicine ${index + 1}`}
                placeholder="Choose a medicine"
                options={options}
                value={line.medicineId}
                onChange={(event) => update(line.key, { medicineId: event.target.value })}
                error={lineErrors.medicineId}
                disabled={disabled}
              />
              {medicine?.isFree && <span className="badge badge-accent mt-2 font-semibold">Free medicine</span>}
            </div>
            {line.medicineId === MEDICINE_OTHER && (
              <div className="flex-1">
                <TextField
                  label="Medicine name"
                  placeholder="Type the medicine name"
                  value={line.name}
                  onChange={(event) => update(line.key, { name: event.target.value })}
                  error={lineErrors.name}
                  disabled={disabled}
                />
              </div>
            )}
            <div className="sm:w-28">
              <TextField
                label="Quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={999}
                value={line.qty}
                onChange={(event) => update(line.key, { qty: event.target.value })}
                error={lineErrors.qty}
                disabled={disabled}
              />
            </div>
            <button
              type="button"
              className="btn btn-outline btn-error btn-sm self-start sm:mt-8"
              onClick={() => onChange(lines.filter((item) => item.key !== line.key))}
              disabled={disabled}
              aria-label={`Remove medicine ${index + 1}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="sm:hidden">Remove</span>
            </button>
          </div>
        )
      })}
      <div>
        <button
          type="button"
          className="btn btn-outline btn-primary btn-sm"
          onClick={() => onChange([...lines, newMedicineLine()])}
          disabled={disabled}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add medicine
        </button>
      </div>
    </div>
  )
}
