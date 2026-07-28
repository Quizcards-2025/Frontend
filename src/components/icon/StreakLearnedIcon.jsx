import * as React from "react";

const SvgStreakLearnedIcon = (props) => (
    <svg
        width={props.size || 48}
        height={props.size || 50}
        viewBox="0 0 48 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <g filter="url(#filter0_d_32_834)">
            <circle cx="24" cy="22" r="20" fill="#F76234"/>
        </g>
        <path
            d="M24 21.5294C28 15.7835 24 7.94118 22 6C22 11.8973 18.454 15.2031 16 17.6471C13.548 20.0929 12 23.9365 12 27.3529C12 30.4419 13.2643 33.4044 15.5147 35.5887C17.7652 37.7729 20.8174 39 24 39C27.1826 39 30.2348 37.7729 32.4853 35.5887C34.7357 33.4044 36 30.4419 36 27.3529C36 24.3791 33.888 19.7047 32 17.6471C28.428 23.4706 26.418 23.4706 24 21.5294Z"
            fill="#F7A634"/>
        <path
            d="M24 29C22 26.04 24 22 25 21C25 24.038 26.773 25.741 28 27C29.226 28.26 30 30.24 30 32C30 33.5913 29.3679 35.1174 28.2426 36.2426C27.1174 37.3679 25.5913 38 24 38C22.4087 38 20.8826 37.3679 19.7574 36.2426C18.6321 35.1174 18 33.5913 18 32C18 30.468 19.056 28.06 20 27C21.786 30 22.791 30 24 29Z"
            fill="#F7D734"/>
        <defs>
            <filter id="filter0_d_32_834" x="0" y="2" width="48" height="48" filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                               result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_32_834"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_32_834" result="shape"/>
            </filter>
        </defs>
    </svg>
);

export default SvgStreakLearnedIcon;