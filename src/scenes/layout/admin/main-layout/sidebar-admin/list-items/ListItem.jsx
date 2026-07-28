import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconifyIcon from '../../../../../../components/base/IconifyIcon.jsx';
import React from 'react';
import {useLocation} from "react-router-dom";

const ListItem = ({subheader, icon, path, realPath}) => {
    const location = useLocation();
    return (
        <ListItemButton
            component={Link}
            href={path}
            sx={{
                mb: 2.5,
                borderRadius: 3,
                px: 2,
                py: 1.2,
                boxShadow: realPath === location.pathname ? 3 : 0,
                background: realPath === location.pathname
                  ? 'linear-gradient(90deg, #fff 0%, #e3f2fd 100%)'
                  : 'transparent',
                color: realPath === location.pathname ? 'primary.main' : '#fff',
                borderLeft: realPath === location.pathname ? '6px solid #1976d2' : '6px solid transparent',
                transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)',
                  color: 'primary.main',
                  transform: 'scale(1.03)',
                  boxShadow: 2,
                },
            }}
        >
            <ListItemIcon>
                {icon && (
                    <IconifyIcon
                        icon={icon}
                        fontSize="h4.fontSize"
                        sx={{
                            color: realPath === location.pathname ? 'primary.main' : '#fff',
                        }}
                    />
                )}
            </ListItemIcon>
            <ListItemText
                primary={subheader}
                sx={{
                    '& .MuiListItemText-primary': {
                        color: realPath === location.pathname ? 'primary.main' : '#fff',
                        fontWeight: 600,
                        letterSpacing: 1,
                    },
                }}
            />
        </ListItemButton>
    );
};

export default ListItem;
