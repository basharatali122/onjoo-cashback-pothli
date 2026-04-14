import { createContext, useContext, useState, useCallback } from 'react';
import { GAMES, DEFAULT_GAME_ID, getGame } from '../gameConfig';

const GameContext = createContext(null);
const STORAGE_KEY = '_claimer_game';

export function GameProvider({ children }) {
  const [gameId, setGameIdState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_GAME_ID
  );

  const setGame = useCallback((id) => {
    if (!GAMES.find(g => g.id === id)) return;
    localStorage.setItem(STORAGE_KEY, id);
    setGameIdState(id);
  }, []);

  const game = getGame(gameId);

  return (
    <GameContext.Provider value={{ game, gameId, setGame, games: GAMES }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}
