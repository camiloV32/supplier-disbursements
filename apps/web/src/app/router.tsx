import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { LoginPage } from '@/modules/iam/pages/login.page';
import { DisbursementRequestsListPage } from '@/modules/disbursements/pages/disbursement-requests-list.page';
import { DisbursementRequestDetailPage } from '@/modules/disbursements/pages/disbursement-request-detail.page';
import { CreateDisbursementRequestPage } from '@/modules/disbursements/pages/create-disbursement-request.page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<Navigate to="/disbursement-requests" replace />}
        />
        <Route
          path="/disbursement-requests"
          element={<DisbursementRequestsListPage />}
        />
        <Route
          path="/disbursement-requests/:id"
          element={<DisbursementRequestDetailPage />}
        />
      </Route>

      <Route element={<ProtectedRoute roles={['ANALYST']} />}>
        <Route
          path="/disbursement-requests/new"
          element={<CreateDisbursementRequestPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
