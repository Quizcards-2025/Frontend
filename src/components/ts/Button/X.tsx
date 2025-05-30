// @ts-ignore
import React from "react";

interface MaximizeProps {
    svgSize?: number;
    buttonSize?: number;
    onClick: () => void;
    className?: string;
}

const Maximize: React.FC<MaximizeProps> = ({svgSize = 24, buttonSize = 50, onClick, className= ""}) => {
    return (
        <div
            className={`button-control ${className}`}
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
            <svg xmlns="http://www.w3.org/2000/svg"
                 width={svgSize}
                 height={svgSize}
                 viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 className="icon icon-tabler icons-tabler-outline icon-tabler-x">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M18 6l-12 12"/>
                <path d="M6 6l12 12"/>
            </svg>
        </div>
    );
};

export default Maximize;
