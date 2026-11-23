import { Pencil } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PatientForm } from '@/components/patients/PatientForm'
import { Spinner } from '@/components/ui/Loaders'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState } from '@/components/ui/StateMessage'
import { useResource } from '@/hooks/useResource'
import { patientsService } from '@/services/patientsService'
import { toast } from '@/stores/toastStore'

export default function PatientEditPage() {
  const { patientId = '' } = useParams()
  const navigate = useNavigate()
  const { data: patient, status, error, reload } = useResource(patientsService.get, patientId)

  if (status === 'loading') return <Spinner message="Loading patient…" />
  if (status === 'error' || !patient) {
    return (
      <ErrorState
        title="Could not load the patient"
        description={error?.message ?? 'Please try again.'}
        action={
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={reload}>
              Try again
            </button>
            <Link to="/patients" className="btn btn-outline btn-primary">
              Back to patients
            </Link>
          </div>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader icon={Pencil} title="Edit patient" description={`${patient.name} (${patient.patientId})`} />
      <PatientForm
        patient={patient}
        onCancel={() => navigate(`/patients/${patientId}`)}
        onSaved={(saved) => {
          toast.success(`${saved.name} was updated`)
          navigate(`/patients/${saved.patientId}`)
        }}
      />
    </div>
  )
}
