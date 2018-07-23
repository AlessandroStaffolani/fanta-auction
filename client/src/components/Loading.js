import React from 'react';

class Loading extends React.Component {
    render() {
        return (
            <div className="loading">
                <i className="fas fa-spinner fa-spin fa-3x"/>
            </div>
        )
    }
}

export default Loading;