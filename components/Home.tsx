import React, { useState, useEffect, useMemo } from 'react';
import { PlayerData } from '../types';
import { RECIPES, INGREDIENTS } from '../constants';
import { Flame, Plus, ChevronLeft, ChevronRight, X, Search, CheckCircle2, LogOut, AlertTriangle } from 'lucide-react';

interface HomeProps {
  player: PlayerData;
  onDeliver: (potId: number) => void;
  onGiveUp: (potId: number) => void;
  onAddCode: (code: string) => boolean;
  onResetSession: () => void;
}

const Home: React.FC<HomeProps> = ({ player, onDeliver, onGiveUp, onAddCode, onResetSession }) => {
  const [activePotIdx, setActivePotIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [readyPotId, setReadyPotId] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false); // Modal de Sair

  // Busca Inteligente
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();
    const ings = INGREDIENTS.filter(i => i.name.toLowerCase().includes(lower)).map(i => ({...i, type: 'ing'}));
    const recs = RECIPES.filter(r => r.name.toLowerCase().includes(lower)).map(r => ({...r, type: 'rec'}));
    return [...ings, ...recs];
  }, [searchQuery]);

  const handleSelectOption = (code: string) => {
    onAddCode(code);
    setSearchQuery('');
    setIsModalOpen(false);
  };

  // Detector de Receita Pronta
  useEffect(() => {
    const potWithCompleteRecipe = player.pots.find(pot => {
      if (!pot.recipeCode) return false;
      const recipe = RECIPES.find(r => r.code === pot.recipeCode);
      if (!recipe) return false;

      const requiredCodes = recipe.ingredients.map(name => {
          const ing = INGREDIENTS.find(i => i.name === name);
          return ing ? ing.code : null;
      }).filter(c => c !== null) as string[];

      const playerInv = [...player.inventory];
      const hasAll = requiredCodes.every(reqCode => {
          const idx = playerInv.indexOf(reqCode);
          if (idx !== -1) {
              playerInv.splice(idx, 1);
              return true;
          }
          return false;
      });
      return hasAll;
    });

    setReadyPotId(potWithCompleteRecipe ? potWithCompleteRecipe.id : null);
  }, [player.inventory, player.pots]);

  const handleDeliverReady = () => {
      if (readyPotId !== null) {
          onDeliver(readyPotId);
          setReadyPotId(null);
      }
  };

  return (
    <div className="p-6 watercolor-wash min-h-full relative pb-32">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-kalam text-black">Minha Mesa</h2>
      </div>

      {/* CARROSSEL DE PANELAS */}
      <div className="relative overflow-hidden mb-12">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activePotIdx * 100}%)` }}>
          {player.pots.map((pot) => {
            const recipe = pot.recipeCode ? RECIPES.find(r => r.code === pot.recipeCode) : null;
            return (
              <div key={pot.id} className="min-w-full px-2">
                <div className="paper-slip p-8 rounded-[3rem] border border-black/5 flex flex-col items-center min-h-[320px] justify-center text-center relative">
                  {recipe ? (
                    <div className="animate-in fade-in duration-500 w-full">
                      <div className="w-20 h-20 bg-[#FFCA1B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Flame size={40} className="text-[#FF3401]" />
                      </div>
                      <h3 className="text-3xl font-kalam text-black mb-1 leading-tight">{recipe.name}</h3>
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest block mb-8">Cozinhando...</span>
                      
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
                          ADICIONAR
                        </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-1 pointer-events-none">
            <button onClick={() => setActivePotIdx(0)} className={`pointer-events-auto p-2 ${activePotIdx === 0 ? 'opacity-0' : 'opacity-100'}`}><ChevronLeft/></button>
            <button onClick={() => setActivePotIdx(1)} className={`pointer-events-auto p-2 ${activePotIdx === 1 ? 'opacity-0' : 'opacity-100'}`}><ChevronRight/></button>
        </div>
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

      {/* BOTÃO ENCERRAR MESA (Agora no final da página) */}
      <div className="mt-12 mb-8 flex justify-center">
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest hover:text-red-600 transition-colors px-6 py-3 rounded-full hover:bg-red-50"
          >
              <LogOut size={16}/> Encerrar Mesa
          </button>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE SAÍDA */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
            <div className="paper-slip w-full max-w-xs rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-200">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32}/>
                </div>
                <h3 className="font-kalam text-2xl mb-2">Encerrar tudo?</h3>
                <p className="text-sm text-gray-500 mb-8">Isso vai apagar o jogo para todos os jogadores. Tem certeza?</p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowExitConfirm(false)}
                        className="flex-1 py-3 font-bold text-gray-400 uppercase text-xs rounded-xl hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onResetSession}
                        className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-md"
                    >
                        Sim, Encerrar
                    </button>
                </div>
            </div>
        </div>
      )}

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-28 right-8 w-16 h-16 bg-[#FF3401] text-white rounded-full shadow-2xl flex items-center justify-center btn-watercolor z-30 active:scale-95 transition-transform"
      >
        <Plus size={32} />
      </button>

      {/* MODAL DE BUSCA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-start justify-center pt-24 px-6">
          <div className="paper-slip w-full max-w-sm rounded-[2rem] p-6 animate-in slide-in-from-bottom-10 duration-200">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-2xl font-kalam text-black">Adicionar</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400"><X size={24}/></button>
            </div>
            
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Busque por nome..."
                    className="w-full bg-gray-50 border border-black/5 rounded-xl py-4 pl-12 pr-4 font-bold outline-none focus:border-[#FFCA1B]"
                />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredOptions.length === 0 && searchQuery && (
                    <p className="text-center text-gray-400 text-xs py-4">Nada encontrado...</p>
                )}
                {filteredOptions.map((item: any) => (
                    <button
                        key={item.code}
                        onClick={() => handleSelectOption(item.code)}
                        className="w-full text-left p-4 rounded-xl bg-white border border-black/5 hover:bg-[#FFCA1B]/10 hover:border-[#FFCA1B] transition-colors flex items-center justify-between group"
                    >
                        <span className="font-bold text-black/80">{item.name}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-300 group-hover:text-[#FFCA1B]">
                            {item.type === 'ing' ? 'Ingrediente' : 'Receita'}
                        </span>
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* POP-UP DE RECEITA COMPLETA */}
      {readyPotId !== null && (
         <div className="fixed bottom-24 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 duration-500">
             <div className="bg-[#588A48] text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between border-2 border-white/20">
                 <div>
                     <h4 className="font-kalam text-xl leading-none mb-1">Receita Pronta!</h4>
                     <p className="text-[10px] font-bold uppercase opacity-80">Ingredientes completos</p>
                 </div>
                 <button 
                    onClick={handleDeliverReady}
                    className="bg-white text-[#588A48] px-6 py-3 rounded-xl font-bold text-xs uppercase shadow-md active:scale-95 transition-transform flex items-center gap-2"
                 >
                     <CheckCircle2 size={16}/> Entregar
                 </button>
             </div>
         </div>
      )}
    </div>
  );
};

export default Home;
