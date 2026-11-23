import { Link, useParams } from 'react-router-dom'
import { PrintField, PrintSheet } from '@/components/opd/PrintSheet'
import { Spinner } from '@/components/ui/Loaders'
import { ErrorState } from '@/components/ui/StateMessage'
import { useResource } from '@/hooks/useResource'
import { prescriptionsService } from '@/services/prescriptionsService'
import { formatDateTime } from '@/utils/date'
import { formatAge, GENDER_LABELS } from '@/utils/patient'

export default function PrescriptionPrintPage() {
  const { prescriptionId = '' } = useParams()
  const { data: prescription, status, error, reload } = useResource(prescriptionsService.get, prescriptionId)

  if (status === 'loading') return <Spinner message="Loading prescription…" />
  if (status === 'error' || !prescription) {
    return (
      <ErrorState
        title="Could not load the prescription"
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

  const { patient, doctor } = prescription

  return (
    <PrintSheet title="Prescription">
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <PrintField label="OPD no." value={prescription.opdNumber} />
        <PrintField label="Token" value={prescription.token} />
        <PrintField label="Date" value={formatDateTime(prescription.createdAt)} />
        <PrintField label="Department" value={prescription.department.name} />
      </dl>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-base-300 py-3 sm:grid-cols-4">
        <PrintField label="Patient" value={patient.name} />
        <PrintField label="Patient id" value={patient.patientId} />
        <PrintField label="Age / gender" value={`${formatAge(patient)} · ${GENDER_LABELS[patient.gender]}`} />
        <PrintField label="Mobile" value={patient.mobile} />
      </dl>

      {prescription.symptoms && (
        <section className="mt-4">
          <h2 className="text-lg text-secondary">Symptoms</h2>
          <p className="font-medium">{prescription.symptoms}</p>
        </section>
      )}

      {prescription.medicines.length > 0 && (
        <section className="mt-4">
          <h2 className="text-lg text-secondary">Medicines</h2>
          <table className="table">
            <thead>
              <tr className="text-secondary">
                <th>#</th>
                <th>Medicine</th>
                <th className="text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines.map((medicine, index) => (
                <tr key={medicine.id}>
                  <td>{index + 1}</td>
                  <td>
                    {medicine.medicine}
                    {medicine.free && <span className="badge badge-accent badge-sm ml-2">Free</span>}
                  </td>
                  <td className="text-right">{medicine.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {prescription.remarks && (
        <section className="mt-4">
          <h2 className="text-lg text-secondary">Remarks</h2>
          <p className="font-medium">{prescription.remarks}</p>
        </section>
      )}

      <footer className="mt-10 flex justify-end">
        <div className="text-center">
          <div className="mb-1 h-px w-48 bg-base-content" />
          <p className="font-semibold">{doctor.name}</p>
          <p className="text-sm">{[doctor.graduation, doctor.postGraduation].filter(Boolean).join(', ')}</p>
        </div>
      </footer>
    </PrintSheet>
  )
}
