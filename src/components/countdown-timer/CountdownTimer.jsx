import React from 'react';
import Countdown from 'react-countdown';

const CountdownTimer = ({time}) => {
    const targetDate = new Date(time);

    const renderer = ({ days, hours, minutes, seconds }) => {
        if (days > 0) {
            return <span>{days} days</span>;
        } else {
            return <span>{hours>10?`${hours}`:`0${hours}`}:{minutes>10?`${minutes}`:`0${minutes}`}:{seconds}</span>;
        }
    };

    return (
        <Countdown
            date={targetDate}
            renderer={renderer}
        />
    );
};

export default CountdownTimer;
