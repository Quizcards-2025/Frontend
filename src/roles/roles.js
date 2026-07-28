export const Roles = {
    ADMIN: 'ROLE_ADMIN',
    PREMIUM_USER: 'ROLE_PREMIUM_USER',
    FREE_USER: 'ROLE_FREE_USER',
    GUEST: 'ROLE_GUEST',
};

export const PlanByRoles = {
    ROLE_ADMIN: 'Admin',
    ROLE_PREMIUM_USER: 'Premium plan',
    ROLE_FREE_USER: 'Free plan',
    ROLE_GUEST: 'Guest',
};

export const hasRole = (userRoles, requiredRole) => {
    if (Array.isArray(userRoles)) {
        return userRoles.includes(requiredRole);
    }
    return userRoles === requiredRole;
};

// Hàm xác định quyền truy cập dựa trên vai trò
export const canAccess = (userRoles, pageRoles) => {
    if (Array.isArray(pageRoles)) {
        return pageRoles.some(role => hasRole(userRoles, role));
    }
    return undefined;
};

export const mapPlanByRole = (userRoles, pageRoles) => {
    if (Array.isArray(pageRoles)) {
        for (const role of pageRoles) {
            if (hasRole(userRoles, role)) {
                return PlanByRoles[role];
            }
        }
    }
    return undefined; // hoặc trả về giá trị mặc định nếu không có role phù hợp
};