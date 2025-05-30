import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import DrawerItems from './DrawerItems.jsx';
import React from 'react';


const Sidebar = ({ mobileOpen, setMobileOpen, setIsClosing }) => {
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  return (
    <Box
      component="nav"
      width={{ lg: 300 }}
      flexShrink={{ lg: 0 }}
      display={{ xs: 'none', lg: 'block' }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
            color: '#fff',
            borderRight: 0,
            boxShadow: 6,
            borderRadius: '0 24px 24px 0',
            p: 0,
            minHeight: '100vh',
          }
        }}
      >
        <DrawerItems  />
      </Drawer>

      <Drawer 
        variant="permanent" 
        sx={{ display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
            color: '#fff',
            borderRight: 0,
            boxShadow: 6,
            borderRadius: '0 24px 24px 0',
            p: 0,
            minHeight: '100vh',
          }
        }} 
        open
      >
        <DrawerItems />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
