import { useAuth } from "../modules/iam/context/use-auth";
import { useHasRole } from "../modules/iam/hooks/use-has-role";

export function HomePage() {
    const { user, logout } = useAuth();
    const isSupervisor = useHasRole("SUPERVISOR");

    return (
        <div>
            <p>
                Sesión iniciada como {user?.email} ({user?.role})
            </p>
            {isSupervisor && <p>Tenés permisos de supervisor.</p>}
            <button type="button" onClick={() => logout()}>
                Cerrar sesión
            </button>
        </div>
    );
}
