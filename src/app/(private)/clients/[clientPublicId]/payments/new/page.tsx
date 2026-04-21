import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { PaymentCreateForm } from "@app/features/payments/ui/payment-create-form"
import { getClientByPublicIdFromDb } from "@server/features/clients/application/clients-service"
import { getDictionary } from "@shared/localization/dictionary"
import { LOCALE_COOKIE_NAME, resolveLocale } from "@shared/localization/config"

type NewPaymentPageProps = {
  params: Promise<{
    clientPublicId: string
  }>
}

export default async function NewPaymentPage({ params }: NewPaymentPageProps) {
  const { clientPublicId } = await params
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value)
  const dictionary = getDictionary(locale)
  const client = await getClientByPublicIdFromDb(clientPublicId)

  if (!client) {
    redirect("/clients")
  }

  return (
    <PaymentCreateForm
      clientPublicId={clientPublicId}
      locale={locale}
      labels={{
        title: dictionary.payments.createTitle,
        description: dictionary.payments.createDescription,
        amountLabel: dictionary.payments.amountLabel,
        methodLabel: dictionary.payments.methodLabel,
        paidAtLabel: dictionary.payments.paidAtLabel,
        paidAtHint: dictionary.payments.paidAtHint,
        referenceNoteLabel: dictionary.payments.referenceNoteLabel,
        methodCash: dictionary.payments.methodCash,
        methodBankTransfer: dictionary.payments.methodBankTransfer,
        methodCard: dictionary.payments.methodCard,
        methodOther: dictionary.payments.methodOther,
        submitButton: dictionary.payments.submitButton,
        cancelButton: dictionary.payments.cancelButton,
        loading: dictionary.payments.loading,
        validationTitle: dictionary.payments.validationTitle,
        validationAmount: dictionary.payments.validationAmount,
        createSuccessTitle: dictionary.payments.createSuccessTitle,
        createSuccessDescription: dictionary.payments.createSuccessDescription,
        exceedsDebtTitle: dictionary.payments.exceedsDebtTitle,
        exceedsDebtDescription: dictionary.payments.exceedsDebtDescription,
        createErrorTitle: dictionary.payments.createErrorTitle,
        createErrorDescription: dictionary.payments.createErrorDescription,
      }}
    />
  )
}
