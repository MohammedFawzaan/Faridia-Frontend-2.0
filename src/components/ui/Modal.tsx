import { useEffect, useId, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  busy?: boolean
}

export function Modal({ title, onClose, children, busy = false }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, busy])

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="modal-box">
        <h3 id={titleId} className="mb-4 text-2xl text-secondary">
          {title}
        </h3>
        {children}
      </div>
      <button type="button" className="modal-backdrop" aria-label="Close dialog" onClick={busy ? undefined : onClose} tabIndex={-1} />
    </div>
  )
}
