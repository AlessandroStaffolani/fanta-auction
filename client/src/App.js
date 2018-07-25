import React, {Component} from 'react';
import logo from './logo.svg';
import Console from './components/Console';
import Login from './components/Login';
import Register from './components/Register';
import Loading from './components/Loading';
import {validateRequiredInput} from "./utils/validation";
import { setToken, getToken, removeToken } from './utils/localStorageUtils';
import config from './config/config';

const APPLICATION_API_HOST = config.serverPath;
const API_HEADERS = new Headers();
API_HEADERS.append('Accept', 'application/json');
API_HEADERS.append('Content-Type', 'application/json');

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'Fanta Auction',
            isLoading: false,
            userLogged: false,
            username: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            password: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            newPassword: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            confirmPassword: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            currentPage: 'home'
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
        this.handleSubmitRegister = this.handleSubmitRegister.bind(this);
    }

    handleInputChange = (event) => {
        event.preventDefault();
        const name = event.target.name;
        const field = this.state[name];
        field.value = event.target.value;
        this.setState(field);
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const { username, password } = this.state;
        let hasErrors = false;
        let usernameValidation = validateRequiredInput(username, username.value);
        if (usernameValidation.hasError) {
            hasErrors = true;
        }
        let passwordValidation = validateRequiredInput(password, password.value);
        if (passwordValidation.hasError) {
            hasErrors = true;
        }

        if (!hasErrors) {
            // input data for login
            this.loginRequest();
        } else {
            this.setState({
                username: usernameValidation.object,
                password: passwordValidation.object
            })
        }
    };

    loginRequest = () => {
        this.setState({
            isLoading: true
        });
        let path = APPLICATION_API_HOST + '/auth/login';
        const userBody = JSON.stringify({
            user: {
                username: this.state.username.value,
                password: this.state.password.value
            }
        });
        let hasErros = false;
        fetch(path, {
            method: 'POSt',
            headers: API_HEADERS,
            body: userBody,
        })
            .then(result => {
                if (result.status === 400) {
                    hasErros = true;
                }
                return result.json();
            })
            .then(result => {
                if (hasErros) {
                    const state = this.state;
                    const errors = result.payload.errors;
                    Object.keys(errors).map(errKey => {
                        const err = errors[errKey];
                        console.log(err);
                        state[err.param].className = 'form-control is-invalid';
                        state[err.param].errorMsg = err.command;
                        state.isLoading = false;

                        this.setState(state);
                    })
                } else {
                    if (result.token) {
                        setToken(result.token);
                        this.setState({
                            username: {
                                className: 'form-control',
                                errorMsg: '',
                                value: result.username,
                            },
                            password: {
                                className: 'form-control',
                                errorMsg: '',
                                value: '',
                            },
                            newPassword: {
                                className: 'form-control',
                                errorMsg: '',
                                value: '',
                            },
                            confirmPassword: {
                                className: 'form-control',
                                errorMsg: '',
                                value: '',
                            },
                            userLogged: {
                                id: result.userId,
                                username: result.username
                            },
                            isLoading: false,
                            title: 'Fanta Auction - Console'
                        });
                    }
                }
            })
            .catch(err => {
                console.log(err);
            });
    };

    handleLogoutClick = (event) => {
        event.preventDefault();
        this.setState({
            title: 'Fanta Auction',
            isLoading: false,
            userLogged: false,
            userId: '',
            username: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            password: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            newPassword: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            confirmPassword: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            currentPage: 'home'
        });
        removeToken();
    };

    handleLinkClick = (event, page) => {
        event.preventDefault();
        const { userLogged, username } = this.state;
        let title = 'Fanta Auction';
        if (page !== 'home') {
            title += ' - ' + page[0].toUpperCase() + page.substr(1);
        } else if (page === 'home' && userLogged) {
            title += ' - Console';
        }
        this.setState({
            currentPage: page,
            username: {
                className: 'form-control',
                errorMsg: '',
                value: username.value,
            },
            password: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            newPassword: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            confirmPassword: {
                className: 'form-control',
                errorMsg: '',
                value: '',
            },
            userLogged: userLogged,
            isLoading: false,
            title: title
        })
    };

    handleSubmitRegister = (event) => {
        event.preventDefault();
        const { username, password, confirmPassword } = this.state;
        let hasErrors = false;
        let usernameValidation = validateRequiredInput(username, username.value);
        if (usernameValidation.hasError) {
            hasErrors = true;
        }
        let passwordValidation = validateRequiredInput(password, password.value);
        if (passwordValidation.hasError) {
            hasErrors = true;
        }
        let confirmPasswordValidation = validateRequiredInput(confirmPassword, confirmPassword.value);
        if (confirmPasswordValidation.hasError) {
            hasErrors = true;
        }
        if (!confirmPasswordValidation.hasError && !passwordValidation.hasError) {
            if (confirmPassword.value !== password.value) {
                hasErrors = true;
                passwordValidation.object.className = 'form-control is-invalid';
                passwordValidation.object.errorMsg = 'Password and confirm password must be the same';
                confirmPasswordValidation.object.className = 'form-control is-invalid';
                confirmPasswordValidation.object.errorMsg = 'Password and confirm password must be the same';
            }
        }

        if (!hasErrors) {
            // register request
            this.registerRequest();
        } else {
            this.setState({
                username: usernameValidation.object,
                password: passwordValidation.object,
                confirmPassword: confirmPasswordValidation.object
            })
        }
    };

    registerRequest = () => {
        this.setState({
            isLoading: true
        });
        let path = APPLICATION_API_HOST + '/public/register';
        const userBody = JSON.stringify({
            user: {
                username: this.state.username.value,
                password: this.state.password.value
            }
        });
        let hasErros = false;
        fetch(path, {
            method: 'POST',
            headers: API_HEADERS,
            body: userBody,
        })
            .then(result => {
                if (result.status === 400) {
                    hasErros = true;
                }
                return result.json();
            })
            .then(result => {
                if (hasErros) {
                    const state = this.state;
                    const errors = result.payload.errors;
                    Object.keys(errors).map(errKey => {
                        const err = errors[errKey];
                        console.log(err);
                        state[err.param].className = 'form-control is-invalid';
                        state[err.param].errorMsg = err.command;
                        state.isLoading = false;

                        this.setState(state);
                    })
                } else {
                    setToken(result.token);
                    this.setState({
                        username: {
                            className: 'form-control',
                            errorMsg: '',
                            value: result.user.username,
                        },
                        password: {
                            className: 'form-control',
                            errorMsg: '',
                            value: '',
                        },
                        newPassword: {
                            className: 'form-control',
                            errorMsg: '',
                            value: '',
                        },
                        confirmPassword: {
                            className: 'form-control',
                            errorMsg: '',
                            value: '',
                        },
                        userLogged: {
                            id: result.user._id.toString(),
                            username: result.user.username
                        },
                        isLoading: false,
                        title: 'Fanta Auction - Console',
                        currentPage: 'home'
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
    };

    render() {
        const { currentPage, userLogged } = this.state;
        let content = <Login
            username={this.state.username}
            password={this.state.password}
            handleChange={this.handleInputChange}
            handleSubmit={this.handleSubmit}
            handleLinkClick={this.handleLinkClick}
        />;
        if (currentPage === 'home') {
            content = <Login
                username={this.state.username}
                password={this.state.password}
                handleChange={this.handleInputChange}
                handleSubmit={this.handleSubmit}
                handleLinkClick={this.handleLinkClick}
            />;
            if (userLogged) {
                content = <Console handleLogout={this.handleLogoutClick} username={this.state.userLogged.username}/>
            }
        } else if (currentPage === 'register' && !userLogged) {
            content = <Register
                username={this.state.username}
                password={this.state.password}
                confirmPassword={this.state.confirmPassword}
                handleSubmit={this.handleSubmitRegister}
                handleChange={this.handleInputChange}
                handleLinkClick={this.handleLinkClick}
            />
        }

        return (
            <div className="App">
                <nav className="navbar navbar-dark bg-dark">
                    <a className="navbar-brand" href="/" onClick={event => this.handleLinkClick(event, 'home')}>
                        <i className="fas fa-futbol d-inline-block align-top app-logo mr-3"/>
                        {this.state.title}
                    </a>
                </nav>
                <div className="app-wrapper pt-4">
                    <div className={'container'}>
                        {this.state.isLoading ? <Loading/> : content}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

/*
{this.state.userLogged ?
                        <ul className="navbar-nav mr-auto mt-2 mt-md-0">
                            <li className="nav-item">
                                <a className="nav-link" href="/logout" onClick={this.handleLogoutClick}>Logout <span className="sr-only">(current)</span></a>
                            </li>
                        </ul>
                        : ''}
 */