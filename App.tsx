import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppRoute, GameState, PlayerData } from './types';
import { INGREDIENTS, RECIPES } from './constants';
import { Home as HomeIcon, ShoppingBag, Landmark, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db } from './lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import Lobby from './components/Lobby';
import GameHome from './components/Home';
import Shop from './components/Shop';
import Bank from './components/Bank';
import Cookbook from './components/Cookbook';

const DB_PATH = 'sala_v6_final_polimento';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOBBY);
  const [localName, setLocalName] = useState<string>(() => {
    try { return sessionStorage.getItem('local_player_name') || ''; } catch { return ''; }
  });

  const [gameState, setGameState] = useState<GameState>({
      isStarted: false,
      players: [],
      financialLog: []
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const processData = (data: any): GameState => {
    if (!data) return { isStarted: false, players: [], financialLog: [] };
    let safePlayers: PlayerData[] = [];
    if (Array.isArray(data.players)) {
      safePlayers = data.players.filter((p: any) => !!p);
    } else if (typeof data.players === 'object' && data.players !== null) {
      safePlayers = Object.values(data.players);
    }
    safePlayers = safePlayers.map(p => ({
      name: p.name || 'Desconhecido',
      coins: typeof p.coins === 'number' ? p.coins : 0,
      inventory: Array.isArray(p.inventory) ? p.inventory : [],
      pots: Array.isArray(p.pots) ? p.pots : [{ id: 0, recipeCode: null, startTime: null }, { id: 1, recipeCode: null, startTime: null }],
      hasTransactedThisRound: !!p.hasTransactedThisRound
    }));
    return {
      isStarted: !!data.isStarted,
      players: safePlayers,
      financialLog: Array.isArray(data.financialLog) ? data.financialLog : []
    };
  };

  useEffect(() => {
    const gameRef = ref(db, DB_PATH);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const rawData = snapshot.val();
      const cleanData = processData(rawData);
      setGameState(cleanData);
      if (cleanData.isStarted && route === AppRoute.LOBBY) setRoute(AppRoute.HOME);
      if (!rawData) set(gameRef, cleanData);
    });
    return () => unsubscribe();
  }, [route]);

  const saveToFirebase = (newState: GameState) => {
     const gameRef = ref(db, DB_PATH);
     set(gameRef, newState);
  };

  const currentPlayer = useMemo(() => gameState.players.find(p => p.name === localName), [gameState.players, localName]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updatePlayerData = useCallback((name: string, updater: (p: PlayerData) => PlayerData, description?: string, amount?: number, type?: 'gain' | 'loss') => {
    const idx = gameState.players.findIndex(p => p.name === name);
    if (idx === -1) return;
    const newPlayers = [...gameState.players];
    newPlayers[idx] = updater(newPlayers[idx]);
    const newLog = description ? [{
        id: Math.random().toString(36).substr(2, 9),
        type: type || (amount && amount >= 0 ? 'gain' : 'loss'),
        amount: amount ? Math.abs(amount) : 0,
        description: `${name}: ${description}`,
        timestamp: Date.now()
    } as const, ...gameState.financialLog] : gameState.financialLog;
    saveToFirebase({ ...gameState, players: newPlayers, financialLog: newLog.slice(0, 50) });
  }, [gameState]);

  const updateBalance = (amount: number, description: string) => {
    updatePlayerData(localName, p => ({ ...p, coins: Math.max(0, p.coins + amount) }), description, amount);
  };

  const handleJoin = (name: string) => {
    if (gameState.players.length >= 4 && !gameState.players.find(p => p.name === name)) {
      notify("Mesa cheia!", "error");
      return;
    }
    setLocalName(name);
    sessionStorage.setItem('local_player_name', name);
    if (gameState.players.find(p => p.name === name)) {
       if (gameState.isStarted) setRoute(AppRoute.HOME);
       return;
    }
    const newPlayer: PlayerData = {
      name,
      coins: 0,
      inventory: [],
      pots: [{ id: 0, recipeCode: null, startTime: null }, { id: 1, recipeCode: null, startTime: null }],
      hasTransactedThisRound: false
    };
    saveToFirebase({ ...gameState, players: [...gameState.players, newPlayer] });
  };

  const handleStartMatch = () => saveToFirebase({ ...gameState, isStarted: true });
  const handleResetSession = () => {
    saveToFirebase({ isStarted: false, players: [], financialLog: [] });
    sessionStorage.removeItem('local_player_name');
    window.location.reload();
  };

  const addItemByCode = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase(); // Força Maiúscula
    const ingredient = (INGREDIENTS || []).find(i => i.code === code);
    const recipe = (RECIPES || []).find(r => r.code === code);

    if (ingredient) {
      updatePlayerData(localName, p => ({ ...p, inventory: [...p.inventory, code] }));
      notify(`Item: ${ingredient.name}`);
      return true;
    } else if (recipe && currentPlayer) {
      // Procura panela onde recipeCode é null OU string vazia
      const emptyPotIdx = currentPlayer.pots.findIndex(pot => !pot.recipeCode);
      
      if (emptyPotIdx !== -1) {
        updatePlayerData(localName, p => {
          const newPots = [...p.pots];
          newPots[emptyPotIdx] = { ...newPots[emptyPotIdx], recipeCode: code, startTime: Date.now() };
          return { ...p, pots: newPots };
        });
        notify(`${recipe.name} no fogo!`);
        return true;
      } else {
        notify('Panelas cheias!', 'error');
      }
    } else {
      notify('Código inválido!', 'error');
    }
    return false;
  };

  const deliverPot = (potId: number) => {
    if (!currentPlayer) return;
    const pot = currentPlayer.pots.find(p => p.id === potId);
    if (!pot || !pot.recipeCode) return;
    const recipe = (RECIPES || []).find(r => r.code === pot.recipeCode);
    if (recipe) {
      updateBalance(recipe.value, `Venda: ${recipe.name}`);
      updatePlayerData(localName, p => {
        const newPots = [...p.pots];
        newPots[potId] = { ...newPots[potId], recipeCode: null, startTime: null };
        return { ...p, pots: newPots };
      });
      notify(`+${recipe.value} moedas!`);
    }
  };

  const giveUpPot = (potId: number) => {
    updatePlayerData(localName, p => {
      const newPots = [...p.pots];
      newPots[potId] = { ...newPots[potId], recipeCode: null, startTime: null };
      return { ...p, pots: newPots };
    });
  };

  const purchaseIngredient = (code: string, cost: number) => {
    if (!currentPlayer) return false;
    if (currentPlayer.coins >= cost) {
      const ingredient = (INGREDIENTS || []).find(i => i.code === code);
      updatePlayerData(localName, p => ({
        ...p,
        coins: p.coins - cost,
        inventory: [...p.inventory, code]
      }), `Compra: ${ingredient?.name}`, -cost);
      notify(`Comprou ${ingredient?.name}`);
      return true;
    }
    notify('Saldo insuficiente!', 'error');
    return false;
  };

  // Compra de Saco Surpresa
  const purchaseSacoSurpresa = (cost: number) => {
    if (!currentPlayer) return;
    if (currentPlayer.coins >= cost) {
        updateBalance(-cost, "Saco Surpresa");
        const randomIng = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
        updatePlayerData(localName
