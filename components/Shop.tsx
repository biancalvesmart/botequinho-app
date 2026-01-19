
import React, { useState, useEffect } from 'react';
import { Ingredient } from '../types';
import { INGREDIENTS } from '../constants';
import { Package, Search, Sparkles, Coins, RefreshCw } from 'lucide-react';

interface ShopProps {
  coins: number;
  onBuy: (code: string, cost: number) => boolean;
  updateBalance: (amount: number, description: string) => void;
}

const Shop: React.FC<ShopProps> = ({ coins, onBuy, updateBalance }) => {
  const [shelfItems, setShelfItems] = useState<Ingredient[]>([]);

  useEffect(() => {
    refreshShelf();
  }, []);

  const refreshShelf = () => {
    const shuffled = [...INGREDIENTS].sort(() => 0.5 - Math.random());
    setShelfItems(shuffled.slice(0, 4));
  };

  const handleShelfBuy = (ing: Ingredient) => {
    const cost = ing.score + 2;
    if (onBuy(ing.code, cost)) {
      const available = INGREDIENTS.filter(i => !shelfItems.find(s => s.code === i.code));
      const nextItem = available[Math.floor(Math.random() * available.length)];
      setShelfItems(prev => prev.map(item => item.code === ing.code ? nextItem : item));
    }
  };

  return (
    <div className="p-6 watercolor-wash min-h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-5xl font-kalam text-black">Lojinha</h2>
        <button onClick={refreshShelf} className="p-2 text-[#0A9396] transition-colors hover:rotate-180 duration-500">
          <RefreshCw size={24}/>
        </button>
      </div>

      <div className="mb-10">
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-[#FFCA1B] rounded-full"></div> A Prateleira
        </h3>
        <div className="grid grid-cols-2 gap-5">
          {shelfItems.map((ing) => (
            <div key={ing.code} className="paper-slip p-6 rounded-[2rem] flex flex-col items-center group">
              <div className="w-14 h-14 bg-[#FFCA1B]/10 rounded-full flex items-center justify-center mb-4 border border-[#FFCA1B]/20">
                <span className="text-[#FFCA1B] font-kalam text-2xl leading-none">{ing.score}</span>
              </div>
              <h4 className="text-[10px] font-bold uppercase text-center mb-5 min-h-[2.5rem] line-clamp-2 px-1 text-black/60 tracking-wider leading-relaxed">{ing.name}</h4>
              <button 
                onClick={() => handleShelfBuy(ing)}
                className="w-full bg-[#0A9396] text-white text-[10px] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 btn-watercolor"
              >
                <Coins size={14}/> PAGAR {ing.score + 2}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="paper-slip p-8 rounded-[2.5rem] border border-[#FFCA1B]/20 flex items-center gap-6">
          <div className="w-20 h-20 bg-[#FFCA1B]/10 rounded-3xl flex items-center justify-center flex-shrink-0">
             <Package size={36} className="text-[#FFCA1B]" />
          </div>
          <div className="flex-1">
            <h3 className="font-kalam text-2xl text-black leading-tight">Saco Surpresa</h3>
            <p className="text-[9px] text-gray-400 mb-4 font-bold uppercase tracking-widest">Item aleatório da pilha</p>
            <button 
              onClick={() => {
                if(coins >= 4) {
                    const randomIng = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
                    updateBalance(-4, "Saco Surpresa");
                    onBuy(randomIng.code, 0); 
                } else {
                    alert('Saldo insuficiente');
                }
              }}
              className="bg-[#FFCA1B] text-black text-[10px] font-bold px-6 py-3 rounded-2xl flex items-center gap-2 btn-watercolor shadow-md border border-black/5"
            >
              <Coins size={14}/> $ 4.00
            </button>
          </div>
        </div>

        <div className="bg-[#FF3401] text-white p-8 rounded-[2.5rem] flex items-center gap-6 relative overflow-hidden shadow-2xl">
          <Sparkles className="absolute -right-6 -top-6 w-32 h-32 opacity-10 rotate-12" />
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center flex-shrink-0">
             <Search size={36} className="text-white" />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="font-kalam text-2xl text-white leading-tight">A Encomenda</h3>
            <p className="text-[9px] text-white/60 mb-4 font-bold uppercase tracking-widest">Escolha item livremente</p>
            <button 
              onClick={() => {
                if(coins >= 16) {
                    updateBalance(-16, "A Encomenda");
                } else {
                    alert('Saldo insuficiente');
                }
              }}
              className={`text-[10px] font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all ${
                coins >= 16 ? 'bg-white text-black btn-watercolor' : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              <Coins size={14}/> $ 16.00
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
