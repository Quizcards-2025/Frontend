import * as React from "react";
const SvgImportText = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={23}
    fill="none"
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2m6-13-5 5m0 0 5 5m-5-5h12"
    />
  </svg>
);
export default SvgImportText;
