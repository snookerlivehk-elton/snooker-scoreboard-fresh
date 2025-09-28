import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Login from './Login';
import Scoreboard from './Scoreboard';
import Setup from './Setup';
import { State } from './lib/State';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState(() => {
    const savedState = localStorage.getItem('gameState');
    return savedState ? State.fromJSON(JSON.parse(savedState)) : new State();
  });
  const [currentView, setCurrentView] = useState<'setup' | 'scoreboard'>('setup');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState.toJSON()));
  }, [gameState]);

  const updateGameState = (updateFn: (state: State) => void) => {
    setGameState(prev => {
      const next = prev.clone();
      updateFn(next);
      return next;
    });
  };

  const handleStart = (
    players: { name: string; shortName: string; handicap: number }[],
    settings: { matchName: string; redBalls: number; framesRequired: number },
    startingPlayerIndex: number
  ) => {
    const newGame = new State(players, settings, startingPlayerIndex);
    setGameState(newGame);
    setCurrentView('scoreboard');
  };

  const handleNextFrame = () => {
    updateGameState(state => {
      state.startNextFrame();
    });
  };

  const handlePot = (ballValue: number) => updateGameState(state => state.pot(ballValue));
  const handleToggleFreeBall = () => updateGameState(state => state.toggleFreeBall());
  const handleFoul = (points: number) => updateGameState(state => state.foul(points));
  const handleSwitchPlayer = () => updateGameState(state => state.switchPlayer());
  const handleMiss = () => updateGameState(state => state.miss());
  const handleSafe = () => updateGameState(state => state.safe());
  const handleConcede = () => updateGameState(state => state.concedeFrame());
  const handleUndo = () => updateGameState(state => state.undo());
  const handleTick = () => updateGameState(state => state.tick());

  const handleEndMatch = () => {
    setCurrentView('setup');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentView('setup'); // Reset view on logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Welcome, {user.email}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
      {currentView === 'setup' ? (
        <Setup onStartMatch={handleStart} />
      ) : (
        <Scoreboard
          state={gameState}
          onPot={handlePot}
          onFoul={handleFoul}
          onMiss={handleMiss}
          onSafe={handleSafe}
          onConcede={handleConcede}
          onNextFrame={handleNextFrame}
          onToggleFreeBall={handleToggleFreeBall}
          onSwitchPlayer={handleSwitchPlayer}
          onUndo={handleUndo}
          onTick={handleTick}
          onEndMatch={handleEndMatch} // Pass the new handler
        />
      )}
    </>
  );
};

export default App;