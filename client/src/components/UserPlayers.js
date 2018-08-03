import React from 'react';
import TablePlayers from "./TablePlayers";

class UserPlayers extends React.Component {

    render() {
        const { userPlayers } = this.props;

        return (
            <div className="user-players">
                <p className="player-wrapper text-center">
                    Your players:
                </p>
                <TablePlayers role="Portieri" players={userPlayers.goalkeeper ? userPlayers.goalkeeper : [] }/>
                <TablePlayers role="Difensori" players={userPlayers.defender ? userPlayers.defender : []}/>
                <TablePlayers role="Centrocampisti" players={userPlayers.midfielder ? userPlayers.midfielder : []}/>
                <TablePlayers role="Attaccanti" players={userPlayers.forward ? userPlayers.forward : []}/>
            </div>
        )
    }
}

export default UserPlayers;