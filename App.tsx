import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppRoute, GameState, PlayerData } from './types';
import { INGREDIENTS, RECIPES } from './constants';
import { Home, ShoppingBag, Landmark, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

import { db } from './lib/firebase';
import { ref, onValue, set } from 'firebase/database';

import Lobby from './components/Lobby';
import GameHome from './components/Home';
import Shop from './components/Shop';
import Bank from './components/Bank';
import Cookbook from './components/Cookbook';

const DB_PATH = 'sala_comum_v1';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOBBY);
  
  const [localName, setLocalName] = useState<string>(() => sessionStorage.getItem('local_player_name') || '');

  const [gameState, setGameState] = useState<GameState>({
      isStarted: false,
      players: [],
      financialLog: []
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const gameRef = ref(db, DB_PATH);
    
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
        if (data.isStarted && route === AppRoute.LOBBY) {
           setRoute(AppRoute.HOME);
        }
      } else {
        const initialState = { isStarted: false, players: [], financialLog: [] };
        set(gameRef, initialState);
        setGameState(initialState);
      }
    });

    return () => unsubscribe();
  }, [route]); 

  const saveToFirebase = (newState: GameState) => {
     
     const gameRef = ref(db, DB_PATH);
     set(gameRef, newState);
  };

  const currentPlayer = useMemo(() => 
    gameState.players.find(p => p.name === localName),
    [gameState.players, localName]
  );

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };


  const handleJoin = (name: string) => {
    if (gameState.players.length >= 4 && !gameState.players.find(p => p.name === name)) {
      notify("Mesa cheia!", "error");
      return;
    }

    setLocalName(name);
    sessionStorage.setItem('local_player_name', name);
    
    const playerExists = gameState.players.find(p => p.name === name);
    
    if (playerExists) {
       if (gameState.isStarted) setRoute(AppRoute.HOME);
       return;
    }

    const newPlayer: PlayerData = {
      name,
      coins: 0,
      inventory: [],
      pots: [
        { id: 0, recipeCode: null, startTime: null },
        { id: 1, recipeCode: null, startTime: null }
      ],
      hasTransactedThisRound: false
    };

    const newState = {
      ...gameState,
      players: [...gameState.players, newPlayer]
    };
    
    saveToFirebase(newState);
    notify(`Bem-vindo, ${name}!`);
  };

  const handleStartMatch = () => {
    const newState = { ...gameState, isStarted: true };
    saveToFirebase(newState);
  };

  const handleResetSession = () => {
    const cleanState = { isStarted: false, players: [], financialLog: [] };
    saveToFirebase(cleanState);
    
    sessionStorage.removeItem('local_player_name');
    window.location.reload();
  };

  const updatePlayerData = useCallback((name: string, updater: (p: PlayerData) => PlayerData, description?: string, amount?: number, type?: 'gain' | 'loss') => {
    
    const playerIdx = gameState.players.findIndex(p => p.name === name);
    if (playerIdx === -1) return;

    const newPlayers = [...gameState.players];
    newPlayers[playerIdx] = updater(newPlayers[playerIdx]);

    const newLog = [...gameState.financialLog];
    if (description && amount !== undefined) {
      newLog.unshift({
        id: Math.random().toString(36).substr(2, 9),
        type: type || (amount >= 0 ? 'gain' : 'loss'),
        amount: Math.abs(amount),
        description: `${name}: ${description}`,
        timestamp: Date.now()
      });
    }

    const newState = {
      ...gameState,
      players: newPlayers,
      financialLog: newLog.slice(0, 50)
    };

    saveToFirebase(newState);
  }, [gameState]); 

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
    notify('Código inválido, tente novamente!', 'error');
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
    if (currentPlayer?.hasTransactedThisRound) {
      notify('Apenas 1 troca por rodada!', 'error');
      return;
    }

    const senderIdx = gameState.players.findIndex(p => p.name === localName);
    const receiverIdx = gameState.players.findIndex(p => p.name === targetPlayer);
    
    if (senderIdx === -1 || receiverIdx === -1) return;

    const newPlayers = [...gameState.players];
    const sender = { ...newPlayers[senderIdx] };
    const receiver = { ...newPlayers[receiverIdx] };

    if (type === 'coins') {
       const amount = data as number;
       if (sender.coins < amount) { notify('Saldo insuficiente!', 'error'); return; }
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
    newPlayers[senderIdx] = sender;
    newPlayers[receiverIdx] = receiver;

    const newLog = [{
       id: Math.random().toString(36).substr(2, 9),
       type: 'loss' as const,
       amount: type === 'coins' ? data : 1,
       description: `${localName} enviou ${type === 'coins' ? '$' + data : 'Item'} para ${targetPlayer}`,
       timestamp: Date.now()
    }, ...gameState.financialLog];

    saveToFirebase({ ...gameState, players: newPlayers, financialLog: newLog.slice(0, 50) });
    notify(`Enviado para ${targetPlayer}`);
  };

  const resetRoundTransaction = () => {
    updatePlayerData(localName, p => ({ ...p, hasTransactedThisRound: false }), "Renda da Rodada", 2);
    notify("Recebeu +2 moedas de renda da rodada!");
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
            { id: AppRoute.HOME, icon: Home, label: 'Minha cozinha' },
            { id: AppRoute.SHOP, icon: ShoppingBag, label: 'Lojinha' },
            { id: AppRoute.BANK, icon: Landmark, label: 'Meu banco' },
            { id: AppRoute.COOKBOOK, icon: BookOpen, label: 'Livro de receitas' },
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
