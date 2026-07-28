import React from 'react';


const VectorFalse = (props) => (
    <svg
        width={props.width || 14}
        height={props.height || 14}
        viewBox={`0 0 ${props.width || 14} ${props.height || 14}`}
        fill="none" xmlns="http://www.w3.org/2000/svg"
    >
        <path
            id="Vector"
            d="M13 1L1 13M1 1L13 13"
            stroke="#E73D3D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default VectorFalse;
