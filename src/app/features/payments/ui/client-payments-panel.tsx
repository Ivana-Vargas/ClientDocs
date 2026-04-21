"use client"

import Link from "next/link"
import { useState } from "react"

type PaymentItem = {
  publicId: string
  amountInCents: number
  currency: string
  method: "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER"
  referenceNote: string | null
  paidAt: string
}

type ClientPaymentsPanelLabels = {
  title: string
  paymentsCountLabel: string
  totalPaidLabel: string
  description: string
  registerPaymentButton: string
  emptyList: string
  methodCash: string
  methodBankTransfer: string
  methodCard: string
  methodOther: string
  detailsTitle: string
  detailsAmountLabel: string
  detailsDateLabel: string
  detailsMethodLabel: string
  detailsReferenceLabel: string
  detailsReferenceEmpty: string
  closeLabel: string
}

type ClientPaymentsPanelProps = {
  locale: "es" | "en"
  clientPublicId: string
  payments: PaymentItem[]
  totalPaidInCents: number
  labels: ClientPaymentsPanelLabels
}

function resolveMethodLabel(
  method: "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER",
  labels: ClientPaymentsPanelLabels,
) {
  if (method === "CASH") {
    return labels.methodCash
  }

  if (method === "BANK_TRANSFER") {
    return labels.methodBankTransfer
  }

  if (method === "CARD") {
    return labels.methodCard
  }

  return labels.methodOther
}

function formatAmountInCents(amountInCents: number, locale: "es" | "en", currency: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(amountInCents / 100)
}

function formatDate(dateIso: string, locale: "es" | "en") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(dateIso))
}

export function ClientPaymentsPanel({
  locale,
  clientPublicId,
  payments,
  totalPaidInCents,
  labels,
}: ClientPaymentsPanelProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null)

  return (
    <article className="clients-detail-card">
      <h2>{labels.title}</h2>
      <p className="clients-detail-card__count">
        {payments.length} {labels.paymentsCountLabel}
      </p>
      <p className="clients-detail-card__count-subtitle clients-detail-card__count-subtitle--positive">
        {labels.totalPaidLabel}: {formatAmountInCents(totalPaidInCents, locale, "BOB")}
      </p>
      <p>{labels.description}</p>
      <Link href={`/clients/${clientPublicId}/payments/new`} className="private-card__button">
        {labels.registerPaymentButton}
      </Link>

      <ul className="clients-payment-list">
        {payments.length === 0 ? (
          <li className="clients-payment-list__empty">{labels.emptyList}</li>
        ) : (
          payments.map((payment) => (
            <li key={payment.publicId}>
              <button
                type="button"
                className="clients-payment-list__item"
                onClick={() => setSelectedPayment(payment)}
              >
                <strong>{formatAmountInCents(payment.amountInCents, locale, payment.currency)}</strong>
                <span>
                  {resolveMethodLabel(payment.method, labels)} - {formatDate(payment.paidAt, locale)}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>

      {selectedPayment ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="payment-details-title">
          <div className="modal-card clients-payment-modal">
            <h2 id="payment-details-title">{labels.detailsTitle}</h2>

            <dl className="clients-payment-modal__details">
              <div>
                <dt>{labels.detailsAmountLabel}</dt>
                <dd>{formatAmountInCents(selectedPayment.amountInCents, locale, selectedPayment.currency)}</dd>
              </div>
              <div>
                <dt>{labels.detailsDateLabel}</dt>
                <dd>{formatDate(selectedPayment.paidAt, locale)}</dd>
              </div>
              <div>
                <dt>{labels.detailsMethodLabel}</dt>
                <dd>{resolveMethodLabel(selectedPayment.method, labels)}</dd>
              </div>
              <div>
                <dt>{labels.detailsReferenceLabel}</dt>
                <dd>{selectedPayment.referenceNote ?? labels.detailsReferenceEmpty}</dd>
              </div>
            </dl>

            <div className="clients-payment-modal__actions">
              <button type="button" className="clients-primary-button" onClick={() => setSelectedPayment(null)}>
                {labels.closeLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}
