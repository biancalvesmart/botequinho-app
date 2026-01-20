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

const DB_PATH = 'sala_v8_calculo_correto'; // Nova sala para garantir tudo limpo

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
    const code = rawCode.trim().toUpperCase();
    const ingredient = (INGREDIENTS || []).find(i => i.code === code);
    const recipe = (RECIPES || []).find(r => r.code === code);

    if (ingredient) {
      updatePlayerData(localName, p => ({ ...p, inventory: [...p.inventory, code] }));
      notify(`Item: ${ingredient.name}`);
      return true;
    } else if (recipe && currentPlayer) {
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

  // --- CORREÇÃO PRINCIPAL AQUI ---
  const deliverPot = (potId: number) => {
    if (!currentPlayer) return;
    const pot = currentPlayer.pots.find(p => p.id === potId);
    if (!pot || !pot.recipeCode) return;
    
    const recipe = (RECIPES || []).find(r => r.code === pot.recipeCode);
    if (recipe) {
      // Regra: Valor / 3 arredondado para CIMA
      const reward = Math.ceil(recipe.value / 3);

      // ATUALIZAÇÃO ÚNICA (Soma moeda + Limpa panela ao mesmo tempo)
      updatePlayerData(localName, p => {
        const newPots = [...p.pots];
        newPots[potId] = { ...newPots[potId], recipeCode: null, startTime: null };
        
        return { 
            ...p, 
            coins: p.coins + reward, // <--- O dinheiro entra aqui junto com a limpeza
            pots: newPots 
        };
      }, `Venda: ${recipe.name}`, reward);

      notify(`+${reward} moedas!`);
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

  const purchaseSacoSurpresa = (cost: number) => {
    if (!currentPlayer) return;
    if (currentPlayer.coins >= cost) {
        // Debita o valor E adiciona o item na mesma jogada para evitar erro
        const randomIng = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
        
        updatePlayerData(localName, p => ({ 
            ...p, 
            coins: p.coins - cost,
            inventory: [...p.inventory, randomIng.code] 
        }), "Saco Surpresa", -cost);
        
        notify(`Ganhou: ${randomIng.name}`);
    } else {
        notify('Saldo insuficiente!', 'error');
    }
  };

  const purchaseEncomenda = (code: string, cost: number) => {
    if (!currentPlayer) return;
    const ingredient = (INGREDIENTS || []).find(i => i.code === code);
    
    if (!ingredient) {
        notify('Código de item inválido!', 'error');
        return;
    }

    if (currentPlayer.coins >= cost) {
        updatePlayerData(localName, p => ({
            ...p,
            coins: p.coins - cost,
            inventory: [...p.inventory, code]
        }), `Encomenda: ${ingredient.name}`, -cost);
        notify(`Encomenda recebida!`);
        return true;
    } else {
        notify('Saldo insuficiente!', 'error');
        return false;
    }
  };

  const handleTrade = (targetPlayer: string, type: 'coins' | 'item', data: any) => {
    const senderIdx = gameState.players.findIndex(p => p.name === localName);
    const receiverIdx = gameState.players.findIndex(p => p.name === targetPlayer);
    if (senderIdx === -1 || receiverIdx === -1) return;
    const sender = { ...gameState.players[senderIdx] };
    const receiver = { ...gameState.players[receiverIdx] };

    if (type === 'coins') {
       if (sender.coins < (data as number)) { notify('Saldo insuficiente!', 'error'); return; }
       sender.coins -= (data as number);
       receiver.coins += (data as number);
    } else {
       const itemIdx = sender.inventory.indexOf(data as string);
       if (itemIdx === -1) return;
       sender.inventory.splice(itemIdx, 1);
       receiver.inventory.push(data as string);
    }
    sender.hasTransactedThisRound = true;
    const newPlayers = [...gameState.players];
    newPlayers[senderIdx] = sender;
    newPlayers[receiverIdx] = receiver;
    saveToFirebase({ ...gameState, players: newPlayers });
    notify(`Enviado para ${targetPlayer}`);
  };

  const resetRoundTransaction = () => {
    updatePlayerData(localName, p => ({ ...p, hasTransactedThisRound: false, coins: p.coins + 2 }), "Renda", 2);
    notify("Recebeu +2 da renda!");
  };

  return (
    <div className="flex flex-col min-h-screen watercolor-wash overflow-hidden max-w-md mx-auto relative shadow-2xl">
      {gameState.isStarted && currentPlayer && (
        <div className="bg-[#fffef2]/90 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-black/5 shadow-sm z-50">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#FFCA1B] rounded-full flex items-center justify-center font-bold text-black border-2 border-black/10">
                {localName.charAt(0).toUpperCase()}
             </div>
             <span className="font-kalam text-xl truncate max-w-[120px]">{localName}</span>
           </div>
           <span className="text-[#FF3401] font-bold text-lg">$ {currentPlayer.coins}</span>
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
                {route === AppRoute.SHOP && <Shop coins={currentPlayer.coins} onBuy={purchaseIngredient} onBuySaco={purchaseSacoSurpresa} onBuyEncomenda={purchaseEncomenda} updateBalance={updateBalance} />}
                {route === AppRoute.BANK && <Bank player={currentPlayer} log={gameState.financialLog} players={gameState.players.map(p => p.name)} localName={localName} updateBalance={updateBalance} onTrade={handleTrade} onNewRound={resetRoundTransaction} />}
                {route === AppRoute.COOKBOOK && <Cookbook />}
              </>
            )}
          </>
        )}
      </div>
      
      {/* NOTIFICAÇÃO COM Z-INDEX ALTO */}
      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-[#588A48] text-white' : 'bg-[#FF3401] text-white'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
          <span className="font-bold text-sm whitespace-nowrap">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
