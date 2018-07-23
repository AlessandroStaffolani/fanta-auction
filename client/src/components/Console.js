import React, {Component} from 'react';
import '../components-styles/console.css';
import { getToken } from '../utils/localStorageUtils';
import Loading from './Loading';

const API_PATH = 'http://localhost:5000/connection/';

class Console extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: undefined
        }
    }

    componentDidMount() {
        const token = getToken();
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${token}`);

        const connectionError = (error) => {
            console.log(error);
            this.setState({
                connected: false
            })
        };

        fetch(API_PATH + 'init', {
            method: 'POST',
            headers: headers,
            body: {},
        })
            .then(result => {
                console.log(result);
                if (result.status === 200) {
                    return result.json();
                } else {
                    connectionError(result);
                }
            })
            .then(result => {
                this.setState({
                    connected: true
                })
            })
            .catch(err => connectionError(err));
    }

    render() {
        const { connected } = this.state;
        let content = <h3>Console content</h3>;
        if (connected === undefined) {
            content = <Loading/>
        } else if (connected) {
            content = <h3>Console content</h3>;
        } else {
            content = <h3>Error on connection</h3>
        }

        return (
            <div tabIndex={0}>
                <div className={'gui-wrapper'}>
                    <h1>Console</h1>
                    {content}
                </div>
            </div>
        )
    }
}

export default Console;

