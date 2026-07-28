import {useLocation} from "react-router-dom";

export const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
};

const PrivateRoute = ({ element }) => {
    const location = useLocation();
    if (!isAuthenticated()) {
        const fullPath = location.pathname + location.search;
        sessionStorage.setItem('redirectAfterAuth', fullPath);
        window.location.href = '/login';
        return null;
    }
    return element;
};

export default PrivateRoute;
