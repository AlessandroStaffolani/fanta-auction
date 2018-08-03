import React from 'react';
import { getToken } from '../utils/localStorageUtils';
import config from "../config/config";
import SocketIoClient from "socket.io-client";
import Timer from './Timer';
import { readInputFile, reformatCsvData } from '../utils/csvUtility';
import Papa from "papaparse";
import PlayerStatus from "./PlayerStatus";
import Offer from "./Offer";

const SOCKET_PATH = config.serverPath;

const PLAYER_ROLE = [
    {
        code: 'goalkeeper',
        label: 'Portieri'
    },
    {
        code: 'defender',
        label: 'Difensori'
    },
    {
        code: 'midfielder',
        label: 'Centrocampisti'
    },
    {
        code: 'forward',
        label: 'Attaccanti'
    }
];

const CSV_OPTIONS = {
    delimiter: ";",
};

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showTimer: false,
            time: 5,
            adminToken: getToken(props.username),
            playerRole: 'default',
            currentPlayer: false,
            playersConnected: [],
            file: null,
            fileLabel: 'Load player file',
            playerRoleLoad: 'default',
            fileFormValid: true,
            loadSuccess: false,
            playerRoleClass: 'custom-select my-2',
            infoMessage: false,
            showPlayerOffer: false,
            playerOffer: 0,
            userTyping: null,
            offerError: null,
            noMorePlayer: false,
        };

        this.initSocketClient(this.state.adminToken);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitNextPlayer = this.handleSubmitNextPlayer.bind(this);
        this.handleInitClick = this.handleInitClick.bind(this);
        this.handleResetButton = this.handleResetButton.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleLoadClick = this.handleLoadClick.bind(this);
        this.handleChangeOffer = this.handleChangeOffer.bind(this);
        this.handleSubmitOffer = this.handleSubmitOffer.bind(this);
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
        //this.handleResetButton(undefined, 'reset');

        this.socketClient.on('initAuction', message => {
            this.setState({
                infoMessage: message.value
            })
        });

        this.socketClient.on('playerConnected', players => {
            this.setState({
                playersConnected: players.value
            })
        });

        this.socketClient.on('currentPlayer', player => {
            this.setState({
                currentPlayer: player.value
            })
        });

        this.socketClient.on('playerOffer', message => {
            this.setState({
                showPlayerOffer: message.value.value,
                showTimer: false,
                infoMessage: message.value.user.username + ' is typing is offer',
                userTyping: message.value.user,
                playerOffer: this.state.currentPlayer.currentOffer + 1
            })
        });

        this.socketClient.on('playerTyping', message => {
            this.setState({
                playerOffer: message.value
            })
        });

        this.socketClient.on('playerReserved', message => {
            let player = message.value.player;
            let user = message.value.user;
            this.setState({
                infoMessage: player.player + " bought by " + user.username,
                currentPlayer: false,
                showTimer: false,
                showPlayerOffer: false
            })
        });

        this.socketClient.on('timer', message => {
            this.setState({
                time: message.value,
                showTimer: true,
                infoMessage: false,
                showPlayerOffer: false
            })
        });

        this.socketClient.on('resetOffer', message => {
            this.setState({
                showTimer: false,
                infoMessage: message.value,
                showPlayerOffer: false
            })
        });
    }

    handleChange = (event, filed) => {
        event.preventDefault();
        let obj = {};
        obj[filed] = event.target.value;
        obj['fileFormValid'] = true;
        obj['playerRoleClass'] = 'custom-select my-2';
        this.setState(obj);
    };

    handleSubmitNextPlayer = (event) => {
        event.preventDefault();
        const { playerRole } = this.state;

        if (playerRole === 'default') {
            this.setState({
                playerRoleClass: 'custom-select my-2 with-error',
                noMorePlayer: 'Select a role'
            })
        } else {
            const path = SOCKET_PATH + '/admin/player/next';
            const api_headers = new Headers();
            const token = getToken(this.props.username);
            api_headers.append('Accept', 'application/json');
            api_headers.append('Content-Type', 'application/json');
            api_headers.append('Authorization', `Bearer ${token}`);
            fetch(path, {
                method: 'POST',
                headers: api_headers,
                body: JSON.stringify({playerRole: playerRole}),
            })
                .then(result => {
                    if (result.status === 200) {
                        return result.json();
                    } else {
                        return result.error();
                    }
                })
                .then(result => {
                    console.log(result);
                    if (result.currentPlayer === null) {
                        this.setState({
                            playerRoleClass: 'custom-select my-2',
                            noMorePlayer: 'No more player for this role'
                        })
                    } else {
                        this.setState({
                            playerRoleClass: 'custom-select my-2',
                            noMorePlayer: false
                        })
                    }
                })
                .catch(err => console.log(err));
        }
    };

    handleInitClick = (event) => {
        event.preventDefault();
        const { playerRole, currentPlayer } = this.state;

        if (playerRole === 'default' || !currentPlayer) {
            this.setState({
                playerRoleClass: 'custom-select my-2 with-error'
            })
        } else {
            const path = SOCKET_PATH + '/admin/auction/init';
            const api_headers = new Headers();
            const token = getToken(this.props.username);
            api_headers.append('Accept', 'application/json');
            api_headers.append('Content-Type', 'application/json');
            api_headers.append('Authorization', `Bearer ${token}`);
            fetch(path, {
                method: 'POST',
                headers: api_headers,
                body: JSON.stringify({playerRole: this.props.username}),
            })
                .then(result => console.log(result))
                .catch(err => console.log(err));
        }
    };

    handleResetButton = (event, type) => {
        if (event) {
            event.preventDefault();
        }
        const path = SOCKET_PATH + '/admin/timer/reset';
        const api_headers = new Headers();
        const token = getToken(this.props.username);
        api_headers.append('Accept', 'application/json');
        api_headers.append('Content-Type', 'application/json');
        api_headers.append('Authorization', `Bearer ${token}`);
        fetch(path, {
            method: 'POST',
            headers: api_headers,
            body: JSON.stringify({username: this.props.username}),
        })
            .then(result => {
                if (result.status === 200) {
                    return result.json();
                } else {
                    console.log(result);
                }
            })
            .then(result => {
                console.log(result);
            })
            .catch(err => console.log(err));
    };

    handleFileInput = (event) => {
        event.preventDefault();
        let file = event.target.files[0];

        this.setState({
            fileLabel: file.name,
            file: file,
            fileFormValid: true
        });
    };

    handleLoadClick = (event) => {
        event.preventDefault();
        const { file, playerRoleLoad } = this.state;

        let csvData = undefined;

        if (file === null || playerRoleLoad === 'default') {
            this.setState({
                fileFormValid: false
            })
        } else {
            readInputFile(file)
                .then((csv) => {
                    csvData = Papa.parse(csv, CSV_OPTIONS);
                    csvData = reformatCsvData(csvData.data, playerRoleLoad);

                    const path = SOCKET_PATH + '/admin/player/load';
                    const api_headers = new Headers();
                    const token = getToken(this.props.username);
                    api_headers.append('Accept', 'application/json');
                    api_headers.append('Content-Type', 'application/json');
                    api_headers.append('Authorization', `Bearer ${token}`);
                    fetch(path, {
                        method: 'POST',
                        headers: api_headers,
                        body: JSON.stringify({playersData: csvData}),
                    })
                        .then(result => {
                            if (result.status === 200) {
                                return result.json();
                            } else {
                                return result.error();
                            }
                        })
                        .then(result => {
                            console.log(result);
                            if (result.playersSaved) {
                                this.setState({
                                    loadSuccess: "Player load success"
                                });
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            this.setState({
                                loadSuccess: "Player load failed"
                            });
                        });
                })
        }
    };

    handleChangeOffer = (event) => {
        event.preventDefault();
        const offerValue = event.target.value;
        this.socketClient.emit('playerTyping', {value: offerValue});
        this.setState({
            playerOffer: offerValue,
            offerError: null
        });
    };

    handleSubmitOffer = (event) => {
        event.preventDefault();
        const { playerOffer, currentPlayer, userTyping } = this.state;
        let offer = playerOffer.toString().replace(',', '.');
        if (offer && !isNaN(offer)) {
            if (offer > userTyping.wallet) {
                this.setState({
                    offerError: 'You haven\'t enough money'
                });
            } else {
                if (offer <= currentPlayer.currentOffer) {
                    this.setState({
                        offerError: 'Current offer is higher'
                    });
                } else {
                    this.setState({
                        offerError: null
                    });
                    const path = SOCKET_PATH + '/auction/reserve/' + currentPlayer._id;
                    const api_headers = new Headers();
                    const token = getToken(this.props.username);
                    api_headers.append('Accept', 'application/json');
                    api_headers.append('Content-Type', 'application/json');
                    api_headers.append('Authorization', `Bearer ${token}`);
                    fetch(path, {
                        method: 'POST',
                        headers: api_headers,
                        body: JSON.stringify({
                            user: this.state.userTyping.username,
                            offer: offer
                        }),
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
                }
            }
        } else {
            this.setState({
                offerError: 'Insert a number'
            })
        }
    };

    handleLogout = (event) => {
        event.preventDefault();
        this.socketClient.disconnect();
        this.props.handleLogout(event);
    };

    render() {
        const { username } = this.props;

        return (
            <div className="admin-wrapper">
                <h1 className="text-center text-sm-left">
                    <span className="username">{username}</span>
                </h1>
                {this.state.infoMessage || this.state.showTimer || this.state.currentPlayer ? <hr/> : ''}
                <div className="form-row my-4 justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8 text-center">
                        {this.state.infoMessage ? <h2 className="player-reserved">{this.state.infoMessage}</h2> : ''}
                        {this.state.showTimer ? <Timer time={this.state.time}/> :
                            this.state.showPlayerOffer ? <Offer
                                offer={this.state.playerOffer}
                                handleChange={this.handleChangeOffer}
                                handleSubmit={this.handleSubmitOffer}
                                errors={this.state.offerError}
                            /> : ''
                        }
                        {this.state.currentPlayer ?
                            <div>
                                <h3>Current Player</h3>
                                <PlayerStatus playerData={this.state.currentPlayer}/>
                            </div>
                            : ''}

                    </div>
                </div>
                <hr/>
                <div className="form-row my-4 justify-content-between">
                    <div className="col-12 col-md-6">
                        <div className="form-row justify-content-center">
                            <div className="col-12 col-md-8 col-lg-6">
                                <button
                                    className="btn btn-success btn-block my-2"
                                    onClick={this.handleInitClick}
                                >
                                    Init
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-row justify-content-center">
                            <div className="col-12 col-md-8 col-lg-6">
                                <button
                                    className="btn btn-danger btn-block my-2"
                                    onClick={event => this.handleResetButton(event, 'reset')}
                                >
                                    Reset typing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                <form onSubmit={this.handleSubmitNextPlayer}>
                    <div className="form-row my-4 align-items-center justify-content-between">
                        <div className="col-12 col-md-6">
                            <div className="form-row justify-content-center">
                                <div className="col-12 col-md-8 col-lg-6">
                                    <select
                                        value={this.state.playerRole}
                                        onChange={(event) => this.handleChange(event, 'playerRole')}
                                        className={this.state.playerRoleClass}
                                    >
                                        <option value="default">Player role</option>
                                        {PLAYER_ROLE.map((role, index) => <option key={index} value={role.code}>{role.label}</option> )}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="form-row justify-content-center">
                                <div className="col-12 col-md-8 col-lg-6">
                                    <button type="submit" className="btn btn-success btn-block my-2">Next player</button>
                                    {this.state.noMorePlayer ?
                                        <small className="form-help my-2 text-muted with-error">
                                            {this.state.noMorePlayer}
                                        </small>
                                        : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <hr/>
                <div className="form-row my-4 justify-content-between">
                    <div className="col-12 col-md-6 offset-md-3 text-center">
                        <h3>Players connected</h3>
                        <ul>
                            {this.state.playersConnected.map((player, index) =>
                                <li key={index} className="item username">
                                    {player}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <hr/>
                <div className="form-row my-4 align-items-center justify-content-between">
                    <div className="col-12 col-md-6 text-center">
                        <h5>Load players on database</h5>
                    </div>
                    {this.state.loadSuccess ?
                        <div className="col-12 col-md-6 text-center">
                            <h5>{this.state.loadSuccess}</h5>
                        </div>
                        : ''}
                </div>
                <div className="form-row my-4 align-items-center justify-content-between">
                    <div className="col-12 col-md-6">
                        <div className="form-row justify-content-center">
                            <div className="col-12 col-md-8 col-lg-6">
                                <div className="custom-file">
                                    <input type="file" className="custom-file-input my-2" id="playerFile" name="playerFile" accept=".csv" onChange={this.handleFileInput} />
                                    <label className="custom-file-label" htmlFor="playerFile">{this.state.fileLabel}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-row justify-content-center">
                            <div className="col-12 col-md-8 col-lg-6">
                                <select value={this.state.playerRoleLoad} onChange={(event) => this.handleChange(event, 'playerRoleLoad')} className="custom-select my-2">
                                    <option value="default">Player role</option>
                                    {PLAYER_ROLE.map((role, index) => <option key={index} value={role.code}>{role.label}</option> )}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="form-row mt-4 justify-content-center">
                    <div className="col-12 col-md-4 col-lg-3">
                        <small className={this.state.fileFormValid ? 'form-help text-muted my-2' : 'form-help my-2 text-muted with-error'}>
                            Load player from csv and select the player role before load
                        </small>
                    </div>
                    <div className="col-12 col-md-4 col-lg-3 offset-lg-3 offset-md-2">
                        <button className="btn btn-success btn-block my-2" onClick={this.handleLoadClick}>
                            Load
                        </button>
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