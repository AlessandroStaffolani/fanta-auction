import React from 'react';

class Timer extends React.Component {

    render() {
        const { time } = this.props;

        return (
            <div className="timer-wrapper my-4">
                <span className="time">
                    { time }
                </span>
            </div>
        )
    }
}

export default Timer;