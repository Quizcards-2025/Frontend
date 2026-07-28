// @ts-ignore
import React from "react";

interface PreviousProps {
    svgSize?: number;      // Optional prop for SVG size
    buttonSize?: number;   // Optional prop for button size
    onClick: () => void;   // Required prop for click handler
}

const Previous2: React.FC<PreviousProps> = ({svgSize = 24, buttonSize = 50, onClick}) => {
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
        >
            <svg
                width={svgSize}
                height={svgSize}
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M11.2667 14L7 18M7 18L11.2667 22M7 18H18.7333C19.8649 18 20.9502 17.5786 21.7503 16.8284C22.5505 16.0783 23 15.0609 23 14C23 12.9391 22.5505 11.9217 21.7503 11.1716C20.9502 10.4214 19.8649 10 18.7333 10H17.6667"
                    stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    );
};

export default Previous2;
