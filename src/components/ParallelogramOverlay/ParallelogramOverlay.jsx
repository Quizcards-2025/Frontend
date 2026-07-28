import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const Parallelogram = styled(Box)(({ theme, color }) => ({
    width: '1100px',
    height: '1200px',
    backgroundColor: color,
    borderRadius: '20px',
    transform: 'skew(-20deg)',
    position: 'relative',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',

    [theme.breakpoints.down('sm')]: {
        width: '1100px',
        height: '1200px',
    },

    [theme.breakpoints.between('sm', 'md')]: {
        width: '1100px',
        height: '1200px',
    },

    [theme.breakpoints.up('md')]: {
        width: '1100px',
        height: '1200px',
    },
}));

const ParallelogramOverlay = () => {
    return (
        <Box
            position="relative"
            width="100%"
            height="100%"
        >
            {/* Hình bình hành thứ nhất */}
            <Box
                position="absolute"
                sx={{
                    // top: {
                    //     xs: '60px',
                    //     sm: '70px',
                    //     md: '80px',
                    // },
                    // left: {
                    //     xs: '10px',
                    //     sm: '15px',
                    //     md: '20px',
                    // },
                    top: -200,
                    left: -120,
                    zIndex: 2,
                }}
            >
                <Parallelogram color="rgba(200, 210, 255, 0.8)" />
            </Box>

            {/* Hình bình hành thứ hai */}
            <Box
                position="absolute"
                sx={{
                    // top: {
                    //     xs: '150px',
                    //     sm: '175px',
                    //     md: '200px',
                    // },
                    // left: {
                    //     xs: '60px',
                    //     sm: '90px',
                    //     md: '120px',
                    // },
                    top: 80,
                    left: 120,
                    zIndex: 1,
                }}
            >
                <Parallelogram color="rgba(140, 160, 255, 0.7)" />
            </Box>
        </Box>
    );
};

export default ParallelogramOverlay;