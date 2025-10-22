import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Children } from "react";

const ProtectedRoute = ({children}) => {
    const { isAuthenticated } = useAuth();

    if(!isAuthenticated) {
        return <Navigate to="/" replace/>;
    }

    return children;
};

export default ProtectedRoute;