import React, { useState, useMemo } from 'react';
import { RECIPES, INGREDIENTS, STATES_MAP } from '../constants';
import { Recipe, Ingredient } from '../types';
import { Search, MapPin, ChevronRight, X, ChefHat, Utensils, Package, BookOpen, Hash } from 'lucide-react';

const Cookbook: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients'>('recipes');
  
  // Modais
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [activeIngredient, setActiveIngredient] = useState<Ingredient | null>(null);

  const states = Object.keys(STATES_MAP);

  // Filtros
  const filteredRecipes = useMemo(() => {
    return RECIPES.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = selectedState ? recipe.state === selectedState : true;
      return matchesSearch && matchesState;
    });
  }, [searchTerm, selectedState]);

  const filteredIngredients = useMemo(() => {
    return INGREDIENTS.filter(ing => 
      ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="p-6 watercolor-wash min-h-full pb-32">
      <h2 className="text-5xl font-kalam text-black mb-8">Catálogo</h2>

      {/* BARRA DE BUSCA E ABAS */}
      <div className="sticky top-0 z-20 bg-[#fdf6e3]/90 backdrop-blur-md pt-2 pb-2 space-y-4 mb-4">
        <div className="relative paper-slip rounded-2xl overflow-hidden border-black/5">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome"
            className="w-full bg-transparent py-5 pl-14 pr-6 text-black font-bold focus:bg-white outline-none transition-all placeholder:text-gray-300 shadow-inner"
          />
        </div>

        {/* SELETOR DE ABAS */}
        <div className="flex bg-gray-200/50 p-1.5 rounded-2xl">
            <button 
                onClick={() => { setActiveTab('recipes'); setSelectedState(null); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'recipes' ? 'bg-white text-black shadow-sm' : 'text-gray-400'
                }`}
            >
                <BookOpen size={14}/> Receitas
            </button>
            <button 
                onClick={() => setActiveTab('ingredients')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'ingredients' ? 'bg-white text-black shadow-sm' : 'text-gray-400'
                }`}
            >
                <Package size={14}/> Ingredientes
            </button>
        </div>

        {/* FILTRO DE ESTADOS (APENAS PARA RECEITAS) */}
        {activeTab === 'recipes' && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar animate-in slide-in-from-top-2 duration-300">
            <button 
                onClick={() => setSelectedState(null)}
                className={`px-6 py-2 rounded-xl text-[9px] font-bold uppercase whitespace-nowrap transition-all border ${
                selectedState === null ? 'bg-[#BA3801] text-white border-black/5 shadow-md' : 'bg-white text-gray-400 border-black/5'
                }`}
            >
                Todos
            </button>
            {states.map(state => (
                <button 
                key={state}
                onClick={() => setSelectedState(state)}
                className={`px-6 py-2 rounded-xl text-[9px] font-bold uppercase whitespace-nowrap transition-all border ${
                    selectedState === state ? 'bg-[#BA3801] text-white border-black/5 shadow-md' : 'bg-white text-gray-400 border-black/5'
                }`}
                >
                {state}
                </button>
            ))}
            </div>
        )}
      </div>

      {/* LISTA DE CONTEÚDO */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* === ABA RECEITAS === */}
        {activeTab === 'recipes' && (
            filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
                <div 
                key={recipe.code}
                onClick={() => setActiveRecipe(recipe)}
                className="paper-slip p-6 rounded-[2.5rem] flex items-center gap-5 group active:scale-[0.97] transition-all cursor-pointer hover:shadow-lg"
                >
                {/* Imagem na lista */}
                <div className="w-16 h-16 bg-[#FFCA1B]/10 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 border border-[#FFCA1B]/10 overflow-hidden">
                    {recipe.image ? (
                        <img src={recipe.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[#FFCA1B] font-kalam text-2xl">{recipe.value}</span>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400 uppercase mb-1 tracking-widest">
                    <MapPin size={10} />
                    <span>{STATES_MAP[recipe.state]}</span>
                    </div>
                    <h3 className="font-kalam text-xl text-black truncate leading-tight group-hover:text-[#BA3801] transition-colors">{recipe.name}</h3>
                    <p className="text-[9px] font-mono text-gray-300 tracking-wider mt-1">{recipe.code}</p>
                </div>
                <div className="text-gray-300 group-hover:text-[#BA3801] transition-colors">
                    <ChevronRight size={24}/>
                </div>
                </div>
            ))
            ) : (
            <div className="text-center py-24 opacity-20">
                <ChefHat size={60} className="mx-auto mb-4" />
                <p className="font-bold uppercase tracking-widest text-[10px]">Sem receitas...</p>
            </div>
            )
        )}

        {/* === ABA INGREDIENTES === */}
        {activeTab === 'ingredients' && (
            filteredIngredients.length > 0 ? (
                filteredIngredients.map((ing) => (
                    <div 
                    key={ing.code}
                    onClick={() => setActiveIngredient(ing)}
                    className="paper-slip p-6 rounded-[2.5rem] flex items-center gap-5 group active:scale-[0.97] transition-all cursor-pointer hover:shadow-lg"
                    >
                    {/* Imagem na lista */}
                    <div className="w-16 h-16 bg-[#FFCA1B]/10 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 border border-[#FFCA1B]/10 overflow-hidden">
                        {ing.image ? (
                            <img src={ing.image} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                            <span className="text-[#FFCA1B] font-kalam text-2xl">{ing.score}</span>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400 uppercase mb-1 tracking-widest">
                        <Package size={10} />
                        <span>Ingrediente</span>
                        </div>
                        <h3 className="font-kalam text-xl text-black truncate leading-tight group-hover:text-[#FFCA1B] transition-colors">{ing.name}</h3>
                        <p className="text-[9px] font-mono text-gray-300 tracking-wider mt-1">{ing.code}</p>
                    </div>
                    <div className="text-gray-300 group-hover:text-[#FFCA1B] transition-colors">
                        <ChevronRight size={24}/>
                    </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-24 opacity-20">
                    <Package size={60} className="mx-auto mb-4" />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Sem ingredientes...</p>
                </div>
            )
        )}

      </div>

      {/* === MODAL RECEITA COM IMAGEM === */}
      {activeRecipe && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="paper-slip w-full max-w-sm rounded-[3.5rem] p-8 animate-in slide-in-from-bottom-8 duration-500 relative shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="absolute top-0 right-0 p-8 z-10">
              <button onClick={() => setActiveRecipe(null)} className="text-gray-400 hover:text-black transition-all bg-white rounded-full p-2 shadow-sm"><X size={24}/></button>
            </div>
            
            <div className="flex flex-col items-center text-center mb-6">
              {/* IMAGEM GRANDE NO MODAL */}
              <div className="w-32 h-32 mb-4 rounded-full bg-[#FFCA1B]/10 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                  {activeRecipe.image ? (
                      <img src={activeRecipe.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                      <Utensils size={40} className="text-[#FFCA1B]"/>
                  )}
              </div>

              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">{STATES_MAP[activeRecipe.state]}</span>
              <h3 className="text-3xl font-kalam text-black leading-tight mb-3 px-4">{activeRecipe.name}</h3>
              <div className="bg-[#FFCA1B] px-6 py-2 rounded-full font-bold text-black text-xs shadow-md flex items-center gap-2">
                <Utensils size={14}/> SCORE: {activeRecipe.value}
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#BA3801] rounded-full"></div> Ingredientes
                </h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {activeRecipe.ingredients.map((ing, i) => (
                    <span key={i} className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-bold text-black/60 uppercase border border-black/5">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[#BA3801] rounded-full"></div> Modo de Preparo
                </h4>
                <p className="text-black/80 text-xs leading-relaxed italic paper-slip p-5 rounded-3xl border border-black/5 shadow-inner bg-[#fffefc] text-justify">
                  "{activeRecipe.instructions}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL INGREDIENTE COM IMAGEM === */}
      {activeIngredient && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="paper-slip w-full max-w-sm rounded-[3.5rem] p-10 animate-in slide-in-from-bottom-8 duration-500 relative shadow-2xl overflow-hidden text-center">
            <div className="absolute top-0 right-0 p-8">
              <button onClick={() => setActiveIngredient(null)} className="text-gray-400 hover:text-black transition-all bg-white rounded-full p-2 shadow-sm"><X size={24}/></button>
            </div>
            
            {/* IMAGEM GRANDE NO MODAL */}
            <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                {activeIngredient.image ? (
                    <img src={activeIngredient.image} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                ) : (
                    <div className="w-24 h-24 bg-[#FFCA1B]/10 rounded-full flex items-center justify-center border border-[#FFCA1B]/20">
                        <span className="text-[#FFCA1B] font-kalam text-4xl">{activeIngredient.score}</span>
                    </div>
                )}
            </div>
            
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-3 block">INGREDIENTE</span>
            <h3 className="text-4xl font-kalam text-black leading-tight mb-4">{activeIngredient.name}</h3>
            
            <div className="bg-[#FFCA1B] px-6 py-2 rounded-full font-bold text-black text-xs shadow-md inline-flex items-center gap-2 mb-8">
              <Utensils size={14}/> SCORE: {activeIngredient.score}
            </div>

            <div className="text-left">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#FFCA1B] rounded-full"></div> Código do Item
                </h4>
                <div className="flex flex-col gap-3">
                    <div className="paper-slip p-6 rounded-3xl border border-black/5 shadow-inner bg-[#fffefc] flex items-center justify-center gap-3">
                        <Hash className="text-gray-300" size={20}/>
                        <span className="font-mono text-xl font-bold text-black/70 tracking-widest">{activeIngredient.code}</span>
                    </div>
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase px-4 mt-2">
                        Use este item para completar receitas.
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
