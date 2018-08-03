import React from 'react';

const PLAYER_ROLE = {
    goalkeeper: 'Portiere',
    defender: 'Difensore',
    midfielder: 'Centrocampista',
    forward: 'Attaccante'
};

class PlayerStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            offerField: false
        }
    }

    render() {
        const { playerData } = this.props;

        return (
            <table className="table table-dark table-hover text-center mb-5">
                <tbody>
                    <tr>
                        <th>
                            Player:
                        </th>
                        <td>
                            {playerData.player}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            Role:
                        </th>
                        <td>
                            {PLAYER_ROLE[playerData.role]}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            Team:
                        </th>
                        <td>
                            {playerData.team}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            Current Offer:
                        </th>
                        <td>
                            {playerData.currentOffer}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            Current Owner:
                        </th>
                        <td>
                            {playerData.currentOwner ? playerData.currentOwner.username : ''}
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}

export default PlayerStatus;