import React, { useState } from 'react';
import { PlayerData, FinancialEvent } from '../types';
import { INGREDIENTS } from '../constants';
import { Landmark, History, PlusCircle, MinusCircle, Repeat, X } from 'lucide-react';

interface BankProps {
  player: PlayerData;
  log: FinancialEvent[];
  players: string[];
  localName: string;
  updateBalance: (amount: number, description: string) => void;
  onTrade: (target: string, type: 'coins' | 'item', data: any) => void;
  onNewRound: () => void;
}

const Bank: React.FC<BankProps> = ({ player, log, players, localName, updateBalance, onTrade, onNewRound }) => {
  const [showExtrato, setShowExtrato] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refundValue, setRefundValue] = useState(1);
  const [showTrade, setShowTrade] = useState(false);
  const [tradeTarget, setTradeTarget] = useState('');
  const [tradeType, setTradeType] = useState<'coins' | 'item'>('coins');
  const [tradeValue, setTradeValue] = useState('');

  const otherPlayers = players.filter(p => p !== localName);

  const handleStartTrade = () => {
    if (player.hasTransactedThisRound) return;
    if (!tradeTarget) return;

    if (tradeType === 'coins') {
      const amt = parseInt(tradeValue);
      if (!isNaN(amt) && amt > 0) {
        onTrade(tradeTarget, 'coins', amt);
        setShowTrade(false);
      }
    } else {
      if (tradeValue) {
        onTrade(tradeTarget, 'item', tradeValue);
        setShowTrade(false);
      }
    }
  };

  const handleRefund = () => {
    updateBalance(-refundValue, "Reembolso");
    setShowRefund(false);
    setRefundValue(1);
  };

  return (
    <div className="p-6 watercolor-wash min-h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-5xl font-kalam text-black">Meu Banco</h2>
        <div className="bg-[#FFCA1B] px-4 py-2 rounded-full border border-black/5 transform rotate-2">
            <span className="font-kalam text-xl font-bold">Renda Fixa: $2</span>
        </div>
      </div>

      <div className="paper-slip p-8 rounded-[2.5rem] mb-8 text-center shadow-lg border-b-4 border-black/5">
        <div className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-2">Minha Carteira</div>
        <div className="text-7xl font-kalam text-black mb-8">$ {player.coins}</div>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onNewRound}
            className="bg-[#588A48] text-white font-bold py-4 rounded-2xl transition-all shadow-md btn-watercolor flex flex-col items-center gap-1 active:scale-95"
          >
            <PlusCircle size={20}/>
            <span className="text-[10px] uppercase">Receber Renda</span>
          </button>
          <button 
            onClick={() => setShowExtrato(true)}
            className="bg-[#0A9396] text-white font-bold py-4 rounded-2xl transition-all shadow-md btn-watercolor flex flex-col items-center gap-1 active:scale-95"
          >
            <History size={20}/>
            <span className="text-[10px] uppercase">Extrato Global</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={() => setShowTrade(true)}
          disabled={player.hasTransactedThisRound}
          className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
            player.hasTransactedThisRound ? 'bg-gray-200 text-gray-400' : 'bg-white text-black border border-black/5 btn-watercolor'
          }`}
        >
          <Repeat size={18}/> {player.hasTransactedThisRound ? 'LIMITE' : 'TROCAR'}
        </button>
        <button 
          onClick={() => setShowRefund(true)}
          className="flex-1 bg-white text-[#FF3401] border border-[#FF3401]/20 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 btn-watercolor shadow-md"
        >
          <MinusCircle size={18}/> DEVOLVER
        </button>
      </div>

      {showExtrato && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="paper-slip w-full max-w-sm rounded-3xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 shadow-2xl">
            <div className="bg-[#fdfcf0] p-6 border-b border-black/5 flex justify-between items-center">
              <div>
                  <h3 className="text-2xl font-kalam text-black leading-none">Movimentações</h3>
                  <span className="text-[9px] uppercase font-bold text-gray-400">Log da Mesa</span>
              </div>
              <button onClick={() => setShowExtrato(false)} className="text-gray-400 hover:text-black"><X size={24}/></button>
            </div>
            <div className="payment-slip max-h-[60vh] overflow-y-auto">
              {log.length > 0 ? log.map((event) => (
                <div key={event.id} className="flex justify-between items-center text-sm border-b border-black/5 py-3 px-2">
                  <div className="flex flex-col leading-tight gap-0.5">
                    <span className="font-bold text-black/80">{event.description}</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className={`font-bold text-lg ${event.type === 'gain' ? 'text-[#588A48]' : 'text-[#FF3401]'}`}>
                    {event.type === 'gain' ? '+' : '-'}{event.amount}
                  </span>
                </div>
              )) : (
                <div className="text-center py-10 opacity-30 font-bold uppercase text-[10px]">Sem registros</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRefund && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="paper-slip w-full max-w-xs rounded-3xl p-8 animate-in zoom-in duration-300 shadow-2xl">
            <h3 className="text-2xl font-kalam text-black mb-6">Devolver moedas</h3>
            <div className="flex flex-col items-center gap-6 mb-8">
               <div className="text-5xl font-kalam text-[#FF3401]">$ {refundValue}</div>
               <input 
                type="range" 
                min="1" 
                max={player.coins} 
                value={refundValue} 
                onChange={(e) => setRefundValue(parseInt(e.target.value))}
                className="w-full accent-[#FF3401]"
               />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowRefund(false)} className="flex-1 py-4 font-bold text-gray-400 uppercase text-xs">Cancelar</button>
              <button onClick={handleRefund} className="flex-1 bg-[#FF3401] text-white font-bold py-4 rounded-2xl btn-watercolor">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showTrade && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="paper-slip w-full max-w-sm rounded-[3rem] p-10 animate-in zoom-in duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-kalam text-black">Troca na Mesa</h3>
              <button onClick={() => setShowTrade(false)} className="text-gray-400 hover:text-black"><X size={24}/></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block mb-3">Escolha o alvo</label>
                <div className="grid grid-cols-3 gap-2">
                  {otherPlayers.map(p => (
                    <button 
                      key={p} 
                      onClick={() => setTradeTarget(p)}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                        tradeTarget === p ? 'bg-[#FFCA1B] border-black/10 text-black' : 'bg-gray-50 border-black/5 text-gray-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-black/5">
                <button 
                  onClick={() => { setTradeType('coins'); setTradeValue(''); }}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${tradeType === 'coins' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                >
                  Moedas
                </button>
                <button 
                  onClick={() => { setTradeType('item'); setTradeValue(''); }}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${tradeType === 'item' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                >
                  Item
                </button>
              </div>

              {tradeType === 'coins' ? (
                <input 
                  type="number"
                  value={tradeValue}
                  onChange={(e) => setTradeValue(e.target.value)}
                  placeholder="Valor"
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-5 font-bold text-center outline-none"
                />
              ) : (
                <select 
                  value={tradeValue}
                  onChange={(e) => setTradeValue(e.target.value)}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-5 font-bold text-center outline-none"
                >
                  <option value="">Item...</option>
                  {player.inventory.map((code, idx) => {
                    const ing = INGREDIENTS.find(i => i.code === code);
                    return <option key={idx} value={code}>{ing?.name}</option>
                  })}
                </select>
              )}

              <button 
                onClick={handleStartTrade}
                disabled={!tradeTarget || !tradeValue}
                className={`w-full py-5 rounded-3xl font-bold text-lg uppercase transition-all shadow-lg ${
                  !tradeTarget || !tradeValue ? 'bg-gray-100 text-gray-300' : 'bg-[#FF3401] text-white btn-watercolor'
                }`}
              >
                Confirmar Troca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bank;
