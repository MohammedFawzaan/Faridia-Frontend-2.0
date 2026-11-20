import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { FullPageLoader } from '@/components/ui/Loaders'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { RootLayout } from '@/layouts/RootLayout'
import RouteErrorPage from '@/pages/RouteErrorPage'
import { PublicOnly, RequireAuth, RequirePasswordSet } from '@/routes/guards'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const ChangePasswordPage = lazy(() => import('@/pages/ChangePasswordPage'))
const HomePage = lazy(() => import('@/pages/HomePage'))
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

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
