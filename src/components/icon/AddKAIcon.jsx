import React from 'react';

const SvgAddToKA = (props) => (
    <svg
        width={props.size || 24}
        height={props.size || 24}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M9.16667 23.8333L20.1667 34.8333M26.2532 31.7534L32.9999 38.5L38.4999 33L32.3307 26.8309M18.3333 10.0833L14.6667 5.5H5.5V14.6667L11 19.25M38.5 5.5V14.6667L18.3333 31.1667L11 38.5L5.5 33L12.8333 25.6667L29.3333 5.5H38.5Z"
            stroke="black"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"/>
    </svg>
);

export default SvgAddToKA;