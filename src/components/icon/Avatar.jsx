import * as React from "react";
const SvgAvatar = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size||24}
    height={props.size||24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="avatar_svg__icon avatar_svg__icon-tabler avatar_svg__icons-tabler-outline avatar_svg__icon-tabler-user-circle"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" />
    <path d="M9 10a3 3 0 1 0 6 0 3 3 0 1 0-6 0M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
  </svg>
);
export default SvgAvatar;
