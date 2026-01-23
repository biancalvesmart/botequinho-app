import React, { useState, useMemo } from 'react';
import { Ingredient } from '../types';
import { INGREDIENTS } from '../constants';
import { Search, Sparkles, Coins, RefreshCw, X } from 'lucide-react'; // Removi o Package pois vamos usar imagem

// 👇 1. IMPORTANDO AS NOVAS IMAGENS
import imgSaco from '../assets/idvisual/SacoSurpresa.png';
import imgEncomenda from '../assets/idvisual/CaixasEncomenda.png';

interface ShopProps {
  coins: number;
  shelfItems: Ingredient[];
  onBuy: (code: string, cost: number) => boolean;
  onBuySaco: (cost: number) => void;
  onBuyEncomenda: (code: string, cost: number) => void;
  onBuySpecial: (cost: number, type: 'Saco' | 'Encomenda', data?: string) => void;
  updateBalance: (amount: number, description: string) => void;
  refreshCount: number;
  onRefresh: () => void;
}

const Shop: React.FC<ShopProps> = ({ coins, shelfItems, onBuy, onBuySaco, onBuyEncomenda, onBuySpecial, refreshCount, onRefresh }) => {
  const [isEncomendaOpen, setIsEncomendaOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleShelfBuy = (ing: Ingredient) => {
    const cost = ing.score + 2;
    onBuy(ing.code, cost); 
  };

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return [];
    return INGREDIENTS.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const handleSelectEncomenda = (code: string) => {
      if (onBuySpecial) {
          onBuySpecial(16, 'Encomenda', code);
      } else {
          onBuyEncomenda(code, 16);
      }
      setSearchQuery('');
      setIsEncomendaOpen(false);
  };

  return (
    <div className="p-6 watercolor-wash min-h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-5xl font-kalam text-black">Lojinha</h2>
        
        <button 
            onClick={onRefresh}
            disabled={refreshCount === 0}
            className={`p-2 transition-all flex items-center gap-2 rounded-full border border-transparent ${
                refreshCount > 0 
                ? 'text-[#0A9396] hover:bg-[#0A9396]/10 active:scale-90' 
                : 'text-gray-300 cursor-not-allowed bg-gray-50'
            }`}
        >
          <span className="font-bold text-xs">{refreshCount}x</span>
          <RefreshCw size={24} className={refreshCount > 0 ? "hover:rotate-180 transition-transform duration-500" : ""}/>
        </button>
      </div>

      <div className="mb-10">
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-[#FFCA1B] rounded-full"></div> A Prateleira
        </h3>
        <div className="grid grid-cols-2 gap-5">
          {shelfItems.map((ing) => (
            <div key={ing.code} className="paper-slip p-6 rounded-[2rem] flex flex-col items-center group relative overflow-hidden">
              <div className="w-20 h-20 mb-4 flex items-center justify-center">
                {ing.image ? (
                    <img src={ing.image} alt={ing.name} className="w-full h-full object-contain drop-shadow-sm transition-transform group-hover:scale-110 duration-300" />
                ) : (
                    <div className="w-14 h-14 bg-[#FFCA1B]/10 rounded-full flex items-center justify-center border border-[#FFCA1B]/20">
                        <span className="text-[#FFCA1B] font-kalam text-2xl leading-none">{ing.score}</span>
                    </div>
                )}
              </div>
              
              <h4 className="text-[10px] font-bold uppercase text-center mb-5 min-h-[2.5rem] line-clamp-2 px-1 text-black/60 tracking-wider leading-relaxed z-10">{ing.name}</h4>
              
              <button 
                onClick={() => handleShelfBuy(ing)}
                className="w-full bg-[#0A9396] text-white text-[10px] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 btn-watercolor z-10"
              >
                <Coins size={14}/> PAGAR {ing.score + 2}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* === SACO SURPRESA COM IMAGEM === */}
        <div className="paper-slip p-6 rounded-[2.5rem] border border-[#FFCA1B]/20 flex items-center gap-4">
          {/* Substituí o ícone pela imagem */}
          <div className="w-24 h-24 flex-shrink-0 -ml-2">
             <img src={imgSaco} alt="Saco Surpresa" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-kalam text-2xl text-black leading-tight">Saco Surpresa</h3>
            <p className="text-[9px] text-gray-400 mb-4 font-bold uppercase tracking-widest">Item aleatório</p>
            <button 
              onClick={() => onBuySpecial ? onBuySpecial(4, 'Saco') : onBuySaco(4)}
              className="bg-[#FFCA1B] text-black text-[10px] font-bold px-6 py-3 rounded-2xl flex items-center gap-2 btn-watercolor shadow-md border border-black/5"
            >
              <Coins size={14}/> R$ 4.00
            </button>
          </div>
        </div>

        {/* === ENCOMENDA COM IMAGEM === */}
        <div className="bg-[#BA3801] text-white p-6 rounded-[2.5rem] flex items-center gap-4 relative overflow-hidden shadow-2xl">
          <Sparkles className="absolute -right-6 -top-6 w-32 h-32 opacity-10 rotate-12" />
          
          {/* Substituí o ícone pela imagem */}
          <div className="w-24 h-24 flex-shrink-0 -ml-2 relative z-10">
             <img src={imgEncomenda} alt="Encomenda" className="w-full h-full object-contain drop-shadow-md" />
          </div>

          <div className="flex-1 relative z-10">
            <h3 className="font-kalam text-2xl text-white leading-tight">A Encomenda</h3>
            <p className="text-[9px] text-white/60 mb-4 font-bold uppercase tracking-widest">Escolha seu item</p>
            <button 
              onClick={() => setIsEncomendaOpen(true)}
              className={`text-[10px] font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all ${
                coins >= 16 ? 'bg-white text-black btn-watercolor' : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              <Coins size={14}/> R$ 16.00
            </button>
          </div>
        </div>
      </div>

      {isEncomendaOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-24 px-6 bg-black/80 backdrop-blur-sm">
          <div className="paper-slip w-full max-w-sm rounded-[2rem] p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-3xl font-kalam text-black">Encomendar</h3>
               <button onClick={() => setIsEncomendaOpen(false)} className="text-gray-400"><X size={24}/></button>
            </div>
            
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Adicione o nome do ingrediente..."
                    className="w-full bg-gray-50 border border-black/5 rounded-xl py-4 pl-12 pr-4 font-bold outline-none focus:border-[#FFCA1B]"
                />
            </div>

             <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredOptions.length === 0 && searchQuery && (
                    <p className="text-center text-gray-400 text-xs py-4">Nada encontrado...</p>
                )}
                {filteredOptions.map((item) => (
                    <button
                        key={item.code}
                        onClick={() => handleSelectEncomenda(item.code)}
                        className="w-full text-left p-3 rounded-xl bg-white border border-black/5 hover:bg-[#BA3801]/10 hover:border-[#BA3801] transition-colors flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            {item.image ? (
                                <img src={item.image} alt="" className="w-8 h-8 object-contain rounded-md" />
                            ) : (
                                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center font-bold text-[10px] text-gray-400">
                                    {item.score}
                                </div>
                            )}
                            <span className="font-bold text-black/80">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#BA3801] opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase">
                            <span>R$ 16</span> <Coins size={12}/>
                        </div>
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
