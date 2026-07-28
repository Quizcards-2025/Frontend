import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const Footer = () => {
    return (
        <Typography
            mt={0.5}
            px={1}
            py={3}
            color="text.secondary"
            variant="body1"
            sx={{ textAlign: { xs: 'center', md: 'right' } }}
            letterSpacing={0.5}
            fontWeight={500}
        >
            Quizcard {`2024 - ${(new Date().getFullYear().toString())}`}
        </Typography>
    );
};

export default Footer;
