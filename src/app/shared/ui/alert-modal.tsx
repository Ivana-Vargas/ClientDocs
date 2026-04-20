"use client"

type AlertModalProps = {
  open: boolean
  title: string
  description: string
  closeLabel: string
  onClose: () => void
}

export function AlertModal({
  open,
  title,
  description,
  closeLabel,
  onClose,
}: AlertModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="alert-modal-title">
      <div className="modal-card">
        <h2 id="alert-modal-title">{title}</h2>
        <p>{description}</p>
        <button type="button" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  )
}
