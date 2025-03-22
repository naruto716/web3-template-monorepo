import { Navigate, RouteObject } from 'react-router-dom';
import { RootLayout } from '../layout/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { ListItemPage } from '@/pages/ListItemPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';
import { ItemDetailsPage } from '@/pages/ItemDetailsPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { createBrowserRouter } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'marketplace',
        element: <MarketplacePage />,
      },
      {
        path: 'list-item',
        element: (
          <ProtectedRoute requiredRoles={['employer', 'professional', 'admin']}>
            <ListItemPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'professional/:id',
        element: <ItemDetailsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/marketplace',
    element: <MarketplacePage />,
  },
  {
    path: '/list-item',
    element: <ListItemPage />,
  },
  {
    path: '/professional/:id',
    element: <ItemDetailsPage />,
  },
]); 