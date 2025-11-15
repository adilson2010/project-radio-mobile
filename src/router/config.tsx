
import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/home/page'));
const LojaPage = lazy(() => import('../pages/loja/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const AdminLoginPage = lazy(() => import('../pages/admin/login/page'));
const AdminSetupPage = lazy(() => import('../pages/admin/setup/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    index: true,
    element: <HomePage />,
  },
  {
    path: 'loja',
    element: <LojaPage />,
  },
  {
    path: 'admin',
    element: <AdminPage />,
  },
  {
    path: 'admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: 'admin/setup',
    element: <AdminSetupPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
