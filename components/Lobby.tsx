import React, { useState, useEffect } from 'react';
import { SESSION_CODE } from '../constants';
import { ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';

// 👇 IMPORTANDO AS NOVAS IMAGENS
import imgLogo from '../assets/idvisual/Logotipo.png';
import imgFundo from '../assets/idvisual/FundoLobby.png';

interface LobbyProps {
  onJoin: (name: string) => void;
  onStart: () => void;
  onReset: () => void;
  players: string[];
  currentName: string;
}

const Lobby: React.FC<LobbyProps> = ({ onJoin, onStart, players = [], currentName }) => {
  const [step, setStep] = useState<'logo' | 'code' | 'name' | 'waiting'>('logo');
  const [inputCode, setInputCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const safePlayers = Array.isArray(players) ? players : [];

  useEffect(() => {
    if (currentName && safePlayers.includes(currentName)) {
      setStep('waiting');
    }
  }, [currentName, safePlayers]);

  const handleNext = () => {
    if (step === 'logo') {
      setStep('code');
    } else if (step === 'code') {
      if (inputCode === SESSION_CODE) {
        setError('');
        setStep('name');
      } else {
        setError('Código inválido! Tente TAB-0-0-0');
      }
    } else if (step === 'name') {
      if (playerName.trim().length > 2) {
        onJoin(playerName);
      } else {
        setError('Nome muito curto!');
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-8 py-12 text-center overflow-hidden">
      
      {/* --- FUNDO COM IMAGEM E TRANSPARÊNCIA --- */}
      <div 
        className="absolute inset-0 z-0"
        style={{
            backgroundImage: `url('${imgFundo}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4, // 60% de transparência
        }}
      />

      {/* --- CONTEÚDO (Fica por cima do fundo) --- */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {step === 'logo' && (
          <div className="animate-in fade-in zoom-in duration-1000 flex flex-col items-center w-full">
            {/* SUBSTITUIÇÃO DO ÍCONE E TÍTULO PELA LOGO */}
            <img 
                src={imgLogo} 
                alt="Botequinho" 
                className="w-64 md:w-80 object-contain mb-12 drop-shadow-xl" 
            />
            
            <button 
              onClick={handleNext}
              className="w-full max-w-xs bg-[#FF3401] text-white font-bold text-lg py-4 rounded-2xl transition-all shadow-xl btn-watercolor active:scale-95 transform"
            >
              Entrar no Boteco
            </button>
          </div>
        )}

        {step === 'code' && (
          <div className="w-full max-w-xs animate-in slide-in-from-bottom duration-500">
            <h2 className="text-4xl font-kalam text-black mb-10 drop-shadow-sm">Qual a Mesa?</h2>
            <div className="paper-slip p-8 rounded-3xl mb-8 transform -rotate-1 shadow-lg bg-white/90 backdrop-blur-sm">
               <input 
                type="text" 
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="TAB-0-0-0"
                className="w-full bg-transparent border-b-2 border-black/10 py-3 text-center font-mono text-2xl tracking-widest focus:border-[#FFCA1B] outline-none transition-all placeholder:text-gray-300"
              />
            </div>
            {error && <p className="text-[#FF3401] text-xs font-bold uppercase mb-6 flex items-center justify-center gap-1 bg-white/50 py-1 rounded-lg"><AlertTriangle size={14}/> {error}</p>}
            <button 
              onClick={handleNext}
              className="w-full bg-[#0A9396] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 btn-watercolor shadow-lg"
            >
              Verificar Mesa <ChevronRight size={20}/>
            </button>
          </div>
        )}

        {step === 'name' && (
          <div className="w-full max-w-xs animate-in slide-in-from-bottom duration-500">
            <h2 className="text-4xl font-kalam text-black mb-10 drop-shadow-sm">Quem é você?</h2>
            <div className="paper-slip p-8 rounded-3xl mb-8 transform rotate-1 shadow-lg bg-white/90 backdrop-blur-sm">
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Seu nome ou apelido"
                className="w-full bg-transparent border-b-2 border-black/10 py-3 text-center text-xl font-bold focus:border-[#588A48] outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
            {error && <p className="text-[#FF3401] text-xs font-bold uppercase mb-6 bg-white/50 py-1 rounded-lg">{error}</p>}
            <button 
              onClick={handleNext}
              className="w-full bg-[#588A48] text-white font-bold py-4 rounded-2xl btn-watercolor shadow-lg"
            >
              Pronto!
            </button>
          </div>
        )}

        {step === 'waiting' && (
          <div className="w-full max-w-sm animate-in zoom-in duration-500">
            <h2 className="text-4xl font-kalam text-black mb-8 drop-shadow-sm">Aguardando...</h2>
            <div className="paper-slip p-8 rounded-3xl mb-10 text-left shadow-2xl bg-white/95 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                 <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">Jogadores Online</span>
                 <span className="bg-[#FFCA1B] text-black text-[10px] px-2 py-1 rounded font-black">{safePlayers.length}/4</span>
              </div>
              
              <div className="space-y-4">
                {safePlayers.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-[#588A48]" />
                    <span className="font-bold text-black text-lg">{p}</span>
                    {p === currentName && <span className="text-[9px] text-gray-400 font-bold ml-auto">(VOCÊ)</span>}
                  </div>
                ))}
                {[...Array(Math.max(0, 4 - safePlayers.length))].map((_, i) => (
                  <div key={`wait-${i}`} className="flex items-center gap-3 opacity-30">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-bold text-gray-500">Esperando...</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={onStart}
              disabled={safePlayers.length < 2}
              className={`w-full py-5 rounded-2xl font-bold text-lg uppercase transition-all shadow-xl ${
                safePlayers.length >= 2 
                  ? 'bg-[#FF3401] text-white btn-watercolor hover:scale-[1.02]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Começar Partida
            </button>
            <p className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-white/40 inline-block px-2 rounded-lg">A partida requer entre 2 e 4 jogadores</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
