/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Banana, ShoppingCart, HelpCircle, Volume2, VolumeX, Save, Download, Plus, Gem, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
  type: 'multiplier' | 'bonus' | 'secret';
}

interface SaveData {
  bananas: number;
  upgrades: string[];
  lastSaved: string;
}

const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'double_banana',
    name: 'Двойной банан',
    description: 'Удваивает количество бананов за нажатие (x2)',
    cost: 10,
    image: 'input_file_1.png',
    type: 'multiplier',
  },
  {
    id: 'soup',
    name: 'Суп из семи залуп',
    description: 'Добавляет +5 бананов за нажатие',
    cost: 100,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
    type: 'bonus',
  },
  {
    id: 'plus_1488',
    name: '+1488',
    description: 'Добавляет +1488 бананов за нажатие',
    cost: 5242,
    image: 'input_file_2.png',
    type: 'bonus',
  },
];

export default function App() {
  const [bananas, setBananas] = useState(0);
  const [upgrades, setUpgrades] = useState<string[]>([]);
  const [diamonds, setDiamonds] = useState(0);
  const [slotCount, setSlotCount] = useState(2);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showDiamondShop, setShowDiamondShop] = useState(false);
  const [diamondPurchaseAmount, setDiamondPurchaseAmount] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const hasDouble = upgrades.includes('double_banana');
  const hasSoup = upgrades.includes('soup');
  const has1488 = upgrades.includes('plus_1488');

  const multiplier = hasDouble ? 2 : 1;
  const bonus = (hasSoup ? 5 : 0) + (has1488 ? 1488 : 0);
  const perClick = (1 + bonus) * multiplier;

  // Load meta data and initial progress on mount
  useEffect(() => {
    const meta = localStorage.getItem('banana_clicker_meta');
    if (meta) {
      const { diamonds: d, slotCount: s } = JSON.parse(meta);
      setDiamonds(d || 0);
      setSlotCount(s || 2);
    }

    const savedBananas = localStorage.getItem('banana_clicker_count');
    const savedUpgrades = localStorage.getItem('banana_clicker_upgrades');
    
    if (savedBananas) setBananas(parseFloat(savedBananas));
    if (savedUpgrades) setUpgrades(JSON.parse(savedUpgrades));
  }, []);

  // Save meta data whenever it changes
  useEffect(() => {
    localStorage.setItem('banana_clicker_meta', JSON.stringify({ diamonds, slotCount }));
  }, [diamonds, slotCount]);

  const handleSaveToSlot = (slotId: number) => {
    const saveData: SaveData = {
      bananas,
      upgrades,
      lastSaved: new Date().toLocaleString(),
    };
    localStorage.setItem(`banana_clicker_slot_${slotId}`, JSON.stringify(saveData));
    alert(`Прогресс сохранен в ячейку ${slotId}!`);
  };

  const handleLoadFromSlot = (slotId: number) => {
    const rawData = localStorage.getItem(`banana_clicker_slot_${slotId}`);
    if (rawData) {
      const data: SaveData = JSON.parse(rawData);
      setBananas(data.bananas);
      setUpgrades(data.upgrades);
      alert(`Прогресс загружен из ячейки ${slotId}!`);
    } else {
      alert('Эта ячейка пуста!');
    }
  };

  const buySlot = () => {
    if (diamonds >= 1) {
      setDiamonds(prev => prev - 1);
      setSlotCount(prev => prev + 1);
    } else {
      alert('Недостаточно алмазов!');
    }
  };

  const exchangeDiamonds = () => {
    if (diamonds >= 1) {
      setDiamonds(prev => prev - 1);
      setBananas(prev => prev + 200000000);
      alert('Обмен произведен! +200,000,000 бананов');
    } else {
      alert('Недостаточно алмазов!');
    }
  };

  const handleBananaClick = (e: React.MouseEvent) => {
    setBananas(prev => prev + perClick);
    
    // Visual feedback
    const x = e.clientX;
    const y = e.clientY;

    // Small confetti burst
    confetti({
      particleCount: 2,
      angle: 90,
      spread: 45,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ['#FFE135', '#FFF3B0'],
      ticks: 50,
      gravity: 0.5,
      scalar: 0.7,
    });
  };

  const buyUpgrade = (upgrade: Upgrade) => {
    const isBought = upgrades.includes(upgrade.id);

    if (bananas >= upgrade.cost && !isBought) {
      setBananas(prev => prev - upgrade.cost);
      setUpgrades(prev => [...prev, upgrade.id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] text-[#586E75] font-sans selection:bg-[#EEE8D5] flex flex-col items-center p-4 md:p-8 overflow-x-hidden">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-start mb-12 relative">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFE135] p-3 rounded-2xl shadow-lg rotate-12">
            <Banana className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#073642]">
            BANANA <span className="text-[#B58900]">CLICKER</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          {/* Banana Count Box - Repositioned to Top Right */}
          <div className="p-4 bg-[#073642] rounded-2xl shadow-xl border-2 border-[#B58900] min-w-[180px] text-right">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#93A1A1] block mb-0.5">Бананы</span>
            <span className="text-3xl font-mono font-black text-[#FFE135]">
              {Math.floor(bananas).toLocaleString()}
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-xl border border-[#EEE8D5] shadow-sm">
              <div className="flex items-center gap-1">
                <Gem className="w-4 h-4 text-cyan-500" />
                <span className="font-bold text-[#073642]">{diamonds}</span>
              </div>
              <button 
                onClick={() => setShowDiamondShop(true)}
                className="p-1 hover:bg-cyan-100 rounded-lg transition-colors text-cyan-600"
                title="Купить алмазы"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => setShowShop(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#B58900] text-white font-bold rounded-xl hover:bg-[#a47c00] transition-colors shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
              Магазин
            </button>
            <button 
              onClick={() => setShowSaveMenu(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#268BD2] text-white font-bold rounded-xl hover:bg-[#2176b3] transition-colors shadow-md"
            >
              <Save className="w-4 h-4" />
              Сохранения
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl flex flex-col items-center">
        {/* Clicker Area */}
        <div className="w-full max-w-4xl flex flex-col items-center justify-center py-12 bg-white/50 rounded-[3rem] border-4 border-[#EEE8D5] relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
             <div className="grid grid-cols-8 gap-4 p-4">
                {Array.from({ length: 32 }).map((_, i) => (
                  <Banana key={i} className="w-12 h-12" />
                ))}
             </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBananaClick}
            className="relative z-10 group cursor-pointer"
          >
            <div className="relative">
              {/* Main Banana */}
              <div>
                <img 
                  src="input_file_1.png" 
                  alt="Banana"
                  className="w-64 h-64 object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Double Banana Visual */}
              {hasDouble && (
                <div className="absolute top-0 left-0 translate-x-[50px]">
                  <img 
                    src="input_file_1.png" 
                    alt="Banana X2"
                    className="w-64 h-64 object-contain drop-shadow-2xl opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-black text-4xl px-4 py-2 rounded-xl rotate-12 shadow-xl border-4 border-white">
                    X2
                  </div>
                </div>
              )}

              {/* Soup Visual */}
              {hasSoup && (
                <div className="absolute -bottom-10 -right-10 w-48 h-48">
                   <img 
                    src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=300&fit=crop" 
                    alt="Soup"
                    className="w-full h-full object-cover rounded-full border-8 border-white shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* 1488 Visual */}
              {has1488 && (
                <div className="absolute -top-10 -right-20 w-40 h-40">
                   <img 
                    src="input_file_2.png" 
                    alt="1488"
                    className="w-full h-full object-cover rounded-2xl border-4 border-[#B58900] shadow-2xl rotate-6"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-red-600 text-white font-black text-xl px-2 py-1 rounded-lg">
                    +1488
                  </div>
                </div>
              )}
            </div>
          </motion.button>

          <div className="mt-12 text-center z-10">
            <p className="text-xl font-bold text-[#073642]">
              +{perClick} бананов за клик
            </p>
            <p className="text-sm opacity-60 mt-1">
              Нажимай на банан, чтобы стать богатым!
            </p>
          </div>
        </div>
      </main>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShop(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#FDF6E3] w-full max-w-2xl rounded-[2rem] shadow-2xl border-4 border-[#EEE8D5] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#073642] flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  МАГАЗИН УЛУЧШЕНИЙ
                </h2>
                <button 
                  onClick={() => setShowShop(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                {INITIAL_UPGRADES.map((upgrade) => {
                  const isBought = upgrades.includes(upgrade.id);
                  const canAfford = bananas >= upgrade.cost;

                  return (
                    <motion.button
                      key={upgrade.id}
                      disabled={isBought || !canAfford}
                      onClick={() => buyUpgrade(upgrade)}
                      className={`
                        relative flex items-center gap-4 p-4 rounded-3xl border-2 transition-all text-left
                        ${isBought 
                          ? 'bg-[#EEE8D5] border-transparent opacity-80 cursor-default' 
                          : canAfford 
                            ? 'bg-white border-[#B58900] hover:shadow-xl hover:-translate-y-1 cursor-pointer' 
                            : 'bg-white border-[#EEE8D5] opacity-50 cursor-not-allowed'}
                      `}
                    >
                      <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-2xl bg-[#FDF6E3]">
                        <img 
                          src={upgrade.image} 
                          alt={upgrade.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {upgrade.id === 'double_banana' && (
                          <div className="absolute bottom-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1 rounded">X2</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black text-[#073642] text-sm leading-tight">{upgrade.name}</h3>
                        <p className="text-[10px] opacity-70 mt-1">{upgrade.description}</p>
                        <div className="mt-2 flex items-center gap-1">
                          <span className={`font-bold text-sm ${canAfford ? 'text-[#859900]' : 'text-red-500'}`}>
                            {upgrade.cost.toLocaleString()}
                          </span>
                          <Banana className="w-3 h-3" />
                        </div>
                      </div>

                      {isBought && (
                        <div className="absolute top-2 right-2 bg-[#859900] text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                          КУПЛЕНО
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-[#EEE8D5]">
                <h3 className="text-lg font-black text-[#073642] mb-4 flex items-center gap-2">
                  <Gem className="w-5 h-5 text-cyan-500" />
                  ОБМЕН АЛМАЗОВ
                </h3>
                <button 
                  onClick={exchangeDiamonds}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-cyan-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-50 p-2 rounded-xl">
                      <Gem className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-black text-[#073642]">1 Алмаз → 200,000,000 Бананов</div>
                      <div className="text-[10px] opacity-60 italic">Мгновенное богатство</div>
                    </div>
                  </div>
                  <Plus className="w-6 h-6 text-cyan-500 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Diamond Shop Modal */}
      <AnimatePresence>
        {showDiamondShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDiamondShop(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#FDF6E3] w-full max-w-md rounded-[2rem] shadow-2xl border-4 border-[#EEE8D5] p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#073642] flex items-center gap-2">
                  <Gem className="w-6 h-6 text-cyan-500" />
                  КУПИТЬ АЛМАЗЫ
                </h2>
                <button 
                  onClick={() => setShowDiamondShop(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-8 py-4">
                <div className="flex flex-col items-center">
                  <div className="text-6xl font-black text-[#073642] flex items-center gap-2 mb-2">
                    {diamondPurchaseAmount}
                    <Gem className="w-12 h-12 text-cyan-500" />
                  </div>
                  <div className="text-xl font-bold text-[#B58900]">Цена: {diamondPurchaseAmount} руб.</div>
                </div>

                <div className="w-full px-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="1000" 
                    value={diamondPurchaseAmount}
                    onChange={(e) => setDiamondPurchaseAmount(parseInt(e.target.value))}
                    className="w-full h-3 bg-[#EEE8D5] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold opacity-40 mt-2">
                    <span>1</span>
                    <span>500</span>
                    <span>1000</span>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center gap-2">
                  <button 
                    className="w-full py-4 bg-cyan-500 text-white font-black text-xl rounded-2xl shadow-lg opacity-50 cursor-not-allowed"
                  >
                    КУПИТЬ
                  </button>
                  <span className="text-red-600 font-black text-sm">CANNOT BUY YET</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Menu Modal */}
      <AnimatePresence>
        {showSaveMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveMenu(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#FDF6E3] w-full max-w-md rounded-[2rem] shadow-2xl border-4 border-[#EEE8D5] p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#073642] flex items-center gap-2">
                  <Save className="w-6 h-6" />
                  ЯЧЕЙКИ СОХРАНЕНИЯ
                </h2>
                <button 
                  onClick={() => setShowSaveMenu(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {Array.from({ length: slotCount }).map((_, i) => {
                  const slotId = i + 1;
                  const rawData = localStorage.getItem(`banana_clicker_slot_${slotId}`);
                  const data: SaveData | null = rawData ? JSON.parse(rawData) : null;

                  return (
                    <div key={slotId} className="bg-white p-4 rounded-2xl border-2 border-[#EEE8D5] flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-[#073642]">Ячейка {slotId}</span>
                        {data && (
                          <span className="text-[10px] opacity-50 font-bold">{data.lastSaved}</span>
                        )}
                      </div>
                      
                      {data ? (
                        <div className="text-xs flex gap-4 opacity-70">
                          <div className="flex items-center gap-1">
                            <Banana className="w-3 h-3" />
                            {data.bananas.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" />
                            {data.upgrades.length} улутш.
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs italic opacity-40">Пусто</div>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button 
                          onClick={() => handleSaveToSlot(slotId)}
                          className="flex items-center justify-center gap-2 py-2 bg-[#859900] text-white text-sm font-bold rounded-xl hover:bg-[#718200] transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Сохранить
                        </button>
                        <button 
                          onClick={() => handleLoadFromSlot(slotId)}
                          className="flex items-center justify-center gap-2 py-2 bg-[#268BD2] text-white text-sm font-bold rounded-xl hover:bg-[#2176b3] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Загрузить
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button 
                  onClick={buySlot}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#B58900] rounded-2xl text-[#B58900] font-bold hover:bg-[#B58900]/5 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Купить ячейку (1 <Gem className="w-4 h-4 inline" />)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-auto py-8 text-center opacity-30 text-xs">
        <p>© 2026 Banana Clicker Extreme. No monkeys were harmed.</p>
      </footer>
    </div>
  );
}
