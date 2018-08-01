import React from 'react';

class Register extends React.Component {

    render() {
        const { username, password, confirmPassword, handleChange, handleSubmit, handleLinkClick } = this.props;
        return (
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="login-wrapper">
                        <h2>Register</h2>
                        <hr />
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    onChange={handleChange}
                                    className={username.className}
                                    value={username.value}
                                    id="username"
                                    name="username"
                                    placeholder="Enter username"
                                />
                                <div className="invalid-feedback">
                                    {username.errorMsg}
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    onChange={handleChange}
                                    className={password.className}
                                    value={password.value}
                                    id="password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <div className="invalid-feedback">
                                    {password.errorMsg}
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm password</label>
                                <input
                                    type="password"
                                    onChange={handleChange}
                                    className={confirmPassword.className}
                                    value={confirmPassword.value}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                />
                                <div className="invalid-feedback">
                                    {confirmPassword.errorMsg}
                                </div>
                            </div>
                            <div className="text-right">
                                <button type="submit" className="btn btn-success">Register</button>
                            </div>
                        </form>
                        <hr />
                        <p className="text-muted form-help"><a href="/login" onClick={event => handleLinkClick(event, 'home')}>Login</a> if you are already registered</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default Register;