import React, { useState, useEffect } from 'react';

// Advanced physics paragraphs (12th Grade / College Level)
const paragraphs = [
  {
    id: 1,
    title: "Gauss's Law in Electrostatics",
    content: "In physics, Gauss's law relates the distribution of electric charge to the resulting electric field. The law states that the net outward normal electric flux through any closed surface is proportional to the total electric charge enclosed within that closed surface. This foundational principle of electromagnetism, formalized by Carl Friedrich Gauss in 1835, is one of Maxwell's four equations. It fundamentally implies that electric charges act as sources or sinks for the electric field, drastically simplifying the calculation of electric fields in highly symmetric charge distributions like spheres, cylinders, and planar sheets.",
    keywords: ["flux", "charge", "field", "surface", "symmetry", "maxwell", "sphere", "cylinder", "electrostatics", "proportional"]
  },
  {
    id: 2,
    title: "The Photoelectric Effect & Quantum Theory",
    content: "The photoelectric effect is the emission of electrons when electromagnetic radiation, such as light, hits a material. Electrons emitted in this manner are called photoelectrons. Classical electromagnetism predicted that continuous light waves transfer energy to electrons, which would then be emitted when they accumulate enough energy. However, experiments showed that the energy of the emitted electrons depended only on the frequency of the incident light, not its intensity. Albert Einstein resolved this in 1905 by proposing that light consists of discrete quanta of energy, now called photons. This discovery laid the groundwork for wave-particle duality and modern quantum mechanics.",
    keywords: ["electrons", "radiation", "light", "energy", "frequency", "photons", "quanta", "emission", "intensity", "wave", "particle", "quantum"]
  },
  {
    id: 3,
    title: "Electromagnetic Induction & Faraday's Law",
    content: "Electromagnetic induction is the process of generating an electromotive force (EMF) across an electrical conductor in a changing magnetic field. Michael Faraday is credited with the discovery of induction in 1831. Faraday's law of induction states that the induced EMF in a closed circuit is equal to the negative of the time rate of change of the magnetic flux enclosed by the circuit. This principle is the operating mechanism behind electrical generators, transformers, and induction motors. Lenz's law dictates the direction of the induced current, stating it will flow in a way that opposes the change in flux that produced it.",
    keywords: ["induction", "emf", "conductor", "magnetic", "field", "flux", "circuit", "generators", "transformers", "current", "lenz", "faraday"]
  },
  {
    id: 4,
    title: "Kirchhoff's Current and Voltage Laws",
    content: "Kirchhoff’s laws are the foundation of circuit analysis, detailing how energy and charge behave in an electrical network. Kirchhoff’s Current Law (KCL), also known as the junction rule, states that the total current entering a node must exactly equal the total current leaving it. This is based on the principle of conservation of charge, ensuring that electricity doesn't just pile up at a connection point. On the other hand, Kirchhoff’s Voltage Law (KVL) focuses on energy within a closed loop. It states that the algebraic sum of all electrical potential differences (voltages) around any closed circuit is zero. Essentially, any energy supplied by a source, like a battery, must be completely used up by the components (resistors, lamps, etc.) in that loop. Together, these two laws allow engineers to calculate unknown currents and voltages in even the most complex electronic systems.",
    keywords: ["current", "voltage", "circuit", "node", "loop", "conservation", "charge", "potential", "energy", "resistors", "battery", "kirchhoff", "junction", "algebraic", "sum"]    
  },
 
];

export default function GaussingGame() {
  const [currentParagraph, setCurrentParagraph] = useState(null);
  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState([]);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [gameState, setGameState] = useState("setup"); // setup, reading, input, results

  useEffect(() => {
    pickRandomParagraph();
  }, []);

  const pickRandomParagraph = () => {
    const randomIdx = Math.floor(Math.random() * paragraphs.length);
    setCurrentParagraph(paragraphs[randomIdx]);
  };

  const startGame = () => {
    const initialPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      word: "",
      eliminated: false,
      score: 0
    }));
    setPlayers(initialPlayers);
    setGameState("reading");
    setCurrentPlayerTurn(0);
  };

  const beginInputPhase = () => {
    setGameState("input");
  };

  const handleWordSubmit = (e) => {
    e.preventDefault();
    if (!currentWord.trim()) return;

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerTurn].word = currentWord.trim().toLowerCase();
    
    setPlayers(updatedPlayers);
    setCurrentWord("");

    if (currentPlayerTurn + 1 < playerCount) {
      setCurrentPlayerTurn(currentPlayerTurn + 1);
    } else {
      evaluateWords(updatedPlayers);
    }
  };

  const evaluateWords = (activePlayers) => {
    // Simulated Semantic/Relevance Evaluation
    // In a real app, this would use a backend NLP model / word embeddings. 
    // Here we simulate it by checking against passage keywords and comparing to other players.
    
    let scoredPlayers = activePlayers.map(p => {
      let score = Math.floor(Math.random() * 30) + 40; // Base baseline
      
      // Bonus if it matches exact passage keywords
      if (currentParagraph.keywords.includes(p.word)) {
        score += 30;
      } else if (currentParagraph.content.toLowerCase().includes(p.word)) {
        score += 15;
      }

      // Bonus for similarity/consensus with other players' words
      let consensusBonus = 0;
      activePlayers.forEach(other => {
        if (p.id !== other.id) {
          if (p.word === other.word) consensusBonus += 20;
          else if (p.word.substring(0, 3) === other.word.substring(0, 3)) consensusBonus += 10;
        }
      });

      return { ...p, score: score + consensusBonus };
    });

    // Find the outlier (lowest score)
    const sorted = [...scoredPlayers].sort((a, b) => a.score - b.score);
    const eliminatedId = sorted[0].id; // Lowest similarity/context score is eliminated

    scoredPlayers = scoredPlayers.map(p => ({
      ...p,
      eliminated: p.id === eliminatedId
    }));

    setPlayers(scoredPlayers);
    setGameState("results");
  };

  const resetGame = () => {
    pickRandomParagraph();
    setGameState("setup");
  };

  const activePlayer = players[currentPlayerTurn];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
      <div className="max-w-3xl w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-lg mb-2">
            GAUSSING
          </h1>
          <p className="text-neutral-400 font-medium tracking-wide">
            The Physics Concept Outlier Game
          </p>
        </div>

        {/* SETUP PHASE */}
        {gameState === "setup" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl animate-fade-in text-center">
            <h2 className="text-2xl font-bold mb-6 text-white">Game Setup</h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
              Read the physics passage carefully. Every player submits one word that captures the essence. 
              The player whose word is the most disconnected (the outlier) is eliminated!
            </p>
            
            <div className="flex flex-col items-center gap-4 mb-8">
              <label className="text-neutral-300 font-medium">Number of Players:</label>
              <div className="flex gap-4">
                {[3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => setPlayerCount(num)}
                    className={`w-14 h-14 rounded-full text-lg font-bold transition-all border-2 ${
                      playerCount === num 
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                        : 'border-neutral-700 hover:border-neutral-500 text-neutral-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={startGame}
              className="w-full sm:w-auto px-12 py-4 bg-white text-black hover:bg-neutral-200 font-bold rounded-full text-lg transition-transform hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}

        {/* READING PHASE */}
        {gameState === "reading" && currentParagraph && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-12 shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <span className="inline-block px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-bold tracking-wider mb-6 border border-cyan-500/20">
              {currentParagraph.title.toUpperCase()}
            </span>
            
            <p className="text-xl md:text-2xl text-neutral-200 leading-relaxed font-serif mb-10">
              {currentParagraph.content}
            </p>
            
            <div className="flex justify-center mt-8 border-t border-neutral-800 pt-8">
              <button 
                onClick={beginInputPhase}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-full text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105"
              >
                Everyone Finished Reading?
              </button>
            </div>
          </div>
        )}

        {/* INPUT PHASE */}
        {gameState === "input" && activePlayer && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 shadow-2xl text-center animate-fade-in max-w-lg mx-auto">
            <h2 className="text-3xl font-black text-white mb-2">{activePlayer.name}'s Turn</h2>
            <p className="text-neutral-400 mb-8">Enter ONE word related to the physics passage. Keep it a secret!</p>
            
            <form onSubmit={handleWordSubmit}>
              <input
                type="password"
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                placeholder="Type your word..."
                className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-cyan-500 rounded-2xl px-6 py-5 text-center text-2xl text-white outline-none transition-colors mb-8 shadow-inner"
                autoFocus
                autoComplete="off"
              />
              <button 
                type="submit"
                disabled={!currentWord.trim()}
                className="w-full py-4 bg-white text-black disabled:bg-neutral-800 disabled:text-neutral-500 font-bold rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-95"
              >
                Submit & Hide
              </button>
            </form>
            <div className="mt-6 flex justify-center gap-2">
              {players.map((p, i) => (
                <div key={p.id} className={`w-3 h-3 rounded-full ${i < currentPlayerTurn ? 'bg-cyan-500' : i === currentPlayerTurn ? 'bg-white animate-pulse' : 'bg-neutral-700'}`} />
              ))}
            </div>
          </div>
        )}

        {/* RESULTS PHASE */}
        {gameState === "results" && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black text-center mb-8">Evaluation Complete</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map(p => (
                <div 
                  key={p.id} 
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    p.eliminated 
                      ? 'border-red-500/50 bg-red-500/10' 
                      : 'border-neutral-800 bg-neutral-900'
                  }`}
                >
                  <h3 className={`text-xl font-bold mb-1 ${p.eliminated ? 'text-red-400' : 'text-neutral-300'}`}>
                    {p.name}
                  </h3>
                  <div className={`text-3xl font-black mb-3 ${p.eliminated ? 'text-red-500 line-through' : 'text-white'}`}>
                    "{p.word}"
                  </div>
                  {p.eliminated && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white uppercase tracking-widest mt-2 animate-bounce">
                      Eliminated
                    </span>
                  )}
                  {!p.eliminated && (
                    <span className="text-sm font-medium text-cyan-400/80">
                      Match Score: {p.score}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center mt-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Why were they eliminated?</h3>
              <p className="text-neutral-400">
                The consensus engine determined their word lacked semantic similarity to both the core physics concepts ("{currentParagraph.keywords.slice(0, 3).join(', ')}") and the words chosen by the rest of the group.
              </p>
            </div>

            <div className="flex justify-center mt-12">
              <button 
                onClick={resetGame}
                className="px-12 py-4 border-2 border-neutral-700 text-neutral-300 hover:text-white hover:border-white hover:bg-white/5 font-bold rounded-full text-lg transition-all"
              >
                Play Another Round
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
