import React, {Component} from 'react';
import SocketIoClient from 'socket.io-client';
import { getToken } from '../utils/localStorageUtils';
import config from '../config/config';
import Button from "./Button";
import Timer from "./Timer";
import PlayerStatus from "./PlayerStatus";
import Offer from "./Offer";
import UserPlayers from "./UserPlayers";

const SOCKET_PATH = config.serverPath;
const USE_REAL_BUTTON = config.useRealButton;

class Console extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userToken: getToken(props.username),
            currentPlayer: '',
            showTimer: false,
            time: 5,
            buttonDisabled: true,
            playerOffer: 0,
            showOfferForm: false,
            infoMessage: false,
            offerError: null,
            wallet: 0,
            userPlayers: {},
            typeInfoMessage: '',
        };
        this.initSocketClient(this.state.userToken);

        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleChangeOffer = this.handleChangeOffer.bind(this);
        this.handleSubmitOffer = this.handleSubmitOffer.bind(this);
        this.updateStatusAfterReserve = this.updateStatusAfterReserve.bind(this);
    }

    componentDidMount() {
        this.updateStatusAfterReserve();

        this.socketClient.on('message', message => {
            console.log(message);
        });

        this.socketClient.on('currentPlayer', message => {
            this.setState({
                currentPlayer: message.value
            })
        });

        this.socketClient.on('initAuction', message => {
            this.setState({
                buttonDisabled: false,
                infoMessage: false,
            })
        });

        this.socketClient.on('timer', message => {
            this.setState({
                time: message.value,
                showTimer: true,
                showOfferForm: false,
                buttonDisabled: false,
                infoMessage: false
            })
        });

        this.socketClient.on('playerOffer', message => {
            this.setState({
                buttonDisabled: message.value.value,
                infoMessage: message.value.user.username + ' is typing is offer',
                playerOffer: this.state.currentPlayer.currentOffer + 1,
                typeInfoMessage: '',
            })
        });

        this.socketClient.on('playerTyping', message => {
            this.setState({
                playerOffer: message.value
            })
        });

        this.socketClient.on('resetOffer', message => {
            this.setState({
                buttonDisabled: false,
                showTimer: false,
                showOfferForm: false,
                infoMessage: false
            })
        });

        this.socketClient.on('playerReserved', message => {
            let player = message.value.player;
            let user = message.value.user;
            this.setState({
                infoMessage: player.player + " bought by " + user.username,
                currentPlayer: '',
                showTimer: false,
                showOfferForm: false,
                buttonDisabled: true,
                typeInfoMessage: 'text-success',
            });
            this.updateStatusAfterReserve();
        });

        this.socketClient.on('buttonPressed', message => {
            let button = parseInt(message.value.button);
            const userButton = parseInt(this.props.buttonCode);
            if (button === userButton) {
                this.handleButtonClick();
            }
        })
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

    handleButtonClick = (event = undefined) => {
        if (event) {
            event.preventDefault();
        }
        const path = SOCKET_PATH + '/auction/player/offer';
        const api_headers = new Headers();
        const token = getToken(this.props.username);
        api_headers.append('Accept', 'application/json');
        api_headers.append('Content-Type', 'application/json');
        api_headers.append('Authorization', `Bearer ${token}`);
        fetch(path, {
            method: 'POST',
            headers: api_headers,
            body: JSON.stringify({
                user: this.props.username,
            }),
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
                this.setState({
                    showOfferForm: true,
                });
            })
            .catch(err => console.log(err));
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
        const { playerOffer, currentPlayer, wallet } = this.state;
        let offer = playerOffer.toString().replace(',', '.');
        if (offer && !isNaN(offer)) {
            if (offer > wallet) {
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
                            user: this.props.username,
                            offer: offer
                        }),
                    })
                        .then(result => {
                            if (result.status === 200) {
                                return result.json();
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

    updateStatusAfterReserve = () => {
        const path = SOCKET_PATH + '/users/' + this.props.username + '/all';
        const api_headers = new Headers();
        const token = getToken(this.props.username);
        api_headers.append('Accept', 'application/json');
        api_headers.append('Content-Type', 'application/json');
        api_headers.append('Authorization', `Bearer ${token}`);
        fetch(path, {
            method: 'GET',
            headers: api_headers,
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
                this.setState({
                    wallet: result.user.wallet,
                    userPlayers: result.players
                })
            })
            .catch(err => console.log(err));
    };

    handleLogout = (event) => {
        event.preventDefault();
        this.socketClient.disconnect();
        this.props.handleLogout(event);
    };

    render() {
        const { username, buttonCode } = this.props;
        //console.log(getToken(username));

        return (
            <div tabIndex={0}>
                <div className={'gui-wrapper'}>
                    <h1 className="text-center text-sm-left">
                        <span className="username">{username}</span>
                    </h1>
                    <hr/>
                    <h5 className="text-center text-sm-left d-inline-block">Wallet: {this.state.wallet}</h5>
                    <h5 className="text-center text-sm-left d-inline-block ml-3">Button: {buttonCode}</h5>
                    <hr/>
                    <div className="row mt-4 justify-content-center">
                        <div className="col-12 col-md-8 order-md-12 mb-4 mb-md-0">
                            {this.state.infoMessage ? <p className={this.state.typeInfoMessage + " player-wrapper player-reserved text-center"}>{this.state.infoMessage}</p> : ''}
                            {this.state.showTimer ? <Timer time={this.state.time}/> : ''}
                            {this.state.showOfferForm ?
                                <Offer
                                    offer={this.state.playerOffer}
                                    handleChange={this.handleChangeOffer}
                                    handleSubmit={this.handleSubmitOffer}
                                    errors={this.state.offerError}
                                />
                                :
                                !USE_REAL_BUTTON ?
                                this.state.wallet > 0
                                    ? <Button disabled={this.state.buttonDisabled} handleClick={this.handleButtonClick}/>
                                    : <p className="player-wrapper player-reserved text-center">Your money are finished</p>
                                : this.state.buttonDisabled
                                    ? <p className="player-wrapper player-reserved text-center">Button is disabled</p>
                                    : <p className="player-wrapper player-reserved text-center text-success">Button is enabled</p>
                            }
                        </div>
                    </div>
                    <div className="row mt-4 justify-content-center">
                        <div className="col-12 col-md-8">
                            <p className="player-wrapper text-center">
                                Current player:
                            </p>
                            {this.state.currentPlayer !== '' ? <PlayerStatus playerData={this.state.currentPlayer}/> : ''}
                        </div>
                    </div>
                    <hr/>
                    <div className="row mt-4 justify-content-center">
                        <div className="col-12 col-md-8">
                            <UserPlayers userPlayers={this.state.userPlayers}/>
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

