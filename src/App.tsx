import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Scoreboard from './Scoreboard';
import Setup from './Setup';
import { State } from './lib/State';

const App: React.FC = () => {
  // Initialize with a default state
  const [gameState, setGameState] = useState(new State());

  // This is a simple way to force a re-render when the state object is mutated.
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(tick => tick + 1);

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState.status === 'playing') {
        gameState.timers.matchTime++;
        gameState.timers.frameTime++;
        if (gameState.breakScore > 0) {
          gameState.breakTime++;
        }
        forceUpdate();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const handlePot = (ballValue: number) => {
    gameState.pot(ballValue);
    forceUpdate();
  };

  const handleToggleFreeBall = () => {
    gameState.toggleFreeBall();
    forceUpdate();
  };

  const handleFoul = (penalty: number) => {
    gameState.foul(penalty);
    forceUpdate();
  };

  const handleSwitchPlayer = () => {
    gameState.switchPlayer();
    forceUpdate();
  };

  const handleMiss = () => {
    gameState.miss();
    forceUpdate();
  };

  const handleSafe = () => {
    gameState.safe();
    forceUpdate();
  };

  const handleConcede = () => {
    gameState.concedeFrame();
    forceUpdate();
  };

  const handleNewFrame = () => {
    gameState.newFrame();
    forceUpdate();
  };

  const handleUndo = () => {
    gameState.undo();
    forceUpdate();
  };

  return (
    <Routes>
      <Route path="/" element={<Scoreboard gameState={gameState} onPot={handlePot} onToggleFreeBall={handleToggleFreeBall} onFoul={handleFoul} onSwitchPlayer={handleSwitchPlayer} onMiss={handleMiss} onSafe={handleSafe} onNewFrame={handleNewFrame} onConcede={handleConcede} onUndo={handleUndo} />} />
      <Route path="/setup" element={<Setup setGameState={setGameState} />} />
    </Routes>
  );
};

export default App;