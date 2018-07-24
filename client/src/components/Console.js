import React, {Component} from 'react';
import '../components-styles/console.css';
import SocketIoClient from 'socket.io-client';
import { getToken } from '../utils/localStorageUtils';
import config from '../config/config';
import Button from "./Button";

const SOCKET_PATH = config.serverPath;

class Console extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userToken: getToken(),
            socketMessages: [],
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
        const { socketMessages } = this.state;
        this.socketClient.on('message', message => {
            console.log(message);
            socketMessages.push(message.value);
            this.setState({
                socketMessages: socketMessages
            })
        })
    }

    handleButtonClick = (event) => {
        event.preventDefault();
        console.log("Button clicked");
    };

    render() {
        const { username } = this.props;

        return (
            <div tabIndex={0}>
                <div className={'gui-wrapper'}>
                    <h1 className="text-center text-sm-left">Console - <span className="username">{username}</span></h1>
                    <hr/>
                    <div className="row mt-4">
                        <div className="col-12 col-md-8 order-md-12 mb-4 mb-md-0">
                            <Button handleClick={this.handleButtonClick}/>
                        </div>
                        <div className="col-12 col-md-4 order-md-1">
                            <h4 className="text-center text-sm-left">Server messages</h4>
                            <ul>
                                { this.state.socketMessages.map((message, index) =>
                                    <li key={index}>
                                        {message}
                                    </li>
                                ) }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Console;

