import React from 'react';
import '../components-styles/button.css'

class Button extends React.Component {

    render() {
        const { handleClick, disabled } = this.props;

        return (
            <div tabIndex={0} className="button-wrapper">
                <button disabled={disabled} className="button-shadow" onClick={handleClick}>
                    <span className="button-content">

                    </span>
                </button>
            </div>
        )
    }
}

export default Button;