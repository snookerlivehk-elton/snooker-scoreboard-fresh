import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { State } from './lib/State';

interface ScoreboardProps {
    gameState: State;
    onPot: (ballValue: number) => void;
    onToggleFreeBall: () => void;
    onFoul: (penalty: number) => void;
    onSwitchPlayer: () => void;
    onMiss: () => void;
    onSafe: () => void;
    onNewFrame: () => void;
    onConcede: () => void;
    onUndo: () => void;
    onTick: () => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ gameState, onPot, onToggleFreeBall, onFoul, onSwitchPlayer, onMiss, onSafe, onNewFrame, onConcede, onUndo, onTick }) => {
    const { players, currentPlayerIndex, redsRemaining, pottedColors, breakScore, mustPotRed, isFreeBall, timers, settings, isFrameOver, isMatchOver, isClearingColours, breakTime } = gameState;
    const [player1, player2] = players;
    const [isFoulMode, setIsFoulMode] = useState(false);

    useEffect(() => {
        const timerId = setInterval(onTick, 1000);
        return () => clearInterval(timerId);
    }, [onTick]);

    // Use the onPot from props
    const handlePot = (ballValue: number) => {
        onPot(ballValue);
    };

    const handleFoulClick = () => {
        setIsFoulMode(true);
    };

    const handlePenalty = (penalty: number) => {
        onFoul(penalty);
        setIsFoulMode(false);
    };

    const isColorBallDisabled = (ballValue: number) => {
        if (mustPotRed) return true;
        if (isClearingColours) {
            const expectedSequence = [2, 3, 4, 5, 6, 7];
            const nextBallInSequence = expectedSequence[pottedColors.length];
            return ballValue !== nextBallInSequence;
        }
        return pottedColors.includes(ballValue);
    };

    const handleSwitchPlayer = () => {
        onSwitchPlayer();
    };
    const handleEndMatch = () => console.log('End Match');
    const handleConcede = () => {
        if (window.confirm('Are you sure you want to concede the frame?')) {
            onConcede();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const getAhead = () => {
        const p1 = players[0];
        const p2 = players[1];

        if (p1.score === p2.score) {
            return 'Scores are level';
        }

        const [aheadPlayer, behindPlayer] = p1.score > p2.score ? [p1, p2] : [p2, p1];
        const diff = aheadPlayer.score - behindPlayer.score;

        return `${aheadPlayer.name} is ${diff} ahead.`;
    }

    const getWinner = () => {
        if (!isFrameOver) return null;

        // In a respot black scenario, the winner is determined by who has more frames,
        // as the foul logic already awarded the frame.
        if (gameState.isRespotBlack) {
            if (player1.frames > player2.frames) return player1.name;
            if (player2.frames > player1.frames) return player2.name;
        }

        if (player1.score > player2.score) return player1.name;
        if (player2.score > player1.score) return player2.name;
        return "It's a tie!";
    };

    const getMatchWinner = () => {
        if (!isMatchOver) return null;
        const winner = players.find(p => p.frames === settings.framesRequired);
        return winner ? winner.name : 'Unknown';
    };

    return (
        <div className="scoreboard-container vertical-layout">
            {isMatchOver && (
                <div className="frame-over-overlay">
                    <h2>Match Over</h2>
                    <h3>Winner: {getMatchWinner()}</h3>
                    <Link to="/setup" className="button">New Match</Link>
                </div>
            )}
            {isFrameOver && !isMatchOver && (
                <div className="frame-over-overlay">
                    <h2>Frame Over</h2>
                    <h3>Winner: {getWinner()}</h3>
                    <button onClick={onNewFrame}>New Frame</button>
                </div>
            )}
            {/* Top Area */}
            <div className="top-area">
                <div className="match-name-display">
                    {gameState.settings.matchName}
                </div>
                <div className="score-display">
                    <span className={`player-score ${currentPlayerIndex === 0 ? 'active' : ''}`}>
                        {player1.score}
                    </span>
                    <span className="frame-scores">{player1.frames} ({settings.framesRequired}) {player2.frames}</span>
                    <span className={`player-score ${currentPlayerIndex === 1 ? 'active' : ''}`}>
                        {player2.score}
                    </span>
                </div>
                <div className='info-bar'>
                    <span>Break: {breakScore}</span>
                    <span>{getAhead()}</span>
                    <span>Remaining: {gameState.getRemainingPoints()}</span>
                </div>
            </div>

            {/* Center Control Area */}
            <div className="center-control-area">
                {isFoulMode ? (
                    <div className="penalty-buttons">
                        <button onClick={() => handlePenalty(4)}>4</button>
                        <button onClick={() => handlePenalty(5)}>5</button>
                        <button onClick={() => handlePenalty(6)}>6</button>
                        <button onClick={() => handlePenalty(7)}>7</button>
                        <button onClick={() => setIsFoulMode(false)}>Cancel</button>
                    </div>
                ) : (
                    <>
                        <div className="button-row">
                            <button className={`ball-button ball-1 ${redsRemaining === 0 ? 'potted' : ''}`} onClick={() => handlePot(1)} disabled={!mustPotRed && redsRemaining > 0}>Red</button>
                            <button className={`ball-button ball-2 ${pottedColors.includes(2) ? 'potted' : ''}`} onClick={() => handlePot(2)} disabled={isColorBallDisabled(2)}>2</button>
                            <button className={`ball-button ball-3 ${pottedColors.includes(3) ? 'potted' : ''}`} onClick={() => handlePot(3)} disabled={isColorBallDisabled(3)}>3</button>
                            <button className={`ball-button ball-4 ${pottedColors.includes(4) ? 'potted' : ''}`} onClick={() => handlePot(4)} disabled={isColorBallDisabled(4)}>4</button>
                        </div>
                        <div className="button-row">
                            <button className="ball-button ball-white" onClick={handleFoulClick}>Foul</button>
                            <button className={`ball-button ball-5 ${pottedColors.includes(5) ? 'potted' : ''}`} onClick={() => handlePot(5)} disabled={isColorBallDisabled(5)}>5</button>
                            <button className={`ball-button ball-6 ${pottedColors.includes(6) ? 'potted' : ''}`} onClick={() => handlePot(6)} disabled={isColorBallDisabled(6)}>6</button>
                            <button className={`ball-button ball-7 ${pottedColors.includes(7) ? 'potted' : ''}`} onClick={() => handlePot(7)} disabled={isColorBallDisabled(7)}>7</button>
                        </div>
                        <div className="action-buttons">
                            <button onClick={onToggleFreeBall} className={isFreeBall ? 'active' : ''}>Free Ball</button>
                            <button onClick={handleConcede}>Concede</button>
                            <button onClick={handleEndMatch}>End Match</button>
                        </div>
                        <div className="action-buttons">
                            <button onClick={onMiss}>Miss</button>
                            <button onClick={onSafe}>Safe</button>
                            <button onClick={handleSwitchPlayer}>Switch Player</button>
                        </div>
                        <div className="side-by-side-buttons">
                            <Link to="/setup" className="button">Setup</Link>
                            <button onClick={onUndo} className="button">Undo</button>
                        </div>
                    </>
                )}
            </div>

            {/* Match Info Display Area */}
            <div className="match-info-area">
                <div className="break-info">
                    <div className="reds-left">Reds Left: {redsRemaining}</div>
                </div>
                <div className="high-breaks-container">
                    <h3>{player1.name} ({player1.shortName})</h3>
                    <div className="high-breaks">
                        <h3>P1 High Breaks</h3>
                        <ul>
                            {player1.highBreaks.map((br, i) => <li key={i}>{br.score} ({formatTime(br.time)})</li>)}
                        </ul>
                    </div>
                    <div className="high-breaks">
                        <h3>{player2.name} ({player2.shortName})</h3>
                        <h3>P2 High Breaks</h3>
                        <ul>
                            {player2.highBreaks.map((br, i) => <li key={i}>{br.score} ({formatTime(br.time)})</li>)}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Stats Display Area */}
            <div className="stats-area">
                <div className="player-stats">
                    <span>{player1.name}</span>
                    <span>Misses: {player1.misses}</span>
                    <span>Safeties: {player1.safeties}</span>
                    <span>Fouls: {player1.fouls}</span>
                </div>
                <div className="player-stats">
                    <span>{player2.name}</span>
                    <span>Misses: {player2.misses}</span>
                    <span>Safeties: {player2.safeties}</span>
                    <span>Fouls: {player2.fouls}</span>
                </div>
            </div>

            {/* Bottom Control Area */}
            <div className="bottom-control-area">

                <div className="timers">
                    <div>Frame: {formatTime(timers.frameTime)}</div>
                    <div>Match: {formatTime(timers.matchTime)}</div>
                    <div>Break: {formatTime(breakTime)}</div>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;