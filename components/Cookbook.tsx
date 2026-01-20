import React, { useState } from 'react';
import { RECIPES, STATES_MAP } from '../constants';
import { Recipe } from '../types';
import { Search, MapPin, ChevronRight, X, ChefHat, Utensils } from 'lucide-react';

const Cookbook: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = RECIPES.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState ? recipe.state === selectedState : true;
    return matchesSearch && matchesState;
  });

  const states = Object.keys(STATES_MAP);

  return (
    <div className="p-6 watercolor-wash min-h-full">
      <h2 className="text-5xl font-kalam text-black mb-8">Receitas</h2>

      <div className="sticky top-0 z-20 bg-[#fdf6e3]/90 backdrop-blur-md pt-2 pb-6 space-y-5 mb-4">
        <div className="relative paper-slip rounded-2xl overflow-hidden border-black/5">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Procurar petisco..."
            className="w-full bg-transparent py-5 pl-14 pr-6 text-black font-bold focus:bg-white outline-none transition-all placeholder:text-gray-300 shadow-inner"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setSelectedState(null)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${
              selectedState === null ? 'bg-[#FF3401] text-white border-black/5 shadow-md' : 'bg-white text-gray-400 border-black/5'
            }`}
          >
            Todos
          </button>
          {states.map(state => (
            <button 
              key={state}
              onClick={() => setSelectedState(state)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${
                selectedState === state ? 'bg-[#FF3401] text-white border-black/5 shadow-md' : 'bg-white text-gray-400 border-black/5'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <div 
              key={recipe.code}
              onClick={() => setActiveRecipe(recipe)}
              className="paper-slip p-6 rounded-[2.5rem] flex items-center gap-5 group active:scale-[0.97] transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="w-20 h-20 bg-[#FFCA1B]/10 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 border border-[#FFCA1B]/10">
                <span className="text-[#FFCA1B] font-kalam text-3xl">{recipe.value}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400 uppercase mb-1 tracking-widest">
                  <MapPin size={10} />
                  <span>{STATES_MAP[recipe.state]}</span>
                </div>
                <h3 className="font-kalam text-2xl text-black truncate leading-tight group-hover:text-[#FF3401] transition-colors">{recipe.name}</h3>
                <p className="text-[9px] font-mono text-gray-300 tracking-wider mt-1">{recipe.code}</p>
              </div>
              <div className="text-gray-300 group-hover:text-[#FF3401] transition-colors">
                 <ChevronRight size={24}/>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 opacity-20">
            <ChefHat size={60} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-[10px]">Sem petiscos...</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeRecipe && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          {/* REMOVIDO A CLASSE 'torn-edge' DAQUI */}
          <div className="paper-slip w-full max-w-sm rounded-[3.5rem] p-10 animate-in slide-in-from-bottom-8 duration-500 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <button onClick={() => setActiveRecipe(null)} className="text-gray-400 hover:text-black transition-all bg-white rounded-full p-2 shadow-sm"><X size={24}/></button>
            </div>
            
            <div className="flex flex-col items-center text-center mb-10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-3">{STATES_MAP[activeRecipe.state]}</span>
              <h3 className="text-4xl font-kalam text-black leading-tight mb-4">{activeRecipe.name}</h3>
              <div className="bg-[#FFCA1B] px-6 py-2 rounded-full font-bold text-black text-xs shadow-md flex items-center gap-2">
                <Utensils size={14}/> SCORE: {activeRecipe.value}
              </div>
            </div>

            <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#FF3401] rounded-full"></div> Ingredientes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeRecipe.ingredients.map((ing, i) => (
                    <span key={i} className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-bold text-black/60 uppercase border border-black/5">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[#FF3401] rounded-full"></div> Modo de Preparo
                </h4>
                <p className="text-black/80 text-sm leading-relaxed italic paper-slip p-6 rounded-3xl border border-black/5 shadow-inner bg-[#fffefc]">
                  "{activeRecipe.instructions}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cookbook;
