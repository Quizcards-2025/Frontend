export const rootPaths = {
    root: '/',
    adminRoot: 'admin',
    authRoot: 'auth',
    errorRoot: 'error',
};

export const basePaths = {
    admin: '/admin',
    auth: '/auth',
    error: '/error',
};

export default {
    dashboard: `/${rootPaths.adminRoot}/dashboard`,
    categorySetFlashcard: `/${rootPaths.adminRoot}/category-set-management`,
    categorySubscription: `/${rootPaths.adminRoot}/category-subscription`,
    userManagement: `/${rootPaths.adminRoot}/user-management`,
    setManagement: `/${rootPaths.adminRoot}/set-management`,
    folderManagement: `/${rootPaths.adminRoot}/folder-management`,

    // signin: `/${rootPaths.authRoot}/signin`,
    // signup: `/${rootPaths.authRoot}/signup`,
    // forgotPassword: `/${rootPaths.authRoot}/forgot-password`,
    // 404: `/${rootPaths.errorRoot}/404`,

    // setting: `/${rootPaths.adminRoot}/setting`,
    profile: `/${rootPaths.adminRoot}/profile`,
    setting: `${rootPaths.adminRoot}/setting`,
    notification: `/${rootPaths.adminRoot}/notification`,
    notificationManagement: `/${rootPaths.adminRoot}/notification-management`,
};
