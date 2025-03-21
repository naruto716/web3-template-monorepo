import { Navigate, RouteObject } from 'react-router-dom';
import { RootLayout } from '../layout/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { ListItemPage } from '@/pages/ListItemPage';
import { ItemDetailsPage } from '@/pages/ItemDetailsPage';
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
        element: <ListItemPage />,
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