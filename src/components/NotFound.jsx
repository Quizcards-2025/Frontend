// src/pages/NotFound/index.jsx
import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import NotFoundImage from './icon/NotFoundImage';

const StyledContent = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: theme.spacing(12, 0),
}));

const AnimatedBox = styled(Box)({
    width: '100%',
    maxWidth: 360,
    margin: 'auto',
    height: 265,
    '@keyframes bounce': {
        '0%': {
            transform: 'translateY(0)',
        },
        '50%': {
            transform: 'translateY(-20px)',
        },
        '100%': {
            transform: 'translateY(0)',
        },
    },
    animation: 'bounce 2s infinite ease-in-out',
});


const NotFound = () => {
    return (
        <Container>
            <StyledContent sx={{ textAlign: 'center', alignItems: 'center' }}>
                <AnimatedBox>
                    <NotFoundImage />
                </AnimatedBox>

                <Typography variant="h3" paragraph>
                    Sorry, page not found!
                </Typography>

                <Typography sx={{ color: 'text.secondary', mb: 5 }}>
                    We couldn&#39;t find the page you&#39;re looking for. The URL may be incorrect or the page may have been removed.
                </Typography>

                <Button
                    component={RouterLink}
                    to="/"
                    size="large"
                    variant="contained"
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)',
                    }}
                >
                    Back to Home
                </Button>
            </StyledContent>
        </Container>
    );
};

export default NotFound;