// @ts-ignore
import React from "react";
import { useMode } from "../../../theme.js";
import {Theme} from "@mui/material";

interface RandomCardProps {
    svgSize?: number;
    buttonSize?: number;
    onClick: () => void;
}

const RandomCard: React.FC<RandomCardProps> = ({ svgSize = 24, buttonSize = 50, onClick }) => {
    const [theme, colorMode] = useMode() as [Theme, { toggleColorMode: () => void }];

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
            {
                theme.palette.mode === "light" ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={svgSize}
                        height={svgSize}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-shuffle"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 4l3 3l-3 3"/>
                        <path d="M18 20l3 -3l-3 -3"/>
                        <path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5"/>
                        <path d="M21 7h-5a5 5 0 0 0 -5 5a5 5 0 0 1 -5 5h-3"/>
                    </svg>
                ) : (
                    <svg
                        width="50"
                        height="55"
                        viewBox="0 0 50 55"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect y="5" width="50" height="50" rx="15" fill="#303032"/>
                        <rect width="50" height="50" rx="15" fill="#1C1D1D"/>
                        <path d="M31 17L34 20M34 20L31 23M34 20L29 20C27.9179 19.9984 26.8647 20.3495 26 21M31 33L34 30M34 30L31 27M34 30H29C27.6739 30 26.4021 29.4732 25.4645 28.5355C24.5268 27.5979 24 26.3261 24 25C24 23.6739 23.4732 22.4021 22.5355 21.4645C21.5979 20.5268 20.3261 20 19 20H16M22 29C21.1351 29.6502 20.082 30.0012 19 30H16" stroke="#FAF9FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                )
            }

        </div>
    );
};

export default RandomCard;
