import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { LoginPage } from "../modules/iam/pages/login.page";
import { HomePage } from "./home.page";

export function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
