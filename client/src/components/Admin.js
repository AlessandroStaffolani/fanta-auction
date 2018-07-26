import React from 'react';
import '../components-styles/admin.css';
import { getToken } from '../utils/localStorageUtils';
import config from "../config/config";
import SocketIoClient from "socket.io-client";
import Timer from './Timer';

const SOCKET_PATH = config.serverPath;

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: 5,
            adminToken: getToken(props.username),
            player: '',
            currentPlayer: false,
            playersConnected: [],
            playerReserved: false,
        };

        this.initSocketClient(this.state.adminToken);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitCurrentPlayer = this.handleSubmitCurrentPlayer.bind(this);
        this.handleTimerButton = this.handleTimerButton.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
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

    componentDidMount() {
        const { playersConnected } = this.state;
        this.handleTimerButton(undefined, 'reset');
        this.socketClient.on('playerConnected', player => {
            playersConnected.push(player.value);
            this.setState({
                playersConnected: playersConnected
            })
        });

        this.socketClient.on('currentPlayer', player => {
            this.setState({
                currentPlayer: player.value
            })
        });

        this.socketClient.on('playerReserved', player => {
            this.setState({
                playerReserved: player.value
            })
        });

        this.socketClient.on('timer', message => {
            this.setState({
                time: message.value,
            })
        });
    }

    handleChange = (event) => {
        event.preventDefault();
        this.setState({
            player: event.target.value
        });
    };

    handleSubmitCurrentPlayer = (event) => {
        event.preventDefault();
        const path = SOCKET_PATH + '/admin/player/current';
        const api_headers = new Headers();
        const token = getToken(this.props.username);
        api_headers.append('Accept', 'application/json');
        api_headers.append('Content-Type', 'application/json');
        api_headers.append('Authorization', `Bearer ${token}`);
        fetch(path, {
            method: 'POST',
            headers: api_headers,
            body: JSON.stringify({player: this.state.player}),
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

    handleTimerButton = (event, type) => {
        if (event) {
            event.preventDefault();
        }
        const path = SOCKET_PATH + '/admin/timer/' + type;
        const api_headers = new Headers();
        const token = getToken(this.props.username);
        api_headers.append('Accept', 'application/json');
        api_headers.append('Content-Type', 'application/json');
        api_headers.append('Authorization', `Bearer ${token}`);
        fetch(path, {
            method: 'POST',
            headers: api_headers,
            body: JSON.stringify({player: this.props.username}),
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
        const { username, handleLogout } = this.props;

        return (
            <div className="admin-wrapper">
                <h1 className="text-center text-sm-left">
                    <span className="username">{username}</span>
                </h1>
                <hr/>
                <div className="form-row my-4 justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8 text-center">
                        {this.state.playerReserved ?
                            <h2 className="player-reserved">Player reserved: <span className="username">{this.state.playerReserved}</span></h2>
                            : ''}
                        <Timer time={this.state.time}/>
                    </div>
                </div>
                <hr/>
                <div className="form-row my-4 justify-content-between">
                    <div className="col-12 col-md-6">
                        <div className="form-row justify-content-center">
                            <div className="col-12 col-md-8 col-lg-6">
                                <button
                                    className="btn btn-success btn-block my-2"
                                    onClick={event => this.handleTimerButton(event, 'start')}
                                >
                                    Start
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-row justify-content-center">
                            <div className="col-12 col-md-8 col-lg-6">
                                <button
                                    className="btn btn-danger btn-block my-2"
                                    onClick={event => this.handleTimerButton(event, 'reset')}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                <form onSubmit={this.handleSubmitCurrentPlayer}>
                    <div className="form-row my-4 align-items-center justify-content-between">
                        <div className="col-12 col-md-6">
                            <div className="form-row justify-content-center">
                                <div className="col-12 col-md-8 col-lg-6">
                                    <label className="sr-only" htmlFor="player">Player</label>
                                    <input
                                        type="text"
                                        className="form-control my-2"
                                        id="player"
                                        name="player"
                                        value={this.state.player}
                                        placeholder="Enter player"
                                        onChange={this.handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="form-row justify-content-center">
                                <div className="col-12 col-md-8 col-lg-6">
                                    <button type="submit" className="btn btn-success btn-block my-2">Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <hr/>
                <div className="form-row my-4 justify-content-between">
                    <div className="col-12 col-md-6 text-center">
                        <h3>Players connected</h3>
                        <ul>
                            {this.state.playersConnected.map((player, index) =>
                                <li key={index} className="item username">
                                    {player}
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="col-12 col-md-6 text-center">
                        <h3>Status</h3>
                        {this.state.currentPlayer ?
                            <p>Current player: <span className="username">{this.state.currentPlayer}</span></p>
                            : ''}
                    </div>
                </div>
                <hr/>
                <div className="form-row mt-4 justify-content-center">
                    <div className="col-12 col-md-4 col-lg-3 mb-5">
                        <button className="btn btn-danger btn-block" onClick={this.handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Admin;