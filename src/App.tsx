import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Scoreboard from './Scoreboard';
import Setup from './Setup';
import { State } from './lib/State';

const App: React.FC = () => {
  const [gameState, setGameState] = useState(() => new State());

  const handlePot = (ballValue: number) => {
    setGameState(prev => {
      const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      newState.pot(ballValue);
      return newState;
    });
  };

  const handleToggleFreeBall = () => {
    setGameState(prev => {
      const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      newState.toggleFreeBall();
      return newState;
    });
  };

  const handleFoul = (penalty: number) => {
    setGameState(prev => {
      const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      newState.foul(penalty);
      return newState;
    });
  };

  const handleSwitchPlayer = () => {
    setGameState(prev => {
      const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      newState.switchPlayer();
      return newState;
    });
  };

  const handleMiss = () => {
    setGameState(prev => {
      const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      newState.miss();
      return newState;
    });
  };

  const handleSafe = () => {
    setGameState(prev => {
      const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      newState.safe();
      return newState;
    });
  };

  const handleConcede = () => {
    setGameState(prev => {
      const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      newState.concedeFrame();
      return newState;
    });
  };

  const handleNewFrame = () => {
    setGameState(prev => {
      const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      newState.newFrame();
      return newState;
    });
  };

  const handleUndo = () => {
    setGameState(prev => {
      const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      newState.undo();
      return newState;
    });
  };

  const handleTick = () => {
    setGameState(prev => {
        const newState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev)
        newState.tick();
        return newState;
    });
  };

  return (
    <Routes>
      <Route path="/" element={<Scoreboard gameState={gameState} onPot={handlePot} onToggleFreeBall={handleToggleFreeBall} onFoul={handleFoul} onSwitchPlayer={handleSwitchPlayer} onMiss={handleMiss} onSafe={handleSafe} onNewFrame={handleNewFrame} onConcede={handleConcede} onUndo={handleUndo} onTick={handleTick} />} />
      <Route path="/setup" element={<Setup setGameState={setGameState} />} />
    </Routes>
  );
};

export default App;