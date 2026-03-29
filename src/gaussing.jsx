import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Connect to the local server running on port 4000. 
// Uses window.location.hostname so it works across the local network.
const socket = io(`http://${window.location.hostname}:4000`);

export default function GaussingGame() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [playerCount, setPlayerCount] = useState(4);
  const [room, setRoom] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [menuView, setMenuView] = useState("home"); // home, create, join
  
  // Track if we've already submitted our word this round
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    socket.on('roomCreated', (roomData) => {
      setRoom(roomData);
      setErrorMsg("");
    });
    
    socket.on('roomUpdated', (roomData) => {
      setRoom(roomData);
      setErrorMsg("");
      // Reset submission flag when returning to lobby
      if (roomData.gameState === 'lobby') {
        setHasSubmitted(false);
      }
    });

    socket.on('gameStarted', (roomData) => {
      setRoom(roomData);
    });

    socket.on('inputPhase', (roomData) => {
      setRoom(roomData);
      setCurrentWord("");
    });

    socket.on('results', (roomData) => {
      setRoom(roomData);
    });

    socket.on('error', (msg) => {
      setErrorMsg(msg);
      // If we failed to join, kick us back to menu
      if (!room) {
        setMenuView('home');
      }
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomUpdated');
      socket.off('gameStarted');
      socket.off('inputPhase');
      socket.off('results');
      socket.off('error');
    };
  }, [room]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    socket.emit('createRoom', { playerName: playerName.trim(), playerCount });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) {
      setErrorMsg("Please enter your name and a room code");
      return;
    }
    socket.emit('joinRoom', { roomId: roomCode.trim().toUpperCase(), playerName: playerName.trim() });
    setMenuView('joining');
  };

  const startGame = () => {
    if (room && room.host === socket.id) {
       socket.emit('startGame', room.id);
    }
  };

  const finishReading = () => {
    if (room && room.host === socket.id) {
       socket.emit('finishReading', room.id);
    }
  };

  const submitWord = (e) => {
    e.preventDefault();
    if (!currentWord.trim()) return;
    setHasSubmitted(true);
    socket.emit('submitWord', { roomId: room.id, word: currentWord.trim() });
  };

  const playAgain = () => {
    if (room && room.host === socket.id) {
       socket.emit('playAgain', room.id);
    }
  };

  let isHost = false;
  let me = null;
  if (room) {
    isHost = room.host === socket.id;
    if (room.players) {
      me = room.players.find(p => p.id === socket.id);
    }
  }

  // Render logic
  const renderHome = () => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl animate-fade-in text-center">
      <h2 className="text-2xl font-bold mb-6 text-white">Online Multiplayer</h2>
      <p className="text-neutral-400 mb-8 max-w-md mx-auto">
        Host a room and share the code with friends on your local WiFi network, or join an existing room.
      </p>
      {errorMsg && <div className="text-red-400 bg-red-500/10 p-4 rounded-xl mb-6 font-bold animate-pulse">{errorMsg}</div>}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={() => setMenuView("create")} className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-full text-lg transition-transform hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          Create Game
        </button>
        <button onClick={() => setMenuView("join")} className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg transition-transform hover:scale-105 shadow-xl">
          Join Game
        </button>
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl animate-fade-in text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Host a Game</h2>
      {errorMsg && <div className="text-red-400 mb-4">{errorMsg}</div>}
      <form onSubmit={handleCreateRoom} className="space-y-6">
        <div>
          <label className="block text-neutral-400 mb-2 font-medium">Your Nickname</label>
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white outline-none text-center" />
        </div>
        <div>
           <label className="block text-neutral-400 mb-4 font-medium">Max Players (including you)</label>
           <div className="flex gap-2 justify-center">
             {[3, 4, 5, 6, 7, 8].map(num => (
               <button type="button" key={num} onClick={() => setPlayerCount(num)} className={`w-12 h-12 rounded-full font-bold transition-all border-2 ${playerCount === num ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 transform scale-110 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'border-neutral-700 text-neutral-400'}`}>{num}</button>
             ))}
           </div>
        </div>
        <button type="submit" disabled={!playerName.trim()} className="w-full py-4 bg-cyan-500 disabled:bg-neutral-800 text-white font-bold rounded-xl text-lg transition-transform hover:scale-105">
          Host Room
        </button>
        <button type="button" onClick={() => setMenuView("home")} className="w-full py-3 text-neutral-400 hover:text-white transition-colors">Back</button>
      </form>
    </div>
  );

  const renderJoin = () => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl animate-fade-in text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Join a Game</h2>
      {errorMsg && <div className="text-red-400 mb-4">{errorMsg}</div>}
      <form onSubmit={handleJoinRoom} className="space-y-6">
        <div>
          <label className="block text-neutral-400 mb-2 font-medium">Your Nickname</label>
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white outline-none text-center" />
        </div>
        <div>
          <label className="block text-neutral-400 mb-2 font-medium">4-Letter Room Code</label>
          <input type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} maxLength={4} className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-3xl tracking-widest uppercase outline-none text-center" />
        </div>
        <button type="submit" disabled={!playerName.trim() || roomCode.length !== 4} className="w-full py-4 bg-white text-black disabled:bg-neutral-800 disabled:text-neutral-500 font-bold rounded-xl text-lg transition-transform hover:scale-105">
          Join Room
        </button>
        <button type="button" onClick={() => setMenuView("home")} className="w-full py-3 text-neutral-400 hover:text-white transition-colors">Back</button>
      </form>
    </div>
  );

  const renderLobby = () => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl animate-fade-in text-center max-w-xl mx-auto mt-4">
      <div className="inline-block px-8 py-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-8">
        <div className="text-cyan-400 font-bold mb-1 uppercase tracking-wider text-sm">Room Code</div>
        <div className="text-5xl font-black tracking-widest text-white">{room.id}</div>
      </div>
      
      <h3 className="text-xl text-neutral-300 font-medium mb-4">
        Players ({room.players.length}/{room.maxPlayers})
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {room.players.map(p => (
           <div key={p.id} className="bg-neutral-950 border border-neutral-800 py-3 px-4 rounded-xl flex items-center justify-center gap-2">
             {room.host === p.id && <span className="text-cyan-400 text-xs font-bold uppercase" title="Host">👑</span>}
             <span className={`font-bold ${p.id === socket.id ? 'text-white' : 'text-neutral-400'}`}>{p.name} {p.id === socket.id ? "(You)" : ""}</span>
           </div>
        ))}
      </div>

      {isHost ? (
        <button onClick={startGame} disabled={room.players.length < 3} className="w-full py-4 bg-cyan-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-xl text-xl transition-transform hover:scale-[1.02]">
          Start Game
        </button>
      ) : (
        <div className="text-neutral-400 py-4 font-medium animate-pulse">Waiting for host to start...</div>
      )}
      {isHost && room.players.length < 3 && <div className="text-red-400 text-sm mt-3 font-medium">Need at least 3 players to start</div>}
    </div>
  );

  const renderReading = () => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-12 shadow-2xl animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <span className="inline-block px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-bold tracking-wider mb-6 border border-cyan-500/20">
        {room.paragraph.title.toUpperCase()}
      </span>
      
      <p className="text-xl md:text-2xl text-neutral-200 leading-relaxed font-serif mb-10">
        {room.paragraph.content}
      </p>
      
      <div className="flex justify-center mt-8 border-t border-neutral-800 pt-8">
        {isHost ? (
          <button 
            onClick={finishReading}
            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-full text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105"
          >
            Everyone Finished Reading?
          </button>
        ) : (
           <p className="text-neutral-400 animate-pulse font-medium">Reading Phase... Host will proceed when ready.</p>
        )}
      </div>
    </div>
  );

  const renderInput = () => {
    // Determine if all players except you have submitted (or if some have)
    const submittedCount = room.players.filter(p => p.word !== "").length;
    
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 shadow-2xl text-center animate-fade-in max-w-lg mx-auto">
        <h2 className="text-3xl font-black text-white mb-2">Your Turn</h2>
        <p className="text-neutral-400 mb-8">Enter ONE word relating to the passage to prove you're not the outlier!</p>
        
        {!hasSubmitted ? (
          <form onSubmit={submitWord}>
            <input
              type="text"
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              placeholder="Type your single word..."
              className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-cyan-500 rounded-2xl px-6 py-5 text-center text-2xl text-white outline-none transition-colors mb-8 shadow-inner"
              autoFocus
              autoComplete="off"
            />
            <button 
              type="submit"
              disabled={!currentWord.trim()}
              className="w-full py-4 bg-white text-black disabled:bg-neutral-800 disabled:text-neutral-500 font-bold rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              Submit Word
            </button>
          </form>
        ) : (
          <div className="py-8">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4 animate-pulse">Word Locked In!</h3>
            <p className="text-neutral-300">Waiting for other players...</p>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-neutral-800">
           <p className="text-neutral-500 text-sm mb-4">Submission Status ({submittedCount}/{room.players.length})</p>
           <div className="flex flex-wrap gap-2 justify-center">
             {room.players.map(p => (
                <div key={p.id} className={`px-3 py-1 rounded-md text-xs font-bold ${p.word ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-neutral-800 text-neutral-500 border border-neutral-700'}`}>
                  {p.name} {p.id === socket.id && "(You)"} {p.word && "✓"}
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="space-y-6 animate-fade-in-up w-full">
      <h2 className="text-3xl font-black text-center mb-8">Evaluation Complete</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {room.players.map(p => (
          <div 
            key={p.id} 
            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
              p.eliminated 
                ? 'border-red-500/50 bg-red-500/10' 
                : 'border-neutral-800 bg-neutral-900'
            }`}
          >
            <h3 className={`text-xl font-bold mb-1 ${p.eliminated ? 'text-red-400' : 'text-neutral-300'}`}>
              {p.name} {p.id === socket.id && "(You)"}
            </h3>
            <div className={`text-3xl font-black mb-3 ${p.eliminated ? 'text-red-500 line-through' : 'text-white'}`}>
              "{p.word}"
            </div>
            {p.eliminated && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white uppercase tracking-widest mt-2 animate-bounce">
                The Outlier!
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

      {isHost && (
        <div className="flex justify-center mt-12">
          <button 
            onClick={playAgain}
            className="px-12 py-4 border-2 border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white hover:border-white hover:bg-white/5 font-bold rounded-full text-lg shadow-xl transition-all"
          >
            Play Another Round
          </button>
        </div>
      )}
      {!isHost && (
        <div className="flex justify-center mt-12">
           <p className="text-neutral-400 font-medium animate-pulse">Waiting for host to start another round...</p>
        </div>
      )}
    </div>
  );

  let currentContent = null;
  if (!room) {
    if (menuView === "home") currentContent = renderHome();
    else if (menuView === "create") currentContent = renderCreate();
    else currentContent = renderJoin();
  } else {
    if (room.gameState === "lobby") currentContent = renderLobby();
    else if (room.gameState === "reading") currentContent = renderReading();
    else if (room.gameState === "input") currentContent = renderInput();
    else currentContent = renderResults();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-lg mb-2">
            GAUSSING
          </h1>
          <p className="text-neutral-400 font-medium tracking-wide">
            The Online Physics Concept Outlier Game
          </p>
        </div>

        {currentContent}
      </div>
    </div>
  );
}
