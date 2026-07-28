import React from 'react';
import { Box, Card, CardContent, Typography, Tooltip } from '@mui/material';

const CreatorCard = ({ userName, avatar, setCount, onTopCreatorClick = () => {}}) => {
    return (
        <Card
            sx={{
                maxWidth: 345,
                boxShadow: 5,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 10,
                    cursor: 'pointer',
                },
                borderRadius: '20px',
                overflow: 'hidden',

            }}
            onClick={onTopCreatorClick}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                    <Tooltip title={userName}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '50%',
                            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.1)'
                            }
                        }}>
                            {avatar ? (
                                <img src={avatar} width={50} height={50} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <>
                                    <img width="50" height="50"
                                         src="https://img.icons8.com/material-outlined/24/user-male-circle.png"
                                         alt="user-male-circle"/>
                                </>
                            )}
                        </Box>
                    </Tooltip>

                    <Box mt={1} textAlign="center">
                        {/* Creator Name */}
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#333', letterSpacing: 1}}>
                            {userName}
                        </Typography>

                        {/* Set Count with a smooth animation */}
                        <Typography variant="body2"
                                    sx={{color: '#777', transition: 'color 0.3s ease', '&:hover': {color: '#2196F3' } }}>
                            {setCount} sets
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CreatorCard;
