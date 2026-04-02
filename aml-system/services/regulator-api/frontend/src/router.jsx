import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ProofListPage from './pages/ProofListPage';
import ProofDetailPage from './pages/ProofDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <ProofListPage />,
      },
      {
        path: 'proofs/:proofId',
        element: <ProofDetailPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);