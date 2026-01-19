
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppRoute, GameState, FinancialEvent, PlayerData, Pot } from './types';
import { SESSION_CODE, INGREDIENTS, RECIPES } from './constants';
import { Home, ShoppingBag, Landmark, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

// Components
import Lobby from './components/Lobby';
import GameHome from './components/Home';
import Shop from './components/Shop';
import Bank from './components/Bank';
import Cookbook from './components/Cookbook';

const STORAGE_KEY = 'botequinho_state_v3';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOBBY);
  
  // Tab-specific identity
  const [localName, setLocalName] = useState<string>(() => sessionStorage.getItem('local_player_name') || '');

  // Global game state (Players array + Table Log)
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      isStarted: false,
      players: [],
      financialLog: []
    };
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Derived current player data
  const currentPlayer = useMemo(() => 
    gameState.players.find(p => p.name === localName),
    [gameState.players, localName]
  );

  // Write to disk
  const syncToDisk = useCallback((newState: GameState) => {
    const currentDisk = localStorage.getItem(STORAGE_KEY);
    const nextString = JSON.stringify(newState);
    if (currentDisk !== nextString) {
      localStorage.setItem(STORAGE_KEY, nextString);
    }
  }, []);

  useEffect(() => {
    syncToDisk(gameState);
  }, [gameState, syncToDisk]);

  // Sync from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const parsed = JSON.parse(e.newValue);
        setGameState(prev => {
          if (JSON.stringify(prev) === e.newValue) return prev;
          if (parsed.isStarted && !prev.isStarted) setRoute(AppRoute.HOME);
          return parsed;
        });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleJoin = (name: string) => {
    const rawDisk = localStorage.getItem(STORAGE_KEY);
    const diskState: GameState = rawDisk ? JSON.parse(rawDisk) : gameState;

    if (diskState.players.length >= 4 && !diskState.players.find(p => p.name === name)) {
      notify("Mesa cheia!", "error");
      return;
    }

    setLocalName(name);
    sessionStorage.setItem('local_player_name', name);
    
    setGameState(prev => {
      // Re-fetch disk to be safe and merge
      const diskData = localStorage.getItem(STORAGE_KEY);
      const latestDisk: GameState = diskData ? JSON.parse(diskData) : { isStarted: false, players: [], financialLog: [] };
      const playerExists = latestDisk.players.find((p: PlayerData) => p.name === name);
      
      if (playerExists) return { ...latestDisk };

      const newPlayer: PlayerData = {
        name,
        coins: 0, // Initial balance fix: start with 0 coins
        inventory: [],
        pots: [
          { id: 0, recipeCode: null, startTime: null },
          { id: 1, recipeCode: null, startTime: null }
        ],
        hasTransactedThisRound: false
      };

      const newState: GameState = {
        ...latestDisk,
        players: [...latestDisk.players, newPlayer]
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
    notify(`Bem-vindo, ${name}!`);
  };

  const handleStartMatch = () => {
    setGameState(prev => {
      const newState = { ...prev, isStarted: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
    setRoute(AppRoute.HOME);
  };

  const handleResetSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('local_player_name');
    window.location.reload();
  };

  // Helper to update specific player data
  const updatePlayerData = useCallback((name: string, updater: (p: PlayerData) => PlayerData, description?: string, amount?: number, type?: 'gain' | 'loss') => {
    setGameState(prev => {
      const playerIdx = prev.players.findIndex(p => p.name === name);
      if (playerIdx === -1) return prev;

      const newPlayers = [...prev.players];
      newPlayers[playerIdx] = updater(newPlayers[playerIdx]);

      const newLog = [...prev.financialLog];
      if (description && amount !== undefined) {
        newLog.unshift({
          id: Math.random().toString(36).substr(2, 9),
          type: type || (amount >= 0 ? 'gain' : 'loss'),
          amount: Math.abs(amount),
          description: `${name}: ${description}`,
          timestamp: Date.now()
        });
      }

      return {
        ...prev,
        players: newPlayers,
        financialLog: newLog.slice(0, 50)
      };
    });
  }, []);

  const updateBalance = (amount: number, description: string) => {
    updatePlayerData(localName, p => ({
      ...p,
      coins: Math.max(0, p.coins + amount)
    }), description, amount);
  };

  const addItemByCode = (code: string) => {
    const ingredient = INGREDIENTS.find(i => i.code === code);
    const recipe = RECIPES.find(r => r.code === code);

    if (ingredient) {
      updatePlayerData(localName, p => ({
        ...p,
        inventory: [...p.inventory, code]
      }));
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
    notify('Código inválido!', 'error');
    return false;
  };

  const deliverPot = (potId: number) => {
    const pot = currentPlayer?.pots.find(p => p.id === potId);
    if (!pot || !pot.recipeCode) return;
    const recipe = RECIPES.find(r => r.code === pot.recipeCode);
    if (recipe) {
      const reward = Math.ceil(recipe.value / 3);
      updateBalance(reward, `Venda: ${recipe.name}`);
      updatePlayerData(localName, p => {
        const newPots = [...p.pots];
        newPots[potId] = { ...newPots[potId], recipeCode: null, startTime: null };
        return { ...p, pots: newPots };
      });
      notify(`+${reward} moedas!`);
    }
  };

  const giveUpPot = (potId: number) => {
    updatePlayerData(localName, p => {
      const newPots = [...p.pots];
      newPots[potId] = { ...newPots[potId], recipeCode: null, startTime: null };
      return { ...p, pots: newPots };
    });
    notify('Receita descartada');
  };

  const purchaseIngredient = (code: string, cost: number) => {
    if ((currentPlayer?.coins || 0) >= cost) {
      const ingredient = INGREDIENTS.find(i => i.code === code);
      updateBalance(-cost, `Compra: ${ingredient?.name}`);
      updatePlayerData(localName, p => ({
        ...p,
        inventory: [...p.inventory, code]
      }));
      notify(`Comprou ${ingredient?.name}`);
      return true;
    }
    notify('Saldo insuficiente!', 'error');
    return false;
  };

  const handleTrade = (targetPlayer: string, type: 'coins' | 'item', data: any) => {
    if (currentPlayer?.hasTransactedThisRound) {
      notify('Apenas 1 troca por rodada!', 'error');
      return;
    }

    setGameState(prev => {
      const senderIdx = prev.players.findIndex(p => p.name === localName);
      const receiverIdx = prev.players.findIndex(p => p.name === targetPlayer);
      if (senderIdx === -1 || receiverIdx === -1) return prev;

      const newPlayers = [...prev.players];
      const sender = { ...newPlayers[senderIdx] };
      const receiver = { ...newPlayers[receiverIdx] };

      if (type === 'coins') {
        const amount = data as number;
        if (sender.coins < amount) { notify('Saldo insuficiente!', 'error'); return prev; }
        sender.coins -= amount;
        receiver.coins += amount;
      } else {
        const itemCode = data as string;
        const itemIdx = sender.inventory.indexOf(itemCode);
        if (itemIdx === -1) return prev;
        sender.inventory.splice(itemIdx, 1);
        receiver.inventory.push(itemCode);
      }

      sender.hasTransactedThisRound = true;
      newPlayers[senderIdx] = sender;
      newPlayers[receiverIdx] = receiver;

      const newLog = [{
        id: Math.random().toString(36).substr(2, 9),
        type: 'loss' as const,
        amount: type === 'coins' ? data : 1,
        description: `${localName} enviou ${type === 'coins' ? '$' + data : 'Item'} para ${targetPlayer}`,
        timestamp: Date.now()
      }, ...prev.financialLog];

      return { ...prev, players: newPlayers, financialLog: newLog.slice(0, 50) };
    });
    notify(`Enviado para ${targetPlayer}`);
  };

  const resetRoundTransaction = () => {
    updateBalance(2, "Bônus Rodada");
    updatePlayerData(localName, p => ({ ...p, hasTransactedThisRound: false }));
    notify("Recebeu +2 da rodada!");
  };

  return (
    <div className="flex flex-col min-h-screen watercolor-wash overflow-hidden max-w-md mx-auto relative shadow-2xl">
      {gameState.isStarted && currentPlayer && (
        <div className="bg-[#fffef2]/90 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-black/5 shadow-sm z-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#FFCA1B] rounded-full flex items-center justify-center font-bold text-black border-2 border-black/10">
                {localName.charAt(0).toUpperCase() || '?'}
             </div>
             <div className="leading-none">
               <span className="font-kalam text-xl text-black block">{localName}</span>
               <span className="text-[10px] uppercase font-bold text-gray-400">Na Mesa</span>
             </div>
          </div>
          <div className="bg-[#FF3401]/10 px-4 py-2 rounded-full border border-[#FF3401]/20">
             <span className="text-[#FF3401] font-bold text-lg">$ {currentPlayer.coins}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-28">
        {!gameState.isStarted ? (
          <Lobby 
            onJoin={handleJoin} 
            onStart={handleStartMatch} 
            onReset={handleResetSession}
            players={gameState.players.map(p => p.name)} 
            currentName={localName} 
          />
        ) : (
          <>
            {currentPlayer && (
              <>
                {route === AppRoute.HOME && <GameHome player={currentPlayer} onDeliver={deliverPot} onGiveUp={giveUpPot} onAddCode={addItemByCode} />}
                {route === AppRoute.SHOP && <Shop coins={currentPlayer.coins} onBuy={purchaseIngredient} updateBalance={updateBalance} />}
                {route === AppRoute.BANK && <Bank player={currentPlayer} log={gameState.financialLog} players={gameState.players.map(p => p.name)} localName={localName} updateBalance={updateBalance} onTrade={handleTrade} onNewRound={resetRoundTransaction} />}
                {route === AppRoute.COOKBOOK && <Cookbook />}
              </>
            )}
          </>
        )}
      </div>

      {notification && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-[#588A48] text-white' : 'bg-[#FF3401] text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
          <span className="font-bold text-sm tracking-tight">{notification.message}</span>
        </div>
      )}

      {gameState.isStarted && (
        <nav className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-md border-t border-black/5 flex justify-around items-center h-24 px-4 z-[90]">
          {[
            { id: AppRoute.HOME, icon: Home, label: 'Lobby' },
            { id: AppRoute.SHOP, icon: ShoppingBag, label: 'Lojinha' },
            { id: AppRoute.BANK, icon: Landmark, label: 'Banco' },
            { id: AppRoute.COOKBOOK, icon: BookOpen, label: 'Receitas' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setRoute(item.id)} 
              className={`flex flex-col items-center gap-1 transition-all flex-1 ${route === item.id ? 'text-[#FF3401]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <item.icon size={26} strokeWidth={route === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              {route === item.id && <div className="w-1 h-1 bg-[#FF3401] rounded-full mt-1"></div>}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default App;
