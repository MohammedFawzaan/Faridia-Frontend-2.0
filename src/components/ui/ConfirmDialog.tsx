import { useState } from 'react'
import { toApiError } from '@/services/apiError'
import { Alert } from './Alert'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  pendingLabel: string
  tone?: 'primary' | 'error'
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function ConfirmDialog({ title, message, confirmLabel, pendingLabel, tone = 'primary', onConfirm, onClose }: ConfirmDialogProps) {
  const [pending, setPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConfirm = async () => {
    setPending(true)
    setErrorMessage(null)
    try {
      await onConfirm()
    } catch (error) {
      setErrorMessage(toApiError(error).message)
      setPending(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose} busy={pending}>
      <div className="flex flex-col gap-4">
        <p>{message}</p>
        {errorMessage && <Alert kind="error">{errorMessage}</Alert>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant={tone} onClick={() => void handleConfirm()} loading={pending} loadingText={pendingLabel}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
