import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppRoute, GameState, PlayerData } from './types';
import { INGREDIENTS, RECIPES } from './constants';
import { Home as HomeIcon, ShoppingBag, Landmark, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

// Firebase Imports
import { db } from './lib/firebase';
import { ref, onValue, set } from 'firebase/database';

// Components
import Lobby from './components/Lobby';
import GameHome from './components/Home';
import Shop from './components/Shop';
import Bank from './components/Bank';
import Cookbook from './components/Cookbook';

const DB_PATH = 'sala_oficial_final_v2'; // Mudei a sala pra garantir zero sujeira

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOBBY);
  const [localName, setLocalName] = useState<string>(() => {
    try {
      return sessionStorage.getItem('local_player_name') || '';
    } catch {
      return '';
    }
  });

  // ESTADO INICIAL ULTRA-SEGURO
  const [gameState, setGameState] = useState<GameState>({
      isStarted: false,
      players: [],
      financialLog: []
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    console.log("Iniciando conexão com Firebase...");
    const gameRef = ref(db, DB_PATH);
    
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Dados recebidos:", data);

      if (data) {
        // BLINDAGEM MÁXIMA: Se vier null/undefined, força ser array vazio
        const safePlayers = Array.isArray(data.players) ? data.players : [];
        const safeLog = Array.isArray(data.financialLog) ? data.financialLog : [];
        
        const safeData = {
            ...data,
            players: safePlayers,
            financialLog: safeLog
        };
        
        setGameState(safeData);

        if (safeData.isStarted && route === AppRoute.LOBBY) {
           setRoute(AppRoute.HOME);
        }
      } else {
        console.log("Sala vazia, criando estado inicial...");
        const initialState = { isStarted: false, players: [], financialLog: [] };
        set(gameRef, initialState);
        setGameState(initialState);
      }
    });

    return () => unsubscribe();
  }, [route]);

  // USEMEMO COM PROTEÇÃO DE ERRO
  const currentPlayer = useMemo(() => {
    // Se players não existir, retorna undefined sem quebrar
    if (!gameState || !gameState.players || !Array.isArray(gameState.players)) {
      return undefined;
    }
    return gameState.players.find(p => p && p.name === localName);
  }, [gameState, localName]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveToFirebase = (newState: GameState) => {
     const gameRef = ref(db, DB_PATH);
     set(gameRef, newState);
  };

  // --- ACTIONS ---

  const updatePlayerData = useCallback((name: string, updater: (p: PlayerData) => PlayerData, description?: string, amount?: number, type?: 'gain' | 'loss') => {
    const currentPlayers = Array.isArray(gameState.players) ? [...gameState.players] : [];
    const playerIdx = currentPlayers.findIndex(p => p.name === name);
    
    if (playerIdx === -1) return;

    currentPlayers[playerIdx] = updater(currentPlayers[playerIdx]);

    const currentLog = Array.isArray(gameState.financialLog) ? [...gameState.financialLog] : [];
    
    if (description && amount !== undefined) {
      currentLog.unshift({
        id: Math.random().toString(36).substr(2, 9),
        type: type || (amount >= 0 ? 'gain' : 'loss'),
        amount: Math.abs(amount),
        description: `${name}: ${description}`,
        timestamp: Date.now()
      });
    }

    saveToFirebase({
      ...gameState,
      players: currentPlayers,
      financialLog: currentLog.slice(0, 50)
    });
  }, [gameState]); 

  const updateBalance = (amount: number, description: string) => {
    updatePlayerData(localName, p => ({
      ...p,
      coins: Math.max(0, p.coins + amount)
    }), description, amount);
  };

  const handleJoin = (name: string) => {
    const safePlayers = Array.isArray(gameState.players) ? gameState.players : [];
    
    if (safePlayers.length >= 4 && !safePlayers.find(p => p.name === name)) {
      notify("Mesa cheia!", "error");
      return;
    }

    setLocalName(name);
    sessionStorage.setItem('local_player_name', name);
    
    const playerExists = safePlayers.find(p => p.name === name);
    if (playerExists) {
       if (gameState.isStarted) setRoute(AppRoute.HOME);
       return;
    }

    const newPlayer: PlayerData = {
      name,
      coins: 10,
      inventory: [],
      pots: [
        { id: 0, recipeCode: null, startTime: null },
        { id: 1, recipeCode: null, startTime: null }
      ],
      hasTransactedThisRound: false
    };

    saveToFirebase({
      ...gameState,
      players: [...safePlayers, newPlayer]
    });
  };

  const handleStartMatch = () => saveToFirebase({ ...gameState, isStarted: true });

  const handleResetSession = () => {
    saveToFirebase({ isStarted: false, players: [], financialLog: [] });
    sessionStorage.removeItem('local_player_name');
    window.location.reload();
  };

  // --- GAMEPLAY ACTIONS ---

  const addItemByCode = (code: string) => {
    // Proteção contra imports vazios
    const safeIngs = INGREDIENTS || [];
    const safeRecipes = RECIPES || [];

    const ingredient = safeIngs.find(i => i.code === code);
    const recipe = safeRecipes.find(r => r.code === code);

    if (ingredient) {
      updatePlayerData(localName, p => ({ ...p, inventory: [...p.inventory, code] }));
      notify(`Item: ${ingredient.name}`);
      return true;
    } else if (recipe) {
      const emptyPotIdx = currentPlayer?.pots.findIndex(pot => pot.recipeCode === null);
      if (emptyPotIdx !== undefined && emptyPotIdx !== -1) {
        updatePlayerData(localName, p => {
          const newPots = [...p.pots];
          newPots[emptyPotIdx] = { ...newPots[emptyPotIdx], recipeCode: code, startTime: Date.now() };
          return { ...p, pots: newPots };
        });
        notify(`${recipe.name} no fogo!`);
        return true;
      } else {
        notify('Panelas cheias!', 'error');
        return false;
      }
    }
    return false;
  };

  const deliverPot = (potId: number) => {
    const pot = currentPlayer?.pots.find(p => p.id === potId);
    if (!pot || !pot.recipeCode) return;
    const safeRecipes = RECIPES || [];
    const recipe = safeRecipes.find(r => r.code === pot.recipeCode);
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
    if ((currentPlayer?.coins || 0) >= cost) {
      const safeIngs = INGREDIENTS || [];
      const ingredient = safeIngs.find(i => i.code === code);
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

  const handleTrade = (targetPlayer: string, type: 'coins' | 'item', data: any) => {
    // ... lógica de troca simplificada para economizar espaço, mas funcional ...
    const safePlayers = Array.isArray(gameState.players) ? [...gameState.players] : [];
    const senderIdx = safePlayers.findIndex(p => p.name === localName);
    const receiverIdx = safePlayers.findIndex(p => p.name === targetPlayer);
    if (senderIdx === -1 || receiverIdx === -1) return;

    const sender = { ...safePlayers[senderIdx] };
    const receiver = { ...safePlayers[receiverIdx] };

    if (type === 'coins') {
       const amount = data as number;
       if (sender.coins < amount) return;
       sender.coins -= amount;
       receiver.coins += amount;
    } else {
       const itemCode = data as string;
       const itemIdx = sender.inventory.indexOf(itemCode);
       if (itemIdx === -1) return;
       sender.inventory.splice(itemIdx, 1);
       receiver.inventory.push(itemCode);
    }
    sender.hasTransactedThisRound = true;
    safePlayers[senderIdx] = sender;
    safePlayers[receiverIdx] = receiver;
    saveToFirebase({ ...gameState, players: safePlayers });
  };

  const resetRoundTransaction = () => {
    updatePlayerData(localName, p => ({ ...p, hasTransactedThisRound: false }), "Bônus Rodada", 2);
  };

  // RENDERIZAÇÃO SEGURA
  const safePlayerList = (Array.isArray(gameState.players) ? gameState.players : []).map(p => p.name);
  const safeLog = Array.isArray(gameState.financialLog) ? gameState.financialLog : [];

  return (
    <div className="flex flex-col min-h-screen watercolor-wash overflow-hidden max-w-md mx-auto relative shadow-2xl">
      {gameState.isStarted && currentPlayer && (
        <div className="bg-[#fffef2]/90 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-black/5 shadow-sm z-50">
           {/* Header simplificado */}
           <span className="font-kalam text-xl">{localName}</span>
           <span className="text-[#FF3401] font-bold">$ {currentPlayer.coins}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-28">
        {!gameState.isStarted ? (
          <Lobby 
            onJoin={handleJoin} 
            onStart={handleStartMatch} 
            onReset={handleResetSession}
            players={safePlayerList} 
            currentName={localName} 
          />
        ) : (
          <>
            {currentPlayer && (
              <>
                {route === AppRoute.HOME && <GameHome player={currentPlayer} onDeliver={deliverPot} onGiveUp={giveUpPot} onAddCode={addItemByCode} />}
                {route === AppRoute.SHOP && <Shop coins={currentPlayer.coins} onBuy={purchaseIngredient} updateBalance={updateBalance} />}
                {route === AppRoute.BANK && <Bank player={currentPlayer} log={safeLog} players={safePlayerList} localName={localName} updateBalance={updateBalance} onTrade={handleTrade} onNewRound={resetRoundTransaction} />}
                {route === AppRoute.COOKBOOK && <Cookbook />}
              </>
            )}
          </>
        )}
      </div>
      
      {/* Menu de Navegação */}
      {gameState.isStarted && (
        <nav className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-md border-t border-black/5 flex justify-around items-center h-24 px-4 z-[90]">
          {[
            { id: AppRoute.HOME, icon: HomeIcon, label: 'Lobby' },
            { id: AppRoute.SHOP, icon: ShoppingBag, label: 'Lojinha' },
            { id: AppRoute.BANK, icon: Landmark, label: 'Banco' },
            { id: AppRoute.COOKBOOK, icon: BookOpen, label: 'Receitas' },
          ].map((item) => (
            <button key={item.id} onClick={() => setRoute(item.id)} className={`flex flex-col items-center gap-1 ${route === item.id ? 'text-[#FF3401]' : 'text-gray-400'}`}>
              <item.icon size={26} />
              <span className="text-[10px] font-bold uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
      
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-6 py-3 rounded-full shadow-xl">
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default App;
