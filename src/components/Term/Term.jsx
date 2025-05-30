import "./term.css";
import {Box} from "@mui/material";

const Term = (props) => {
    return (
        <Box className="term">
            <div className="detail">
                <div dangerouslySetInnerHTML={{__html: props.frontHTML}} className="term-question"/>
                <div className="separator"></div>
                <div dangerouslySetInnerHTML={{__html: props.backHTML}} className="term-answer"/>
            </div>
            <div>
                {
                    props.img && <>
                        <div className="separator"></div>
                        <div className="term-image">
                            <img src={props.img} width="100%" height="100%" alt="display-image"/>
                        </div>
                    </>
                }
            </div>
        </Box>
    );
}
export default Term;
