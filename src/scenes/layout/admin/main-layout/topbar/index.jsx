import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ProfileMenu from './ProfileMenu';
import { useLocation, useNavigate } from 'react-router-dom';
import IconifyIcon from '../../../../../components/base/IconifyIcon.jsx';
import {Box} from "@mui/material";

const Topbar = ({ isClosing, mobileOpen, setMobileOpen }) => {
    const location = useLocation(); // Lấy thông tin URL hiện tại
    const navigate = useNavigate(); // Điều hướng khi cần

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const isActive = (path) => location.pathname === path; // Kiểm tra trạng thái active

    return (
        <Stack
            py={3.5}
            alignItems="center"
            justifyContent="space-between"
            bgcolor="transparent"
            zIndex={1200}
        >
            {/* Logo */}
            <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center">
                <ButtonBase
                    component={Link}
                    href="/"
                    disableRipple
                    sx={{
                        lineHeight: 0,
                        display: { xs: 'none', sm: 'block', lg: 'none' },
                        color: isActive('/') ? 'primary.main' : 'inherit', // Đổi màu nếu active
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/'); // Điều hướng về trang chính
                    }}
                >
                </ButtonBase>

                {/* Menu Drawer */}
                <Toolbar sx={{ display: { xm: 'block', lg: 'none' } }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleDrawerToggle}
                    >
                        <IconifyIcon icon="ic:baseline-menu" />
                    </IconButton>
                </Toolbar>

                {/* Search Icon */}
                <Toolbar sx={{ ml: -1.5, display: { xm: 'block', md: 'none' } }}>
                    <IconButton size="large" edge="start" color="inherit" aria-label="search">
                        <IconifyIcon icon="eva:search-fill" />
                    </IconButton>
                </Toolbar>

                {/* Search Field
                <TextField
                    variant="filled"
                    placeholder="Search"
                    sx={{ width: 340, display: { xs: 'none', md: 'flex' } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconifyIcon icon="eva:search-fill" />
                            </InputAdornment>
                        ),
                    }}
                /> */}
            </Stack>

            {/* Profile Section */}
            <Stack spacing={{ xs: 1, sm: 2 }} alignItems="center">
                <IconButton size="large">
                    <Badge badgeContent={0} color="error">
                        <IconifyIcon icon="ic:outline-notifications-none" />
                    </Badge>
                </IconButton>
                <ProfileMenu user={JSON.parse(localStorage.getItem('user'))} />
            </Stack>
        </Stack>
    );
};

export default Topbar;
