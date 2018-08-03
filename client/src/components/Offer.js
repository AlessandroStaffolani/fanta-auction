import React from 'react';

class Offer extends React.Component {

    render() {
        const { offer, handleChange, handleSubmit, errors } = this.props;

        return (
            <form className="form-inline" onSubmit={handleSubmit}>
                <div className="offer-wrapper">
                    <label className="sr-only" htmlFor="offer-value">Value</label>
                    <input
                        type="number"
                        value={offer}
                        onChange={handleChange}
                        className={errors ? "form-control mb-2 mr-sm-2 is-invalid" : "form-control mb-2 mr-sm-2"}
                        id="offer-value"
                    />
                    {errors ? <small className="form-help text-muted with-error">{errors}</small> : ''}

                    <button type="submit" className="btn btn-success ml-2 mb-2">Send</button>
                </div>
            </form>
        )
    }
}

export default Offer;