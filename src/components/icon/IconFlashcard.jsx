import * as React from "react";
const SvgFlashcardIcon = (props) => (
  <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 37 36"
      fill="none"
      {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M23.5 2.334h1.833a1.834 1.834 0 0 1 1.834 1.833v6.417M32.667 6q.726.308 1.408.578a1.833 1.833 0 0 1 .971 2.403l-4.213 9.853M2.607 8.194l13.087-5.7a1.76 1.76 0 0 1 2.328.967l9.027 21.82a1.833 1.833 0 0 1-.942 2.39l-13.084 5.7a1.76 1.76 0 0 1-2.33-.965L1.664 10.583a1.833 1.833 0 0 1 .942-2.389"
    />
  </svg>
);
export default SvgFlashcardIcon;
