import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { FullPageLoader } from '@/components/ui/Loaders'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { PrintLayout } from '@/layouts/PrintLayout'
import { RootLayout } from '@/layouts/RootLayout'
import RouteErrorPage from '@/pages/RouteErrorPage'
import { PublicOnly, RequireAuth, RequirePasswordSet, RequireRole } from '@/routes/guards'
import {
  CONSULT_ROLES,
  MANAGE_USERS_ROLES,
  OPD_DESK_ROLES,
  PATIENT_ROLES,
  PRESCRIPTION_READ_ROLES,
  QUEUE_READ_ROLES,
} from '@/utils/roles'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const ChangePasswordPage = lazy(() => import('@/pages/ChangePasswordPage'))
const HomePage = lazy(() => import('@/pages/HomePage'))
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const PatientsPage = lazy(() => import('@/pages/PatientsPage'))
const PatientViewPage = lazy(() => import('@/pages/PatientViewPage'))
const PatientNewPage = lazy(() => import('@/pages/PatientNewPage'))
const PatientEditPage = lazy(() => import('@/pages/PatientEditPage'))
const DoctorsPage = lazy(() => import('@/pages/DoctorsPage'))
const QueuePage = lazy(() => import('@/pages/QueuePage'))
const ConsultationPage = lazy(() => import('@/pages/ConsultationPage'))
const BillPrintPage = lazy(() => import('@/pages/BillPrintPage'))
const PrescriptionPrintPage = lazy(() => import('@/pages/PrescriptionPrintPage'))

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { element: <PublicOnly />, children: [{ path: '/login', element: <LoginPage /> }] },
          { element: <RequireAuth />, children: [{ path: '/change-password', element: <ChangePasswordPage /> }] },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RequirePasswordSet />,
            children: [
              {
                element: <AppLayout />,
                children: [
                  { path: '/', element: <HomePage /> },
                  { path: '/forbidden', element: <ForbiddenPage /> },
                  {
                    element: <RequireRole roles={MANAGE_USERS_ROLES} />,
                    children: [
                      { path: '/users', element: <UsersPage /> },
                      { path: '/doctors', element: <DoctorsPage /> },
                    ],
                  },
                  {
                    element: <RequireRole roles={QUEUE_READ_ROLES} />,
                    children: [{ path: '/queue', element: <QueuePage /> }],
                  },
                  {
                    element: <RequireRole roles={CONSULT_ROLES} />,
                    children: [{ path: '/queue/:queueId/consult', element: <ConsultationPage /> }],
                  },
                  {
                    element: <RequireRole roles={PATIENT_ROLES} />,
                    children: [
                      { path: '/patients', element: <PatientsPage /> },
                      { path: '/patients/:patientId', element: <PatientViewPage /> },
                      { path: '/patients/new', element: <PatientNewPage /> },
                      { path: '/patients/:patientId/edit', element: <PatientEditPage /> },
                    ],
                  },
                ],
              },
              {
                element: <PrintLayout />,
                children: [
                  {
                    element: <RequireRole roles={OPD_DESK_ROLES} />,
                    children: [{ path: '/bills/:billId/print', element: <BillPrintPage /> }],
                  },
                  {
                    element: <RequireRole roles={PRESCRIPTION_READ_ROLES} />,
                    children: [{ path: '/prescriptions/:prescriptionId/print', element: <PrescriptionPrintPage /> }],
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
