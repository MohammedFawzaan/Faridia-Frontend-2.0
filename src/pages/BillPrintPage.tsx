import { Link, useParams } from 'react-router-dom'
import { PrintField, PrintSheet } from '@/components/opd/PrintSheet'
import { Spinner } from '@/components/ui/Loaders'
import { ErrorState } from '@/components/ui/StateMessage'
import { useResource } from '@/hooks/useResource'
import { billsService } from '@/services/billsService'
import { formatDateTime } from '@/utils/date'
import { formatMoney } from '@/utils/money'
import { formatAge, GENDER_LABELS } from '@/utils/patient'

export default function BillPrintPage() {
  const { billId = '' } = useParams()
  const { data: bill, status, error, reload } = useResource(billsService.get, billId)

  if (status === 'loading') return <Spinner message="Loading bill…" />
  if (status === 'error' || !bill) {
    return (
      <ErrorState
        title="Could not load the bill"
        description={error?.message ?? 'Please try again.'}
        action={
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={reload}>
              Try again
            </button>
            <Link to="/queue" className="btn btn-outline btn-primary">
              Back to the queue
            </Link>
          </div>
        }
      />
    )
  }

  return (
    <PrintSheet title="OPD bill">
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <PrintField label="Bill no." value={bill.number} />
        <PrintField label="OPD no." value={bill.opdNumber ?? '—'} />
        <PrintField label="Date" value={formatDateTime(bill.createdAt)} />
        <PrintField label="Payment" value={bill.paymentMethod?.name ?? '—'} />
      </dl>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-base-300 py-3 sm:grid-cols-4">
        <PrintField label="Patient" value={bill.patient.name} />
        <PrintField label="Patient id" value={bill.patient.patientId} />
        <PrintField label="Age / gender" value={`${formatAge(bill.patient)} · ${GENDER_LABELS[bill.patient.gender]}`} />
        <PrintField label="Mobile" value={bill.patient.mobile} />
        <PrintField label="Doctor" value={bill.doctor.name} />
        <PrintField label="Department" value={bill.department.name} />
      </dl>

      <table className="table mt-4">
        <thead>
          <tr className="text-secondary">
            <th>Details</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item) => (
            <tr key={item.details}>
              <td>{item.details}</td>
              <td className="text-right">{formatMoney(item.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="text-lg font-semibold text-secondary">
            <td>Total</td>
            <td className="text-right">{formatMoney(bill.total)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-6 text-sm">Received by {bill.createdByName}</p>
    </PrintSheet>
  )
}
