
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppRoute, GameState, FinancialEvent, PlayerData, Pot } from './types';
import { SESSION_CODE, INGREDIENTS, RECIPES } from './constants';
import { Home, ShoppingBag, Landmark, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update, push, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Components
import Lobby from './components/Lobby';
import GameHome from './components/Home';
import Shop from './components/Shop';
import Bank from './components/Bank';
import Cookbook from './components/Cookbook';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCozcm8f28V5b3eQz7uqFy97YjsIN_FdLg",
  authDomain: "botequinho-4698c.firebaseapp.com",
  databaseURL: "https://botequinho-4698c-default-rtdb.firebaseio.com",
  projectId: "botequinho-4698c",
  storageBucket: "botequinho-4698c.firebasestorage.app",
  messagingSenderId: "385738452580",
  appId: "1:385738452580:web:a608ecc14f8b2f2687f971"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOBBY);
  
  // Tab-specific identity
  const [localName, setLocalName] = useState<string>(() => sessionStorage.getItem('local_player_name') || '');

  // Local state mirrored from Firebase
  const [gameState, setGameState] = useState<GameState>({
    isStarted: false,
    players: [],
    financialLog: []
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Derived current player data
  const currentPlayer = useMemo(() => 
    gameState.players.find(p => p.name === localName),
    [gameState.players, localName]
  );

  // Sync with Firebase on mount
  useEffect(() => {
    const gameRef = ref(db, `matches/${SESSION_CODE}`);
    
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase stores arrays as objects if they have gaps, ensure we have an array
        const sanitizedPlayers = data.players ? Object.values(data.players) as PlayerData[] : [];
        const sanitizedLog = data.financialLog ? Object.values(data.financialLog) as FinancialEvent[] : [];
        
        setGameState({
          isStarted: data.isStarted || false,
          players: sanitizedPlayers,
          financialLog: sanitizedLog.sort((a, b) => b.timestamp - a.timestamp)
        });

        if (data.isStarted && route === AppRoute.LOBBY) {
          setRoute(AppRoute.HOME);
        }
      }
    });

    return () => unsubscribe();
  }, [route]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleJoin = async (name: string) => {
    if (gameState.players.length >= 4 && !gameState.players.find(p => p.name === name)) {
      notify("Mesa cheia!", "error");
      return;
    }

    setLocalName(name);
    sessionStorage.setItem('local_player_name', name);
    
    const playerExists = gameState.players.find((p: PlayerData) => p.name === name);
    if (playerExists) return;

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

    // Use name as a sub-key for easier targeted updates
    await set(ref(db, `matches/${SESSION_CODE}/players/${name}`), newPlayer);
    notify(`Bem-vindo, ${name}!`);
  };

  const handleStartMatch = async () => {
    await update(ref(db, `matches/${SESSION_CODE}`), { isStarted: true });
    setRoute(AppRoute.HOME);
  };

  const handleResetSession = async () => {
    await set(ref(db, `matches/${SESSION_CODE}`), null);
    sessionStorage.removeItem('local_player_name');
    window.location.reload();
  };

  const logTransaction = async (description: string, amount: number, type: 'gain' | 'loss') => {
    const newLogRef = push(child(ref(db), `matches/${SESSION_CODE}/financialLog`));
    await set(newLogRef, {
      id: newLogRef.key,
      type,
      amount: Math.abs(amount),
      description: `${localName}: ${description}`,
      timestamp: Date.now()
    });
  };

  const updateBalance = async (amount: number, description: string) => {
    if (!currentPlayer) return;
    const newBalance = Math.max(0, currentPlayer.coins + amount);
    await update(ref(db, `matches/${SESSION_CODE}/players/${localName}`), { coins: newBalance });
    await logTransaction(description, amount, amount >= 0 ? 'gain' : 'loss');
  };

  const addItemByCode = async (code: string) => {
    if (!currentPlayer) return false;
    const ingredient = INGREDIENTS.find(i => i.code === code);
    const recipe = RECIPES.find(r => r.code === code);

    if (ingredient) {
      const newInventory = [...(currentPlayer.inventory || []), code];
      await update(ref(db, `matches/${SESSION_CODE}/players/${localName}`), { inventory: newInventory });
      notify(`Item: ${ingredient.name}`);
      return true;
    } else if (recipe) {
      const emptyPotIdx = currentPlayer.pots.findIndex(pot => pot.recipeCode === null);
      if (emptyPotIdx !== -1) {
        const newPots = [...currentPlayer.pots];
        newPots[emptyPotIdx] = { ...newPots[emptyPotIdx], recipeCode: code, startTime: Date.now() };
        await update(ref(db, `matches/${SESSION_CODE}/players/${localName}`), { pots: newPots });
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

  const deliverPot = async (potId: number) => {
    if (!currentPlayer) return;
    const pot = currentPlayer.pots.find(p => p.id === potId);
    if (!pot || !pot.recipeCode) return;
    const recipe = RECIPES.find(r => r.code === pot.recipeCode);
    if (recipe) {
      const reward = Math.ceil(recipe.value / 3);
      const newPots = [...currentPlayer.pots];
      newPots[potId] = { ...newPots[potId], recipeCode: null, startTime: null };
      
      await update(ref(db, `matches/${SESSION_CODE}/players/${localName}`), { 
        coins: currentPlayer.coins + reward,
        pots: newPots 
      });
      await logTransaction(`Venda: ${recipe.name}`, reward, 'gain');
      notify(`+${reward} moedas!`);
    }
  };

  const giveUpPot = async (potId: number) => {
    if (!currentPlayer) return;
    const newPots = [...currentPlayer.pots];
    newPots[potId] = { ...newPots[potId], recipeCode: null, startTime: null };
    await update(ref(db, `matches/${SESSION_CODE}/players/${localName}`), { pots: newPots });
    notify('Receita descartada');
  };

  const purchaseIngredient = async (code: string, cost: number) => {
    if (!currentPlayer) return false;
    if (currentPlayer.coins >= cost) {
      const ingredient = INGREDIENTS.find(i => i.code === code);
      const newInventory = [...(currentPlayer.inventory || []), code];
      await update(ref(db, `matches/${SESSION_CODE}/players/${localName}`), { 
        coins: currentPlayer.coins - cost,
        inventory: newInventory 
      });
      await logTransaction(`Compra: ${ingredient?.name}`, cost, 'loss');
      notify(`Comprou ${ingredient?.name}`);
      return true;
    }
    notify('Saldo insuficiente!', 'error');
    return false;
  };

  const handleTrade = async (targetPlayer: string, type: 'coins' | 'item', data: any) => {
    if (!currentPlayer || currentPlayer.hasTransactedThisRound) {
      notify('Apenas 1 troca por rodada!', 'error');
      return;
    }

    const receiver = gameState.players.find(p => p.name === targetPlayer);
    if (!receiver) return;

    if (type === 'coins') {
      const amount = data as number;
      if (currentPlayer.coins < amount) { notify('Saldo insuficiente!', 'error'); return; }
      
      const senderUpdate = { 
        coins: currentPlayer.coins - amount, 
        hasTransactedThisRound: true 
      };
      const receiverUpdate = { 
        coins: receiver.coins + amount 
      };

      await update(ref(db, `matches/${SESSION_CODE}/players/${localName}`), senderUpdate);
      await update(ref(db, `matches/${SESSION_CODE}/players/${targetPlayer}`), receiverUpdate);
      await logTransaction(`Enviou $${amount} para ${targetPlayer}`, amount, 'loss');
    } else {
      const itemCode = data as string;
      const itemIdx = currentPlayer.inventory.indexOf(itemCode);
      if (itemIdx === -1) return;

      const newSenderInventory = [...currentPlayer.inventory];
      newSenderInventory.splice(itemIdx, 1);
      
      const newReceiverInventory = [...(receiver.inventory || []), itemCode];

      await update(ref(db, `matches/${SESSION_CODE}/players/${localName}`), { 
        inventory: newSenderInventory,
        hasTransactedThisRound: true 
      });
      await update(ref(db, `matches/${SESSION_CODE}/players/${targetPlayer}`), { 
        inventory: newReceiverInventory 
      });
      await logTransaction(`Enviou Item para ${targetPlayer}`, 1, 'loss');
    }
    notify(`Enviado para ${targetPlayer}`);
  };

  const resetRoundTransaction = async () => {
    if (!currentPlayer) return;
    await update(ref(db, `matches/${SESSION_CODE}/players/${localName}`), { 
      coins: currentPlayer.coins + 2,
      hasTransactedThisRound: false 
    });
    await logTransaction("Bônus Rodada", 2, "gain");
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
