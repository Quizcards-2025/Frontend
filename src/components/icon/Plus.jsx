import * as React from "react";
const SvgPlus = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={50}
    height={55}
    fill="none"
    {...props}
  >
    <rect width={50} height={50} y={5} fill="#E0E0FE" rx={15} />
    <rect width={50} height={50} fill="#F8F8FF" rx={15} />
    <path stroke="#000" d="M25 16v18m-9-9h18" />
  </svg>
);
export default SvgPlus;
