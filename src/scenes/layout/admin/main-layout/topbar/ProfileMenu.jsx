import {useState} from 'react';
import {Box, Menu, Stack, Avatar, Divider, MenuItem, Typography, ButtonBase, ListItemIcon} from '@mui/material';
import {useNavigate} from "react-router-dom";
import IconifyIcon from '../../../../../components/base/IconifyIcon.jsx';
import paths from "../../path.jsx";

const menuItems = [
    {
        id: 1,
        title: 'View Profile',
        icon: 'ic:outline-account-circle',
        path: paths.profile,
        realPath: paths.profile,
    },
    {
        id: 2,
        title: 'Account Settings',
        icon: 'ic:outline-manage-accounts',
        path: paths.setting,
        realPath: paths.setting,
    },
    {
        id: 3,
        title: 'Logout',
        icon: 'ic:baseline-logout',
        path: '/logout',
        realPath: '/logout',
    },
];

const ProfileMenu = ({ user }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
    const handleProfileMenuClose = () => setAnchorEl(null);

    const handleMenuItemClick = (path) => {
        if (path === "/logout" || path === "/admin/logout") {
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
        navigate(path);
        handleProfileMenuClose();
    };

    const isActive = (path, realPath) => {
        const currentPath = window.location.pathname;
        return currentPath === path || currentPath === realPath;
    };

    return (
        <>
            <ButtonBase
                sx={{ml: 1}}
                onClick={handleProfileClick}
                aria-controls={open ? 'account-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                disableRipple
            >
                <Avatar src={(user && user.avatar) ||
                    'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'}
                        sx={{height: 44, width: 44, bgcolor: 'primary.main'}}/>
            </ButtonBase>

            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleProfileMenuClose}
                sx={{
                    mt: 1.5,
                    '& .MuiList-root': {p: 0, width: 230},
                }}
                transformOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            >
                <Box p={1}>
                    <MenuItem onClick={handleProfileMenuClose} sx={{'&:hover': {bgcolor: 'info.dark'}}}>
                        <Avatar src={(user && user.avatar) ||
                            'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'}
                                sx={{mr: 1, height: 42, width: 42}}/>
                        <Stack direction="column">
                            <Typography variant="body2" fontWeight={600}>{user.firstname || user.lastname ?
                                `${user.firstname || ''} ${user.lastname || ''}` : user.username}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Stack>
                    </MenuItem>
                </Box>

                <Divider sx={{my: 0}}/>

                <Box p={1}>
                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            onClick={() => handleMenuItemClick(item.path)}
                            sx={{
                                py: 1,
                                bgcolor: isActive(item.path, item.realPath) ? 'primary.light' : 'inherit',
                                '&:hover': { bgcolor: 'primary.main', color: 'white' },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    mr: 1,
                                    color: isActive(item.path, item.realPath) ? 'primary.main' : 'text.secondary',
                                    fontSize: 'h5.fontSize',
                                }}
                            >
                                <IconifyIcon icon={item.icon} />
                            </ListItemIcon>
                            <Typography
                                variant="body2"
                                fontWeight={500}
                                color={isActive(item.path, item.realPath) ? 'primary.main' : 'text.primary'}
                            >
                                {item.title}
                            </Typography>
                        </MenuItem>
                    ))}
                </Box>
            </Menu>
        </>
    );
};

export default ProfileMenu;
