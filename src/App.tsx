import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Scoreboard from './Scoreboard';
import Setup from './Setup';
import { State } from './lib/State';
import { Player } from './lib/Player';

const App: React.FC = () => {
  const [gameState, setGameState] = useState(() => new State());

  const updateGameState = (updateFn: (state: State) => void) => {
    setGameState(prev => {
      const plainState = JSON.parse(JSON.stringify(prev));
      const newState = new State();
      Object.assign(newState, plainState);
      newState.players = plainState.players.map((p: any) => {
        const player = new Player(p.name, p.shortName, p.handicap);
        Object.assign(player, p);
        return player;
      });
      updateFn(newState);
      return newState;
    });
  };

  const handlePot = (ballValue: number) => updateGameState(state => state.pot(ballValue));
  const handleToggleFreeBall = () => updateGameState(state => state.toggleFreeBall());
  const handleFoul = (penalty: number) => updateGameState(state => state.foul(penalty));
  const handleSwitchPlayer = () => updateGameState(state => state.switchPlayer());
  const handleMiss = () => updateGameState(state => state.miss());
  const handleSafe = () => updateGameState(state => state.safe());
  const handleConcede = () => updateGameState(state => state.concedeFrame());
  const handleNewFrame = () => updateGameState(state => state.startNextFrame());
  const handleUndo = () => updateGameState(state => state.undo());
  const handleTick = () => updateGameState(state => state.tick());

  const handleStartMatch = (players: { name: string, shortName: string, handicap: number }[], settings: { matchName: string, redBalls: number, framesRequired: number }, startingPlayerIndex: number) => {
    setGameState(new State(players, settings, startingPlayerIndex));
  };

  return (
    <Routes>
      <Route path="/" element={<Scoreboard gameState={gameState} onPot={handlePot} onToggleFreeBall={handleToggleFreeBall} onFoul={handleFoul} onSwitchPlayer={handleSwitchPlayer} onMiss={handleMiss} onSafe={handleSafe} onNewFrame={handleNewFrame} onConcede={handleConcede} onUndo={handleUndo} onTick={handleTick} />} />
      <Route path="/setup" element={<Setup onStartMatch={handleStartMatch} />} />
    </Routes>
  );
};

export default App;