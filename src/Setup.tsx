import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { State } from './lib/State';

interface SetupProps {
    onStartMatch: (players: { name: string, shortName: string, handicap: number }[], settings: { matchName: string, redBalls: number, framesRequired: number }, startingPlayerIndex: number) => void;
}

const Setup: React.FC<SetupProps> = ({ onStartMatch }) => {
    const navigate = useNavigate();

    const [matchName, setMatchName] = useState('Snooker Match');
    const [p1Name, setP1Name] = useState('Player 1');
    const [p1ShortName, setP1ShortName] = useState('P1');
    const [p1Handicap, setP1Handicap] = useState(0);
    const [p2Name, setP2Name] = useState('Player 2');
    const [p2ShortName, setP2ShortName] = useState('P2');
    const [p2Handicap, setP2Handicap] = useState(0);
    const [redBalls, setRedBalls] = useState(15);
    const [framesRequired, setFramesRequired] = useState(1);
    const [startingPlayerIndex, setStartingPlayerIndex] = useState(0);

    const handleStartMatch = () => {
        const playersInfo = [
            { name: p1Name, shortName: p1ShortName, handicap: p1Handicap },
            { name: p2Name, shortName: p2ShortName, handicap: p2Handicap },
        ];
        const settings = { matchName, redBalls, framesRequired };

        onStartMatch(playersInfo, settings, startingPlayerIndex);
        navigate('/'); // Navigate to the scoreboard
    };

    return (
        <div className="setup-container">
            <h1>Snooker Live HK</h1>
            <h1>New Match</h1>
            <div className="setting-item">
                <label>Match Name:</label>
                <input 
                    type="text" 
                    value={matchName} 
                    onChange={(e) => setMatchName(e.target.value)}
                />
            </div>
            <div className="player-setup">
                <h2>Player 1</h2>
                <div className="input-group">
                    <label>Full Name:</label>
                    <input type="text" value={p1Name} onChange={(e) => setP1Name(e.target.value)} />
                </div>
                <div className="input-group">
                    <label>Member ID:</label>
                    <input type="text" value={p1ShortName} onChange={(e) => setP1ShortName(e.target.value)} />
                </div>
                <div className="input-group">
                    <label>Handicap:</label>
                    <input type="number" value={p1Handicap} onChange={(e) => setP1Handicap(parseInt(e.target.value, 10))} />
                </div>
            </div>
            <div className="player-setup">
                <h2>Player 2</h2>
                <div className="input-group">
                    <label>Full Name:</label>
                    <input type="text" value={p2Name} onChange={(e) => setP2Name(e.target.value)} />
                </div>
                <div className="input-group">
                    <label>Member ID:</label>
                    <input type="text" value={p2ShortName} onChange={(e) => setP2ShortName(e.target.value)} />
                </div>
                <div className="input-group">
                    <label>Handicap:</label>
                    <input type="number" value={p2Handicap} onChange={(e) => setP2Handicap(parseInt(e.target.value, 10))} />
                </div>
            </div>
            <div className="setting-item">
                <label>Number of Reds:</label>
                <div className="reds-options">
                    {[6, 10, 15].map(reds => (
                        <button 
                            key={reds} 
                            className={`button ${redBalls === reds ? 'active' : ''}`}
                            onClick={() => setRedBalls(reds)}
                        >
                            {reds}
                        </button>
                    ))}
                </div>
            </div>
            <div className="setting-item">
                <label>Number of Frames:</label>
                <input 
                    type="number" 
                    value={framesRequired} 
                    onChange={(e) => setFramesRequired(parseInt(e.target.value, 10))}
                />
            </div>
            <div className="setting-item">
                <label>Starting Player:</label>
                <div className="starting-player-options">
                    <button 
                        className={`button ${startingPlayerIndex === 0 ? 'active' : ''}`}
                        onClick={() => setStartingPlayerIndex(0)}
                    >
                        {p1Name}
                    </button>
                    <button 
                        className={`button ${startingPlayerIndex === 1 ? 'active' : ''}`}
                        onClick={() => setStartingPlayerIndex(1)}
                    >
                        {p2Name}
                    </button>
                </div>
            </div>
            <button className="button start-match-button" onClick={handleStartMatch}>Start Match</button>
        </div>
    );
};

export default Setup;