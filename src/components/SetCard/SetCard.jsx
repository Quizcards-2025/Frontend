import "./SetCard.css";
import {useNavigate} from "react-router-dom";
import Avatar from "src/components/icon/Avatar.jsx";
import {authenticate} from "src/services/AuthenticationService.js";
import {FaRegEye} from "react-icons/fa6";
import {IoMdEye} from "react-icons/io";


const SetCard = (props) => {
    const navigate = useNavigate();
    const handleRedirectViewSet = () => {
        if (props.isGuess) {
            navigate(`/set/detail/${props.id}`);
        } else {
            navigate(`/user/set/detail/${props.id}`);
        }
    }
    const user=authenticate();
    const isAnonymous = props.isAnonymous? user.id !== props.userId :props.isAnonymous;
    const showAvatar = (isAnonymous || !props.avatarImg) ?
        <Avatar/> :
        <img
            src={props.avatarImg}
            alt="User Avatar"
            style={{width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover"}} />;
    return (
        <div className="set" style={props.style} onClick={handleRedirectViewSet}>
            <b className="set-title">
                {props.title || "no title"}
            </b>
            <div className="set-terms">{props.totalCard + " terms" || "no data ..."}</div>
            <div className="set-user-info">
                {showAvatar}
                <span>{isAnonymous ? "anonymous" : props.name}</span>

            </div>
            {props.userInteractionCount && (
                <div className="set-user-interaction">
                    <span>{props.userInteractionCount} </span>
                    <FaRegEye  color="black"/>
                </div>
            )}
        </div>

    )
}
export default SetCard;