// @ts-ignore
import React from "react";

interface SaveProps {
    svgSize?: number;
    buttonSize?: number;
    onClick: () => void;
}

const Share: React.FC<SaveProps> = ({ svgSize = 20, buttonSize = 40, onClick }) => {
    return (
        <div
            className="button-control"
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderBottom: "5px solid #e0e0fe",
                backgroundColor: "white",
                width: `${buttonSize}px`,
                height: `${buttonSize}px`,
                borderRadius: "15px",
                cursor: "pointer",
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.95)";
                e.currentTarget.style.boxShadow = "0 0 5px rgba(165, 181, 207, 0.1)";
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 className="icon icon-tabler icons-tabler-outline icon-tabler-share">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                <path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                <path d="M8.7 10.7l6.6 -3.4"/>
                <path d="M8.7 13.3l6.6 3.4"/>
            </svg>
        </div>
    );
};

export default Share;
