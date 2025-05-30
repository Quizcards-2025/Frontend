import React, {useState} from 'react';
import {Box, Button} from '@mui/material';

interface ButtonTemplateProps {
    label: string;
    icon: string | number;
    type?: string;
    bgColor: string;
    textColor: string;
    circleBg: string;
    highlightBg: string;
    highlightText: string;
    highlightCircle: string;
    onClick?: (obj: any) => void;
}

const ButtonTemplate: React.FC<ButtonTemplateProps> = ({
                                                           label,
                                                           icon,
                                                           type,
                                                           bgColor,
                                                           textColor,
                                                           circleBg,
                                                           highlightBg,
                                                           highlightText,
                                                           highlightCircle,
                                                           onClick,
                                                       }) => {
    const [clicked, setClicked] = useState(false);

    const handleClick = (event: any) => {
        onClick(event);
        setClicked(true);
        setTimeout(() => setClicked(false), 300);
    };

    return (
        <Button
            onClick={handleClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.6rem 2rem',
                borderRadius: '2.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: clicked ? highlightBg : bgColor,
                color: clicked ? highlightText : textColor,
                boxShadow: clicked
                    ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                    : '0 6px 12px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                transform: clicked ? 'scale(0.98)' : 'scale(1)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), 0 12px 24px rgba(0, 0, 0, 0.1)',
                },
                '&:active': {
                    transform: 'translateY(4px)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                },
                textTransform: "none",
            }}
        >
            <Box
                sx={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '20px',
                    fontSize: '1.1rem',
                    backgroundColor: clicked ? highlightCircle : circleBg,
                    color: 'white',
                    transition: 'background-color 0.3s ease',
                }}
            >
                {icon}
            </Box>
            {label}
        </Button>
    );
};

export default ButtonTemplate;