import {Box} from "@mui/material";
import "./folder-sticky.css"
import {useNavigate} from "react-router-dom";


function FolderSticky(props) {
    const navigate=useNavigate();
    const handleRedirectDetailFolder = () => {
        navigate(`/user/folder/${props.id}`);
    }
    return (
        <Box sx={{fontFamily: "Wix Madefor Text"}} onClick={handleRedirectDetailFolder}>
            <Box
                style={{
                    position: "relative",
                    width: "100%",
                    height: "196px",
                    overflow: "hidden",
                    cursor: "pointer",
                }}
            >
                <svg
                    width="222"
                    height="196"
                    viewBox="0 0 222 196"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{position: "absolute", zIndex: 1}}
                >
                    <path
                        d="M15.167 15C15.167 6.71574 21.8827 0 30.167 0H110.719H166.597C174.881 0 181.597 6.71573 181.597 15V19.8259C181.597 26.6394 187.12 32.1629 193.933 32.1629C200.747 32.1629 206.27 37.6863 206.27 44.4998V180.653C206.27 188.938 199.555 195.653 191.27 195.653H30.167C21.8827 195.653 15.167 188.938 15.167 180.653V15Z"
                        fill="#E0E0FE"
                    />
                    <path
                        d="M2.89061 74.2149C1.9469 65.9102 8.44296 58.6342 16.8011 58.6342H204.636C212.994 58.6342 219.49 65.9102 218.547 74.2149L206.789 177.684C205.985 184.759 199.999 190.103 192.878 190.103H28.5589C21.4386 190.103 15.4524 184.759 14.6485 177.684L2.89061 74.2149Z"
                        fill="#F8F8FF"
                        stroke="#E0E0FE"
                        strokeWidth="2"
                    />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     style={{position: "absolute", zIndex: 100, top: "160px", left: "170px", cursor: "pointer"}}
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     className="icon icon-tabler icons-tabler-outline icon-tabler-dots">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                    <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                </svg>
                <div
                    className="set-terms"
                    style={{
                        position: "absolute",
                        zIndex: 2,
                        top: "15px",
                        left: "80px",
                        backgroundColor: "white"
                    }}
                >
                    {`${props.setCount} sets` || " no data "}
                </div>
                <div
                    style={{
                        position: "absolute",
                        zIndex: 2,
                        top: "110px",
                        left: "35px",
                        width: "150px",
                        height: "40px", // Chiều cao cố định
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block", // Đổi từ flex sang block
                        lineHeight: "40px", // Dùng line-height để căn giữa nội dung
                        textAlign: "center", // Căn giữa theo chiều ngang
                    }}
                >
                    {props.title || "no data"}
                </div>
            </Box>
        </Box>

    );
}

export default FolderSticky;
