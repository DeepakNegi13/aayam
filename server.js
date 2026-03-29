import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

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
  {
    id: 5,
    title: "The Lorentz Force & Charged Particle Dynamics",
    content: "The Lorentz force is the force experienced by a charged particle moving through electric and magnetic fields. It is given by the equation F = q(E + v × B), where F is the force, q is the charge of the particle, E is the electric field, v is the velocity of the particle, and B is the magnetic field. This force is fundamental in understanding how charged particles behave in various electromagnetic environments, such as in cyclotrons, mass spectrometers, and even in astrophysical phenomena like solar winds. The Lorentz force can cause particles to spiral around magnetic field lines or accelerate in the direction of an electric field, making it a crucial concept in both classical and modern physics.",
    keywords: ["force", "charged", "particle", "electric", "magnetic", "velocity", "cyclotrons", "mass spectrometers", "astrophysical", "solar winds", "spiral", "accelerate", "lorentz"]
  },
  {
    id: 6,
    title: "Maxwell's Equations & Electromagnetic Waves",
    content: "Maxwell's equations are a set of four fundamental equations that describe how electric and magnetic fields are generated and altered by each other and by charges and currents. These equations, formulated by James Clerk Maxwell in the 1860s, unify electricity, magnetism, and optics into a single theoretical framework. The equations predict that oscillating electric and magnetic fields can propagate through space as electromagnetic waves at the speed of light. This insight led to the realization that light itself is an electromagnetic wave, revolutionizing our understanding of the nature of light and laying the groundwork for modern physics, including quantum mechanics and relativity.",
    keywords: ["maxwell", "equations", "electric", "magnetic", "fields", "charges", "currents", "electromagnetic", "waves", "light", "optics", "propagate", "speed"]
  },
  {
    id: 7,
    title: "The Doppler Effect in Sound and Light",
    content: "The Doppler effect is the change in frequency or wavelength of a wave in relation to an observer moving relative to the source of the wave. It is commonly experienced with sound waves, where an approaching source causes a higher pitch (frequency) and a receding source causes a lower pitch. In the context of light, the Doppler effect manifests as a redshift when an object moves away from the observer and a blueshift when it moves towards the observer. This phenomenon is crucial in astrophysics for determining the movement of stars and galaxies, providing evidence for the expansion of the universe.",
    keywords: ["doppler", "effect", "frequency", "wavelength", "observer", "source", "sound", "light", "redshift", "blueshift", "astrophysics", "galaxies", "universe"]
  },
  {
    id: 8,
    title: "Thermodynamics & the Laws of Energy",
    content: "Thermodynamics is the branch of physics that deals with heat, work, and energy. The first law of thermodynamics, also known as the law of energy conservation, states that energy cannot be created or destroyed, only transformed from one form to another. The second law introduces the concept of entropy, stating that in any natural process, the total entropy of a closed system will always increase over time. This explains why certain processes are irreversible and why energy tends to disperse. The third law states that as the temperature of a system approaches absolute zero, the entropy approaches a constant minimum. These laws govern everything from engines and refrigerators to the behavior of stars and black holes.",
    keywords: ["thermodynamics", "heat", "work", "energy", "conservation", "entropy", "irreversible", "absolute zero", "engines", "refrigerators", "stars", "black holes"]
  }
];

io.on('connection', (socket) => {
  socket.on('createRoom', ({ playerName, playerCount }) => {
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    rooms[roomId] = {
      id: roomId,
      host: socket.id,
      maxPlayers: playerCount,
      players: [{ id: socket.id, name: playerName, socketId: socket.id, word: "", score: 0, eliminated: false }],
      gameState: 'lobby',
      paragraph: paragraphs[Math.floor(Math.random() * paragraphs.length)]
    };
    socket.join(roomId);
    socket.emit('roomCreated', rooms[roomId]);
    io.to(roomId).emit('roomUpdated', rooms[roomId]);
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    const id = roomId.toUpperCase();
    const room = rooms[id];
    if (!room) {
      return socket.emit('error', 'Room not found');
    }
    if (room.gameState !== 'lobby') {
      return socket.emit('error', 'Game already started');
    }
    if (room.players.length >= room.maxPlayers) {
      return socket.emit('error', 'Room is full');
    }
    // Check if name taken
    if (room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase())) {
        return socket.emit('error', 'Name already taken');
    }

    room.players.push({ id: socket.id, name: playerName, socketId: socket.id, word: "", score: 0, eliminated: false });
    socket.join(id);
    
    // Broadcast updated room
    io.to(id).emit('roomUpdated', room);
  });

  socket.on('startGame', (roomId) => {
    const room = rooms[roomId];
    if (room && room.host === socket.id) {
      room.gameState = 'reading';
      io.to(roomId).emit('gameStarted', room);
    }
  });

  socket.on('finishReading', (roomId) => {
    const room = rooms[roomId];
    if (room && room.host === socket.id) {
      room.gameState = 'input';
      io.to(roomId).emit('inputPhase', room);
    }
  });

  socket.on('submitWord', ({ roomId, word }) => {
    const room = rooms[roomId];
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.word = word.trim().toLowerCase();
    }

    const allSubmitted = room.players.every(p => p.word !== "");
    if (allSubmitted) {
      evaluateWords(room);
      room.gameState = 'results';
      io.to(roomId).emit('results', room);
    } else {
      io.to(roomId).emit('roomUpdated', room);
    }
  });

  socket.on('playAgain', (roomId) => {
    const room = rooms[roomId];
    if (room && room.host === socket.id) {
      room.gameState = 'lobby';
      room.paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
      room.players.forEach(p => { p.word = ""; p.score = 0; p.eliminated = false; });
      io.to(roomId).emit('roomUpdated', room);
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          // reassing host
          if (room.host === socket.id) {
             room.host = room.players[0].id;
          }
          io.to(roomId).emit('roomUpdated', room);
        }
      }
    }
  });
});

function evaluateWords(room) {
  const paragraph = room.paragraph;
  let scoredPlayers = room.players.map(p => {
    let score = Math.floor(Math.random() * 30) + 40;
    
    // exact keyword match
    if (paragraph.keywords.includes(p.word)) score += 30;
    // found ANYWHERE in content
    else if (paragraph.content.toLowerCase().includes(p.word)) score += 15;

    // Consensus Bonus
    let consensusBonus = 0;
    room.players.forEach(other => {
      if (p.id !== other.id) {
        if (p.word === other.word) consensusBonus += 20;
        else if (p.word.substring(0, 3) === other.word.substring(0, 3)) consensusBonus += 10;
      }
    });

    return { ...p, score: score + consensusBonus };
  });

  const sorted = [...scoredPlayers].sort((a, b) => a.score - b.score);
  const eliminatedId = sorted[0].id; 

  room.players = scoredPlayers.map(p => ({
    ...p,
    eliminated: p.id === eliminatedId
  }));
}

server.listen(4000, () => {
  console.log('Socket.io server running on port 4000');
});
