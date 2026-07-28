import * as React from "react";
import {runInContext as props} from "lodash";
const SvgClock = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="clock_svg__icon clock_svg__icon-tabler clock_svg__icons-tabler-outline clock_svg__icon-tabler-alarm"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <path d="M5 13a7 7 0 1 0 14 0 7 7 0 1 0-14 0" />
    <path d="M12 10v3h2M7 4 4.25 6M17 4l2.75 2" />
  </svg>
);
export default SvgClock;
