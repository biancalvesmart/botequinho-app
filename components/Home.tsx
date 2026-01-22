import React, { useState, useEffect, useMemo } from 'react';
import { PlayerData } from '../types';
import { RECIPES, INGREDIENTS } from '../constants';
import { Flame, Plus, ChevronLeft, ChevronRight, X, Search, CheckCircle2, Utensils, Package } from 'lucide-react';

interface HomeProps {
  player: PlayerData;
  onDeliver: (potId: number) => void;
  onGiveUp: (potId: number) => void;
  onAddCode: (code: string) => boolean;
  onResetSession: () => void;
}

const Home: React.FC<HomeProps> = ({ player, onDeliver, onGiveUp, onAddCode, onResetSession }) => {
  const [activePotIdx, setActivePotIdx] = useState(0);
  const [activeModalType, setActiveModalType] = useState<'recipe' | 'ingredient' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readyPotId, setReadyPotId] = useState<number | null>(null);

  // --- BUSCA SEPARADA ---
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();

    if (activeModalType === 'recipe') {
        return RECIPES.filter(r => r.name.toLowerCase().includes(lower)).map(r => ({...r, type: 'rec'}));
    } else if (activeModalType === 'ingredient') {
        return INGREDIENTS.filter(i => i.name.toLowerCase().includes(lower)).map(i => ({...i, type: 'ing'}));
    }
    return [];
  }, [searchQuery, activeModalType]);

  const handleSelectOption = (code: string) => {
    onAddCode(code);
    setSearchQuery('');
    setActiveModalType(null);
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

      if (recipe.ingredients.length > 0 && requiredCodes.length !== recipe.ingredients.length) return false;

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

      {/* TÍTULO RECEITAS + PONTINHOS */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <h3 className="text-2xl font-kalam text-black">Receitas</h3>
            <div className="flex gap-1.5 bg-black/5 px-2 py-1.5 rounded-full">
               <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activePotIdx === 0 ? 'bg-[#BA3801] w-4' : 'bg-gray-300'}`}></div>
               <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activePotIdx === 1 ? 'bg-[#BA3801] w-4' : 'bg-gray-300'}`}></div>
            </div>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase">
            {player.pots.filter(p => p.recipeCode).length} em preparo
        </span>
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
                    <div className="animate-in fade-in duration-500 w-full flex flex-col items-center">
                      {/* --- AQUI: MOSTRA A FOTO OU O FOGO --- */}
                      <div className="w-24 h-24 bg-[#FFCA1B]/20 rounded-full flex items-center justify-center mb-6 overflow-hidden border-2 border-white shadow-sm">
                          {recipe.image ? (
                              <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                          ) : (
                              <Flame size={40} className="text-[#BA3801]" />
                          )}
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
                      onClick={() => setActiveModalType('recipe')}
                      className="w-full flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-all group"
                    >
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#FFCA1B]/20 group-hover:text-[#FFCA1B] transition-colors">
                          <Plus size={32} />
                        </div>
                        <p className="font-kalam text-xl text-gray-400 group-hover:text-black transition-colors">Panela vazia...</p>
                        <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-300 group-hover:text-[#FFCA1B] transition-colors">
                          ADICIONAR RECEITA
                        </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-1 pointer-events-none">
            <button onClick={() => setActivePotIdx(0)} className={`pointer-events-auto p-2 ${activePotIdx === 0 ? 'opacity-0' : 'opacity-100 text-gray-400'}`}><ChevronLeft/></button>
            <button onClick={() => setActivePotIdx(1)} className={`pointer-events-auto p-2 ${activePotIdx === 1 ? 'opacity-0' : 'opacity-100 text-gray-400'}`}><ChevronRight/></button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-kalam text-black">Ingredientes</h3>
        <span className="text-[10px] font-bold text-gray-400 uppercase">{player.inventory.length} itens</span>
      </div>

      {player.inventory.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {/* BOTÃO DE ADICIONAR */}
          <button 
            onClick={() => setActiveModalType('ingredient')}
            className="paper-slip p-4 rounded-2xl flex flex-col items-center justify-center text-center transform hover:scale-[1.02] transition-transform border-2 border-dashed border-gray-200 hover:border-[#0A9396]/30 group min-h-[100px]"
          >
             <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-[#0A9396]/10 group-hover:text-[#0A9396] transition-colors">
                <Plus size={16}/>
             </div>
             <span className="text-[8px] font-bold text-gray-400 uppercase group-hover:text-[#0A9396]">Adicionar</span>
          </button>

          {/* LISTA DE INGREDIENTES COM FOTO */}
          {player.inventory.map((code, idx) => {
            const ing = INGREDIENTS.find(i => i.code === code);
            return (
              <div key={`${code}-${idx}`} className="paper-slip p-3 rounded-2xl flex flex-col items-center text-center transform hover:rotate-2 transition-transform min-h-[100px] justify-center relative overflow-hidden">
                
                {/* --- AQUI: MOSTRA A FOTO OU O SCORE --- */}
                <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    {ing?.image ? (
                        <img src={ing.image} alt={ing.name} className="w-full h-full object-contain drop-shadow-sm" />
                    ) : (
                        <span className="text-lg font-kalam text-[#0A9396] leading-none">{ing?.score}</span>
                    )}
                </div>

                <span className="text-[10px] font-bold text-black/70 leading-tight uppercase line-clamp-2 px-1 relative z-10">{ing?.name}</span>
                
                {/* Badge pequeno de pontos se tiver imagem */}
                {ing?.image && (
                    <span className="absolute top-1 right-1 bg-[#0A9396]/10 text-[#0A9396] text-[8px] font-bold px-1.5 rounded-md">
                        {ing.score}
                    </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* CARD CESTA VAZIA */
        <div className="paper-slip p-8 rounded-[3rem] border border-black/5 flex flex-col items-center min-h-[320px] justify-center text-center relative animate-in zoom-in duration-300">
            <button 
                onClick={() => setActiveModalType('ingredient')}
                className="w-full flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-all group"
            >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#0A9396]/20 group-hover:text-[#0A9396] transition-colors">
                    <Plus size={32} />
                </div>
                <p className="font-kalam text-xl text-gray-400 group-hover:text-black transition-colors">Cesta vazia...</p>
                <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-300 group-hover:text-[#0A9396] transition-colors">
                    ADICIONAR INGREDIENTE
                </span>
            </button>
        </div>
      )}

      {/* FAB FLUTUANTE */}
      {player.inventory.length > 0 && (
        <button 
            onClick={() => setActiveModalType('ingredient')}
            className="fixed bottom-28 right-8 w-16 h-16 bg-[#0A9396] text-white rounded-full shadow-2xl flex items-center justify-center btn-watercolor z-30 active:scale-95 transition-transform"
        >
            <Plus size={32} />
        </button>
      )}

      {/* MODAL DE BUSCA COM FOTOS */}
      {activeModalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-start justify-center pt-24 px-6">
          <div className="paper-slip w-full max-w-sm rounded-[2rem] p-6 animate-in slide-in-from-bottom-10 duration-200">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-kalam text-black leading-tight">
                   {activeModalType === 'recipe' ? 'Adicionar Receita' : 'Adicionar Ingrediente'}
               </h3>
               <button onClick={() => setActiveModalType(null)} className="text-gray-400"><X size={24}/></button>
            </div>
            
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome"
                    className="w-full bg-gray-50 border border-black/5 rounded-xl py-4 pl-12 pr-4 font-bold outline-none focus:border-[#BA3801]"
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
                        className="w-full text-left p-3 rounded-xl bg-white border border-black/5 hover:bg-[#BA3801]/10 hover:border-[#BA3801] transition-colors flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            {/* --- MINIATURA NA BUSCA --- */}
                            {item.image ? (
                                <img src={item.image} alt="" className="w-8 h-8 object-contain rounded-md" />
                            ) : (
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${item.type === 'rec' ? 'bg-[#FFCA1B]/20' : 'bg-[#0A9396]/20'}`}>
                                    {item.type === 'rec' ? <Utensils size={14}/> : <Package size={14}/>}
                                </div>
                            )}
                            <span className="font-bold text-black/80">{item.name}</span>
                        </div>

                        {item.type === 'rec' && (
                            <span className="bg-[#FFCA1B]/20 text-[#BA3801] text-[10px] px-2 py-1 rounded-md font-bold">
                                {item.value} pts
                            </span>
                        )}
                        {item.type === 'ing' && (
                            <span className="bg-[#0A9396]/10 text-[#0A9396] text-[10px] px-2 py-1 rounded-md font-bold">
                                {item.score} pts
                            </span>
                        )}
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}

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
