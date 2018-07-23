import React, {Component} from 'react';
import '../components-styles/console.css';
import { getToken } from '../utils/localStorageUtils';

const API_HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

const API_PATH = 'http://localhost:5000/robot/command/';

class Console extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div tabIndex={0}>
                <div className={'gui-wrapper'}>
                    <h1>Console</h1>
                </div>
            </div>
        )
    }
}

export default Console;

