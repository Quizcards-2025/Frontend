import { Box } from '@mui/material';
import { Icon } from '@iconify/react';
import React from 'react';

const IconifyIcon = ({ icon, ...rest }) => {
  return (
      <Box {...rest}>
        <Icon icon={icon} />
      </Box>
  );
};

export default IconifyIcon;