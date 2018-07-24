import React, {Component} from 'react';
import '../components-styles/console.css';
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
            userToken: getToken(),
            currentPlayer: '',
            time: 5,
            buttonDisabled: true,
        };
        if (this.state.userToken) {
            this.socketClient = SocketIoClient(SOCKET_PATH, {
                query: {
                    token: this.state.userToken
                }
            });
        }

        this.handleButtonClick = this.handleButtonClick.bind(this);
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
    }

    handleButtonClick = (event) => {
        event.preventDefault();
        console.log("Button clicked");
    };

    render() {
        const { username } = this.props;
        console.log(getToken());

        return (
            <div tabIndex={0}>
                <div className={'gui-wrapper'}>
                    <h1 className="text-center text-sm-left">
                        <span className="d-none d-md-inline">Console - </span>
                        <span className="username">{username}</span>
                    </h1>
                    <hr/>
                    <div className="row mt-4 justify-content-center">
                        <div className="col-12 col-md-8 order-md-12 mb-4 mb-md-0">
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
                </div>
            </div>
        )
    }
}

export default Console;

