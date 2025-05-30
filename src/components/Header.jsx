
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme.js";

const Header = ({ title, subtitle,fontSize }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb="10px">
      <Typography
        variant="h2"
        fontWeight="700"
        color={colors.gray[100]}
        fontSize={fontSize||"32px"}
        fontFamily="Wix Madefor Text"
        lineHeight="28.80px"
      >
        {title}
      </Typography>
      <Typography variant="h5" color={colors.greenAccent[400]}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
