
import React, { useState } from 'react';
import { PlayerData } from '../types';
import { RECIPES, INGREDIENTS } from '../constants';
import { Flame, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface HomeProps {
  player: PlayerData;
  onDeliver: (potId: number) => void;
  onGiveUp: (potId: number) => void;
  onAddCode: (code: string) => boolean;
}

const Home: React.FC<HomeProps> = ({ player, onDeliver, onGiveUp, onAddCode }) => {
  const [activePotIdx, setActivePotIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputCode, setInputCode] = useState('');

  const handleAddCode = () => {
    if (onAddCode(inputCode)) {
      setInputCode('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-6 watercolor-wash min-h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-kalam text-black">Minha Mesa</h2>
        <div className="flex gap-1.5">
           <div className={`w-2 h-2 rounded-full transition-all ${activePotIdx === 0 ? 'bg-[#FF3401]' : 'bg-gray-200'}`}></div>
           <div className={`w-2 h-2 rounded-full transition-all ${activePotIdx === 1 ? 'bg-[#FF3401]' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      <div className="relative overflow-hidden mb-12">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activePotIdx * 100}%)` }}>
          {player.pots.map((pot) => {
            const recipe = pot.recipeCode ? RECIPES.find(r => r.code === pot.recipeCode) : null;
            return (
              <div key={pot.id} className="min-w-full px-2">
                <div className="paper-slip p-8 rounded-[3rem] border border-black/5 flex flex-col items-center min-h-[320px] justify-center text-center">
                  {recipe ? (
                    <div className="animate-in fade-in duration-500 w-full">
                      <div className="w-20 h-20 bg-[#FFCA1B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                         <Flame size={40} className="text-[#FF3401]" />
                      </div>
                      <h3 className="text-3xl font-kalam text-black mb-1">{recipe.name}</h3>
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest block mb-8">{recipe.code}</span>
                      
                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={() => onGiveUp(pot.id)}
                          className="flex-1 bg-gray-50 text-gray-400 font-bold py-4 rounded-2xl border border-black/5 hover:bg-gray-100 transition-all text-xs"
                        >
                          DESCARTAR
                        </button>
                        <button 
                          onClick={() => onDeliver(pot.id)}
                          className="flex-1 bg-[#588A48] text-white font-bold py-4 rounded-2xl shadow-lg btn-watercolor text-xs"
                        >
                          ENTREGAR
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-all group"
                    >
                       <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#FFCA1B]/20 group-hover:text-[#FFCA1B] transition-colors">
                          <Plus size={32} />
                       </div>
                       <p className="font-kalam text-xl">Panela vazia...</p>
                       <span className="mt-4 text-[10px] font-bold uppercase tracking-widest">
                         ADICIONAR RECEITA
                       </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <button onClick={() => setActivePotIdx(0)} className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 ${activePotIdx === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronLeft/></button>
        <button onClick={() => setActivePotIdx(1)} className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 ${activePotIdx === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronRight/></button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-kalam text-black">Ingredientes</h3>
        <span className="text-[10px] font-bold text-gray-400 uppercase">{player.inventory.length} itens</span>
      </div>

      {player.inventory.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {player.inventory.map((code, idx) => {
            const ing = INGREDIENTS.find(i => i.code === code);
            return (
              <div key={`${code}-${idx}`} className="paper-slip p-4 rounded-2xl flex flex-col items-center text-center transform hover:rotate-2 transition-transform">
                <div className="text-lg font-kalam text-[#FFCA1B] mb-1 leading-none">{ing?.score}</div>
                <span className="text-[10px] font-bold text-black/70 leading-tight uppercase line-clamp-1">{ing?.name}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="paper-slip p-12 rounded-[2.5rem] text-center opacity-30 italic">
           <p className="text-sm font-bold uppercase tracking-widest">Cesta Vazia</p>
        </div>
      )}

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-28 right-8 w-16 h-16 bg-[#FF3401] text-white rounded-full shadow-2xl flex items-center justify-center btn-watercolor z-30"
      >
        <Plus size={32} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="paper-slip w-full max-w-xs rounded-[3rem] p-10 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-3xl font-kalam text-black">Adicionar Código</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400"><X size={24}/></button>
            </div>
            <input 
               autoFocus
               type="text"
               value={inputCode}
               onChange={(e) => setInputCode(e.target.value.toUpperCase())}
               placeholder="Ex: I-1-0-1"
               className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-5 text-center font-mono text-xl focus:border-[#FFCA1B] outline-none mb-8"
            />
            <button 
               onClick={handleAddCode}
               className="w-full bg-[#FFCA1B] text-black font-bold py-5 rounded-2xl btn-watercolor uppercase text-sm"
            >
               Processar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
