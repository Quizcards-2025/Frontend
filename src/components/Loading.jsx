import React from 'react';
import ReactLoading from 'react-loading';
import {red} from "@mui/material/colors";

const Loading = ({ type, color }) => (
        <ReactLoading type={"spin"} color="blue" width={50} height={50} />
);

export default Loading;