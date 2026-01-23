import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppRoute, GameState, PlayerData, Ingredient } from './types';
import { INGREDIENTS, RECIPES } from './constants';
import { Home as HomeIcon, ShoppingBag, Landmark, BookOpen, AlertCircle, CheckCircle2, RefreshCcw, LogOut, AlertTriangle } from 'lucide-react';
import { db } from './lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import Lobby from './components/Lobby';
import GameHome from './components/Home';
import Shop from './components/Shop';
import Bank from './components/Bank';
import Cookbook from './components/Cookbook';

const DB_PATH = 'sala_v13_refinamento_final';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOBBY);
  const [localName, setLocalName] = useState<string>(() => {
    try { return sessionStorage.getItem('local_player_name') || ''; } catch { return ''; }
  });

  // --- ESTADOS DA LOJA ---
  const [shopRefreshCount, setShopRefreshCount] = useState(3);
  const [shopShelf, setShopShelf] = useState<Ingredient[]>([]);

  const [gameState, setGameState] = useState<GameState>({
      isStarted: false,
      players: [],
      financialLog: []
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // 1. INICIALIZAÇÃO (Roda apenas UMA vez quando o App abre)
  useEffect(() => {
    if (shopShelf.length === 0) {
        const shuffled = [...INGREDIENTS].sort(() => 0.5 - Math.random());
        setShopShelf(shuffled.slice(0, 4));
    }
  }, []); 

  // 2. ATUALIZAÇÃO MANUAL (Só roda quando clica no botão)
  const handleManualRefresh = () => {
      if (shopRefreshCount <= 0) return;

      const shuffled = [...INGREDIENTS].sort(() => 0.5 - Math.random());
      setShopShelf(shuffled.slice(0, 4));
      setShopRefreshCount(prev => Math.max(0, prev - 1));
  };

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
      
      if (cleanData.isStarted && route === AppRoute.LOBBY) {
         setRoute(AppRoute.HOME);
      }
      
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

  const deliverPot = (potId: number) => {
    if (!currentPlayer) return;
    const pot = currentPlayer.pots.find(p => p.id === potId);
    if (!pot || !pot.recipeCode) return;
    
    const recipe = (RECIPES || []).find(r => r.code === pot.recipeCode);
    if (recipe) {
      const requiredCodes = recipe.ingredients.map(name => {
          const ing = INGREDIENTS.find(i => i.name.toLowerCase() === name.toLowerCase());
          return ing ? ing.code : null;
      }).filter(c => c !== null) as string[];

      if (recipe.ingredients.length > 0 && requiredCodes.length !== recipe.ingredients.length) {
          notify("Erro: Ingrediente desconhecido!", "error");
          return;
      }

      const tempInventory = [...currentPlayer.inventory];
      const hasAll = requiredCodes.every(reqCode => {
          const idx = tempInventory.indexOf(reqCode);
          if (idx !== -1) {
              tempInventory.splice(idx, 1);
              return true;
          }
          return false;
      });

      if (!hasAll) {
          notify("Faltam ingredientes!", "error");
          return;
      }

      const reward = Math.ceil(recipe.value / 3);
      
      updatePlayerData(localName, p => {
        const newPots = [...p.pots];
        newPots[potId] = { ...newPots[potId], recipeCode: null, startTime: null };
        
        const finalInventory = [...p.inventory];
        requiredCodes.forEach(reqCode => {
            const idx = finalInventory.indexOf(reqCode);
            if (idx !== -1) finalInventory.splice(idx, 1);
        });

        return { 
            ...p, 
            coins: p.coins + reward, 
            inventory: finalInventory,
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
      
      // Atualiza a prateleira se comprou um item dela
      if (shopShelf.find(s => s.code === code)) {
          const available = INGREDIENTS.filter(i => !shopShelf.find(s => s.code === i.code));
          const nextItem = available[Math.floor(Math.random() * available.length)];
          setShopShelf(prev => prev.map(item => item.code === code ? nextItem : item));
      }
      return true;
    }
    notify('Saldo insuficiente!', 'error');
    return false;
  };

  const handleSpecialPurchase = (cost: number, type: 'Saco' | 'Encomenda', data?: string) => {
    if (!currentPlayer) return;
    if (currentPlayer.coins < cost) {
        notify('Saldo insuficiente!', 'error');
        return;
    }

    if (type === 'Saco') {
        const randomIng = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
        updatePlayerData(localName, p => ({ 
            ...p, 
            coins: p.coins - cost,
            inventory: [...p.inventory, randomIng.code] 
        }), "Saco Surpresa", -cost);
        notify(`Ganhou: ${randomIng.name}`);
    } else if (type === 'Encomenda' && data) {
        const itemCode = data; 
        const ingredient = INGREDIENTS.find(i => i.code === itemCode);
        if(!ingredient) { notify('Item não existe', 'error'); return; }

        updatePlayerData(localName, p => ({
            ...p,
            coins: p.coins - cost,
            inventory: [...p.inventory, itemCode]
        }), `Encomenda: ${ingredient.name}`, -cost);
        notify(`Encomenda recebida!`);
    }
  };
  
  const purchaseSacoWrapper = (cost: number) => handleSpecialPurchase(cost, 'Saco');
  const purchaseEncomendaWrapper = (code: string, cost: number) => handleSpecialPurchase(cost, 'Encomenda', code);

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
             <div className="leading-tight">
                <span className="font-kalam text-xl block truncate max-w-[100px]">{localName}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">Na Mesa</span>
             </div>
           </div>
           
           <div className="flex items-center gap-3">
               <span className="text-[#BA3801] font-bold text-lg bg-[#BA3801]/10 px-3 py-1 rounded-lg border border-[#BA3801]/20">
                   R$ {currentPlayer.coins}
               </span>
               <button 
                 onClick={() => setShowExitConfirm(true)}
                 className="p-2 text-red-400 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                 title="Encerrar Sessão"
               >
                   <LogOut size={18} />
               </button>
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
            {!currentPlayer ? (
                <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-50">
                    <p className="font-bold uppercase tracking-widest text-xs mb-4">Jogador não encontrado na sala</p>
                    <button 
                        onClick={handleResetSession}
                        className="bg-gray-200 text-gray-500 px-6 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-2"
                    >
                        <RefreshCcw size={16}/> Reiniciar
                    </button>
                </div>
            ) : (
              <>
                {route === AppRoute.HOME && <GameHome player={currentPlayer} onDeliver={deliverPot} onGiveUp={giveUpPot} onAddCode={addItemByCode} onResetSession={handleResetSession} />}
                
                {route === AppRoute.SHOP && (
                    <Shop 
                        coins={currentPlayer.coins} 
                        shelfItems={shopShelf} 
                        onBuy={purchaseIngredient} 
                        onBuySaco={purchaseSacoWrapper} 
                        onBuyEncomenda={purchaseEncomendaWrapper} 
                        
                        // --- AQUI ESTAVA O ERRO, AGORA CORRIGIDO ---
                        onBuySpecial={(cost, type, data) => {
                            if (type === 'Saco') purchaseSacoWrapper(cost);
                            if (type === 'Encomenda' && data) purchaseEncomendaWrapper(data, cost);
                        }}
                        // -------------------------------------------
                        
                        updateBalance={updateBalance} 
                        refreshCount={shopRefreshCount}
                        onRefresh={handleManualRefresh} 
                    />
                )}
                
                {route === AppRoute.BANK && <Bank player={currentPlayer} log={gameState.financialLog} players={gameState.players.map(p => p.name)} localName={localName} updateBalance={updateBalance} onTrade={handleTrade} onNewRound={resetRoundTransaction} />}
                {route === AppRoute.COOKBOOK && <Cookbook />}
              </>
            )}
          </>
        )}
      </div>

      {gameState.isStarted && currentPlayer && (
        <nav className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-md border-t border-black/5 flex justify-around items-center h-24 px-4 z-[90]">
          {[
            { id: AppRoute.HOME, icon: HomeIcon, label: 'Lobby' },
            { id: AppRoute.SHOP, icon: ShoppingBag, label: 'Lojinha' },
            { id: AppRoute.BANK, icon: Landmark, label: 'Banco' },
            { id: AppRoute.COOKBOOK, icon: BookOpen, label: 'Receitas' },
          ].map((item) => (
            <button key={item.id} onClick={() => setRoute(item.id)} className={`flex flex-col items-center gap-1 ${route === item.id ? 'text-[#BA3801]' : 'text-gray-400'}`}>
              <item.icon size={26} />
              <span className="text-[10px] font-bold uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
      
      {showExitConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
            <div className="paper-slip w-full max-w-xs rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-200">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32}/>
                </div>
                <h3 className="font-kalam text-2xl mb-2">Encerrar a Mesa?</h3>
                <p className="text-sm text-gray-500 mb-8">O jogo será apagado para todos os jogadores. Tem certeza?</p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowExitConfirm(false)}
                        className="flex-1 py-3 font-bold text-gray-400 uppercase text-xs rounded-xl hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => {
                            handleResetSession();
                            setShowExitConfirm(false);
                        }}
                        className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-md"
                    >
                        Sim, Encerrar
                    </button>
                </div>
            </div>
        </div>
      )}

      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-[#588A48] text-white' : 'bg-[#BA3801] text-white'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
          <span className="font-bold text-sm whitespace-nowrap">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
