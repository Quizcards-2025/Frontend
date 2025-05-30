import paths, {basePaths} from '../../path.jsx';

const sitemap = [
    {
        id: 'dashboard',
        subheader: 'Dashboard',
        path: paths.dashboard,
        realPath: paths.dashboard,
        icon: 'ri:dashboard-fill',
    },
    {
        id: 'category-set-card',
        subheader: 'Category Set Flashcard',
        path: paths.categorySetFlashcard,
        realPath: paths.categorySetFlashcard,
        icon: 'ri:folder-3-line',
    },
    {
        id: 'category-subscription',
        subheader: 'Category Subscription',
        path: paths.categorySubscription,
        realPath: paths.categorySubscription,
        icon: 'ri:bookmark-3-line',
    },
    {
        id: 'user-management',
        subheader: 'User Management',
        path: paths.userManagement,
        realPath: paths.userManagement,
        icon: 'ri:team-line',
    },
    {
        id: 'set-management',
        subheader: 'Set Management',
        path: paths.setManagement,
        realPath: paths.setManagement,
        icon: 'ri:settings-3-line',
    },
    {
        id: 'folder-management',
        subheader: 'Folder Management',
        path: paths.folderManagement,
        realPath: paths.folderManagement,
        icon: 'ri:folder-settings-line',
    },
];

export default sitemap;
