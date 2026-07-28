import {Box} from "@mui/material";
import "./CardDeadline.css";
import CountdownTimer from "src/components/countdown-timer/CountdownTimer.jsx";
import {useNavigate} from "react-router-dom";

const CardDeadline = ({size = 1, title, deadline, totalCard, setId}) => {
    const titleFontSize = `${15 * size}px`; // Kích thước chữ cho tiêu đề
    const termsFontSize = `${10 * size}px`; // Kích thước chữ cho "34 terms"
    const timeFontSize = `${12 * size}px`;
    const navigate=useNavigate();
    const handleRedirectViewSet = () => {
        navigate(`/user/set/detail/${setId}`);
    }
    return (
        <Box className="card-deadline"  m={1} onClick={()=>handleRedirectViewSet(setId)}>
            <b className="card-deadline-title" style={{fontSize: titleFontSize}}>
                {title}
            </b>
            <div className="card-deadline-terms-container">
                <div className="card-deadline-terms" style={{fontSize: termsFontSize}}>{totalCard} terms</div>
                <span style={{color: "#0E22E9", fontSize: timeFontSize}}><CountdownTimer time={deadline}/></span>
            </div>
        </Box>
    );
};

export default CardDeadline;
