import React, {Component} from 'react';
import SocketIoClient from 'socket.io-client';
import { getToken } from '../utils/localStorageUtils';
import config from '../config/config';
import Button from "./Button";
import Timer from "./Timer";

const SOCKET_PATH = config.serverPath;

class Console extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userToken: getToken(props.username),
            currentPlayer: '',
            reservedBy: false,
            time: 5,
            buttonDisabled: true,
        };
        this.initSocketClient(this.state.userToken);

        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount() {
        this.socketClient.on('message', message => {
            console.log(message);
            this.setState({
                currentPlayer: message.value
            })
        });

        this.socketClient.on('timer', message => {
            console.log(message);
            this.setState({
                time: message.value,
                buttonDisabled: false
            })
        });

        this.socketClient.on('reset', message => {
            this.setState({
                buttonDisabled: message.value
            })
        });

        this.socketClient.on('reserved', message => {
            this.setState({
                reservedBy: message.value
            })
        });
    }

    initSocketClient = (token) => {
        if (token) {
            this.socketClient = SocketIoClient(SOCKET_PATH, {
                query: {
                    token: token
                }
            });
        }
    };

    handleButtonClick = (event) => {
        event.preventDefault();
        const path = SOCKET_PATH + '/auction/reserve';
        const api_headers = new Headers();
        const token = getToken(this.props.username);
        api_headers.append('Accept', 'application/json');
        api_headers.append('Content-Type', 'application/json');
        api_headers.append('Authorization', `Bearer ${token}`);
        fetch(path, {
            method: 'POST',
            headers: api_headers,
            body: JSON.stringify({user: this.props.username}),
        })
            .then(result => {
                if (result.status === 200) {
                    return result;
                } else {
                    console.log(result);
                }
            })
            .then(result => console.log(result))
            .catch(err => console.log(err));
    };

    handleLogout = (event) => {
        event.preventDefault();
        this.socketClient.disconnect();
        this.props.handleLogout(event);
    };

    render() {
        const { username } = this.props;
        //console.log(getToken(username));

        return (
            <div tabIndex={0}>
                <div className={'gui-wrapper'}>
                    <h1 className="text-center text-sm-left">
                        <span className="username">{username}</span>
                    </h1>
                    <hr/>
                    <div className="row mt-4 justify-content-center">
                        <div className="col-12 col-md-8 order-md-12 mb-4 mb-md-0">
                            {this.state.reservedBy ?
                                <p className="player-wrapper player-reserved text-center">
                                    Player reserved: <span className="player"><b>{this.state.reservedBy}</b></span>
                                </p>
                                : ''}
                            <Timer time={this.state.time}/>
                            <Button disabled={this.state.buttonDisabled} handleClick={this.handleButtonClick}/>
                        </div>
                    </div>
                    <div className="row mt-4 justify-content-center">
                        <div className="col-12 col-md-4">
                            <p className="player-wrapper text-center">
                                Current player: <span className="player"><b>{this.state.currentPlayer}</b></span>
                            </p>
                        </div>
                    </div>
                    <div className="row mt-4 justify-content-center">
                        <div className="col-10 col-md-4 mb-5">
                            <button className="btn btn-danger btn-block" onClick={this.handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Console;

