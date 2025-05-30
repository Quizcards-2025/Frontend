// @ts-ignore
import React from "react";

interface MaximizeProps {
    svgSize?: number;
    buttonSize?: number;
    onClick: () => void;
}

const Maximize: React.FC<MaximizeProps> = ({ svgSize = 20, buttonSize = 40, onClick }) => {
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
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={svgSize}
                height={svgSize}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrows-diagonal"
            >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M16 4l4 0l0 4" />
                <path d="M14 10l6 -6" />
                <path d="M8 20l-4 0l0 -4" />
                <path d="M4 20l6 -6" />
            </svg>
        </div>
    );
};

export default Maximize;
