"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { ApiClientError, apiRequest } from "@app/shared/lib/api-client"
import { useToast } from "@app/shared/ui/toast-provider"

type PaymentCreateLabels = {
  title: string
  description: string
  amountLabel: string
  methodLabel: string
  paidAtLabel: string
  paidAtHint: string
  referenceNoteLabel: string
  methodCash: string
  methodBankTransfer: string
  methodCard: string
  methodOther: string
  submitButton: string
  cancelButton: string
  loading: string
  validationTitle: string
  validationAmount: string
  createSuccessTitle: string
  createSuccessDescription: string
  exceedsDebtTitle: string
  exceedsDebtDescription: string
  createErrorTitle: string
  createErrorDescription: string
}

type PaymentCreateFormProps = {
  clientPublicId: string
  locale: "es" | "en"
  labels: PaymentCreateLabels
}

function todayDateValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toInputDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseInputDateValue(value: string) {
  const [rawYear, rawMonth, rawDay] = value.split("-")
  const year = Number(rawYear)
  const month = Number(rawMonth)
  const day = Number(rawDay)

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date()
  }

  return new Date(year, month - 1, day)
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function shiftMonth(date: Date, monthDelta: number) {
  return new Date(date.getFullYear(), date.getMonth() + monthDelta, 1)
}

function getCalendarCells(visibleMonth: Date) {
  const firstDayIndex = monthStart(visibleMonth).getDay()
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const cells: Array<number | null> = []

  for (let index = 0; index < firstDayIndex; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function dateLabel(dateValue: string, locale: "es" | "en") {
  return new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(parseInputDateValue(dateValue))
}

export function PaymentCreateForm({ clientPublicId, locale, labels }: PaymentCreateFormProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<"CASH" | "BANK_TRANSFER" | "CARD" | "OTHER">("CASH")
  const [paidAt, setPaidAt] = useState(todayDateValue())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(monthStart(new Date()))
  const [referenceNote, setReferenceNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [amountError, setAmountError] = useState(false)

  const selectedDate = parseInputDateValue(paidAt)
  const selectedDay = selectedDate.getDate()
  const selectedMonth = selectedDate.getMonth()
  const selectedYear = selectedDate.getFullYear()
  const calendarCells = getCalendarCells(calendarMonth)
  const weekDayLabels = Array.from({ length: 7 }).map((_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2026, 3, 19 + index)),
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError(true)
      showToast({
        title: labels.validationTitle,
        description: labels.validationAmount,
        variant: "error",
      })
      return
    }

    try {
      setIsSaving(true)

      await apiRequest(`/api/clients/${clientPublicId}/payments`, {
        method: "POST",
        body: {
          amount: parsedAmount,
          method,
          paidAt,
          referenceNote,
        },
      })

      showToast({
        title: labels.createSuccessTitle,
        description: labels.createSuccessDescription,
        variant: "success",
      })

      router.push(`/clients/${clientPublicId}`)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiClientError && error.code === "payment_exceeds_debt") {
        showToast({
          title: labels.exceedsDebtTitle,
          description: labels.exceedsDebtDescription,
          variant: "error",
        })
        return
      }

      showToast({
        title: labels.createErrorTitle,
        description: labels.createErrorDescription,
        variant: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="private-page clients-editor-page">
      <section className="clients-editor-modal" role="dialog" aria-modal="true">
        <header className="clients-editor-modal__header">
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </header>

        <form className="clients-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="payment-amount">{labels.amountLabel}</label>
          <input
            id="payment-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value)
              if (amountError) {
                setAmountError(false)
              }
            }}
            className={amountError ? "input--error" : undefined}
            aria-invalid={amountError ? "true" : "false"}
            placeholder="0.00"
          />

          <label htmlFor="payment-method">{labels.methodLabel}</label>
          <select
            id="payment-method"
            value={method}
            onChange={(event) =>
              setMethod(event.target.value as "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER")
            }
          >
            <option value="CASH">{labels.methodCash}</option>
            <option value="BANK_TRANSFER">{labels.methodBankTransfer}</option>
            <option value="CARD">{labels.methodCard}</option>
            <option value="OTHER">{labels.methodOther}</option>
          </select>

          <label htmlFor="payment-paid-at">{labels.paidAtLabel}</label>
          <small className="payments-date-picker__hint">{labels.paidAtHint}</small>
          <div className="payments-date-picker" id="payment-paid-at">
            <button
              type="button"
              className="payments-date-picker__trigger"
              onClick={() => setIsCalendarOpen((current) => !current)}
            >
              {dateLabel(paidAt, locale)}
            </button>

            {isCalendarOpen ? (
              <div className="payments-date-picker__panel">
                <div className="payments-date-picker__header">
                  <button
                    type="button"
                    className="payments-date-picker__month-nav"
                    onClick={() => setCalendarMonth((current) => shiftMonth(current, -1))}
                  >
                    ‹
                  </button>
                  <strong>
                    {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
                      calendarMonth,
                    )}
                  </strong>
                  <button
                    type="button"
                    className="payments-date-picker__month-nav"
                    onClick={() => setCalendarMonth((current) => shiftMonth(current, 1))}
                  >
                    ›
                  </button>
                </div>

                <div className="payments-date-picker__weekdays">
                  {weekDayLabels.map((dayName) => (
                    <span key={dayName}>{dayName}</span>
                  ))}
                </div>

                <div className="payments-date-picker__days">
                  {calendarCells.map((day, index) => {
                    if (day === null) {
                      return <span key={`empty-${index}`} className="payments-date-picker__day-empty" />
                    }

                    const isSelected =
                      day === selectedDay &&
                      calendarMonth.getMonth() === selectedMonth &&
                      calendarMonth.getFullYear() === selectedYear

                    return (
                      <button
                        key={`${calendarMonth.getFullYear()}-${calendarMonth.getMonth()}-${day}`}
                        type="button"
                        className={`payments-date-picker__day${isSelected ? " payments-date-picker__day--selected" : ""}`}
                        onClick={() => {
                          setPaidAt(
                            toInputDateValue(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)),
                          )
                          setIsCalendarOpen(false)
                        }}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <label htmlFor="payment-reference-note">{labels.referenceNoteLabel}</label>
          <textarea
            id="payment-reference-note"
            rows={4}
            value={referenceNote}
            onChange={(event) => setReferenceNote(event.target.value)}
            maxLength={300}
          />

          <div className="clients-form__actions">
            <button type="submit" className="clients-primary-button" disabled={isSaving}>
              {isSaving ? labels.loading : labels.submitButton}
            </button>
            <button
              type="button"
              className="clients-secondary-button"
              onClick={() => router.push(`/clients/${clientPublicId}`)}
            >
              {labels.cancelButton}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
