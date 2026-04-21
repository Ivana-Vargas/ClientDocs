import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ClientPaymentsPanel } from "@app/features/payments/ui/client-payments-panel"
import { getClientByPublicIdFromDb } from "@server/features/clients/application/clients-service"
import { listPaymentsByClientPublicIdFromDb } from "@server/features/payments/application/payments-service"
import { getDictionary } from "@shared/localization/dictionary"
import { LOCALE_COOKIE_NAME, resolveLocale } from "@shared/localization/config"

type ClientDetailPageProps = {
  params: Promise<{
    clientPublicId: string
  }>
}

function formatAmountInCents(amountInCents: number, locale: "es" | "en") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BOB",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(amountInCents / 100)
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientPublicId } = await params
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value)
  const dictionary = getDictionary(locale)
  const client = await getClientByPublicIdFromDb(clientPublicId)
  const paymentsResult = await listPaymentsByClientPublicIdFromDb(clientPublicId)
  const payments = paymentsResult?.payments ?? []
  const totalPaidInCents = paymentsResult?.totalPaidInCents ?? 0
  const outstandingInCents = Math.max((client?.totalDebtInCents ?? 0) - totalPaidInCents, 0)

  if (!client) {
    redirect("/clients")
  }

  return (
    <main className="private-page clients-detail-page">
      <header className="private-page__header clients-detail-page__header">
        <div>
          <h1>{client.fullName}</h1>
          <p>{dictionary.clients.detailDescription}</p>
        </div>
        <div className="clients-detail-page__actions">
          <Link href="/clients" className="clients-primary-link clients-detail-page__back-button">
            {dictionary.clients.backToList}
          </Link>
        </div>
      </header>

      <section className="clients-detail-grid">
        <article className="clients-detail-card">
          <h2>{dictionary.clients.profileTitle}</h2>
          <dl className="clients-detail-fields">
            <div>
              <dt>{dictionary.clients.fullNameLabel}</dt>
              <dd>{client.fullName}</dd>
            </div>
            <div>
              <dt>{dictionary.clients.totalDebtLabel}</dt>
              <dd>{formatAmountInCents(client.totalDebtInCents, locale)}</dd>
            </div>
            <div>
              <dt>{dictionary.payments.totalPaidLabel}</dt>
              <dd>{formatAmountInCents(totalPaidInCents, locale)}</dd>
            </div>
            <div>
              <dt>{dictionary.payments.outstandingLabel}</dt>
              <dd>{formatAmountInCents(outstandingInCents, locale)}</dd>
            </div>
            <div>
              <dt>{dictionary.clients.nationalIdLabel}</dt>
              <dd>{client.nationalId ?? "-"}</dd>
            </div>
            <div>
              <dt>{dictionary.clients.phoneLabel}</dt>
              <dd>{client.phoneNumber ?? "-"}</dd>
            </div>
            <div>
              <dt>{dictionary.clients.emailLabel}</dt>
              <dd>{client.email ?? "-"}</dd>
            </div>
            <div>
              <dt>{dictionary.clients.addressLabel}</dt>
              <dd>{client.addressLine ?? "-"}</dd>
            </div>
            <div>
              <dt>{dictionary.clients.notesLabel}</dt>
              <dd>{client.notes ?? "-"}</dd>
            </div>
          </dl>
        </article>

        <article className="clients-detail-card">
          <h2>{dictionary.clients.documentsViewTitle}</h2>
          <p className="clients-detail-card__count">0 {dictionary.clients.documentsCountLabel}</p>
          <p>{dictionary.clients.documentsViewDescription}</p>
        </article>
        <ClientPaymentsPanel
          locale={locale}
          clientPublicId={client.publicId}
          payments={payments}
          totalPaidInCents={totalPaidInCents}
          labels={{
            title: dictionary.clients.paymentsViewTitle,
            paymentsCountLabel: dictionary.clients.paymentsCountLabel,
            totalPaidLabel: dictionary.payments.totalPaidLabel,
            description: dictionary.clients.paymentsViewDescription,
            registerPaymentButton: dictionary.payments.registerPaymentButton,
            emptyList: dictionary.payments.emptyList,
            methodCash: dictionary.payments.methodCash,
            methodBankTransfer: dictionary.payments.methodBankTransfer,
            methodCard: dictionary.payments.methodCard,
            methodOther: dictionary.payments.methodOther,
            detailsTitle: dictionary.payments.detailsTitle,
            detailsAmountLabel: dictionary.payments.detailsAmountLabel,
            detailsDateLabel: dictionary.payments.detailsDateLabel,
            detailsMethodLabel: dictionary.payments.detailsMethodLabel,
            detailsReferenceLabel: dictionary.payments.detailsReferenceLabel,
            detailsReferenceEmpty: dictionary.payments.detailsReferenceEmpty,
            closeLabel: dictionary.common.close,
          }}
        />
      </section>
    </main>
  )
}
