import React from 'react';

class TablePlayers extends React.Component {

    render() {
        const { role, players } = this.props;

        return (
            <div className="table-responsive">
                <table className="table table-dark table-hover text-center table-with-caption">
                    <caption>{role}</caption>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Team</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((item, index) =>
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.player}</td>
                                <td>{item.team}</td>
                                <td>{item.finalOffer}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default TablePlayers;