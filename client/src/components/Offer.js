import React from 'react';

class Offer extends React.Component {

    render() {
        const { offer, handleChange, handleSubmit } = this.props;

        return (
            <form className="form-inline" onSubmit={handleSubmit}>
                <div className="offer-wrapper">
                    <label className="sr-only" htmlFor="offer-value">Value</label>
                    <input
                        type="text"
                        value={offer}
                        onChange={handleChange}
                        className="form-control mb-2 mr-sm-2"
                        id="offer-value"
                    />

                    <button type="submit" className="btn btn-success ml-2 mb-2">Send</button>
                </div>
            </form>
        )
    }
}

export default Offer;