const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const os       = require('os');
const crypto   = require('crypto');

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, { cors: { origin: '*' }, maxHttpBufferSize: 50e6 });
const PORT       = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// ─── Local IP ────────────────────────────────────────────────────────────────
function getLocalIP() {
  for (const nets of Object.values(os.networkInterfaces()))
    for (const n of nets)
      if (n.family === 'IPv4' && !n.internal) return n.address;
  return 'localhost';
}

// ─── Problems ────────────────────────────────────────────────────────────────
const PROBLEMS = {
  s1: [  // Sección 1: dado enunciado → ADP + prueba de escritorio
    {
      id: 's1p1', section: 1, pts: 1, difficulty: '⭐',
      title: 'Precio con descuento',
      prompt: 'Una tienda aplica un descuento del 15% si el precio de un artículo es mayor a $50. Dado el precio original, calcular y mostrar el precio final a pagar.',
      hint: 'Identifica las Entradas, el Proceso (incluyendo la condición), las Salidas y realiza la prueba de escritorio con al menos 2 valores.',
    },
    {
      id: 's1p2', section: 1, pts: 2, difficulty: '⭐⭐',
      title: 'Aprobación de examen',
      prompt: 'Un estudiante tiene dos notas parciales (cada una vale 50%). Si el promedio es mayor o igual a 61, aprueba; de lo contrario, reprueba. Calcular el promedio y mostrar si el estudiante aprobó o reprobó.',
      hint: 'El ADP debe mostrar claramente la condición. La prueba de escritorio debe incluir un caso que aprueba y uno que reprueba.',
    },
    {
      id: 's1p3', section: 1, pts: 3, difficulty: '⭐⭐⭐',
      title: 'Tarifa de taxi',
      prompt: 'Un taxi cobra $1.50 de tarifa base más $0.35 por kilómetro. Si el viaje supera los 10 km, se aplica un recargo del 10% sobre el total. Calcular y mostrar el costo final del viaje.',
      hint: 'Hay dos procesos: el cálculo base y la condición del recargo. Diseña el ADP con ambos.',
    },
  ],
  s2: [  // Sección 2: dado ADP → pseudocódigo + prueba de escritorio
    {
      id: 's2p1', section: 2, pts: 2, difficulty: '⭐',
      title: 'Mayor de dos números',
      prompt: `Se te da el siguiente ADP. Escribe el pseudocódigo completo y realiza la prueba de escritorio.

ENTRADAS: num1, num2
PROCESO:
  • Si num1 > num2 → mayor = num1
  • de otro modo si → mayor = num2
SALIDAS: mayor`,
      hint: 'Usa la estructura si/de otro modo correctamente. La prueba de escritorio debe trazar los valores paso a paso.',
    },
    {
      id: 's2p2', section: 2, pts: 3, difficulty: '⭐⭐',
      title: 'Clasificación de temperatura',
      prompt: `Se te da el siguiente ADP. Escribe el pseudocódigo completo y realiza la prueba de escritorio.

ENTRADAS: temperatura (en °C)
PROCESO:
  • Si temperatura < 0  → clasificacion = "Bajo cero"
  • de otro modo, si temperatura <= 15 → clasificacion = "Fría"
  • de otro modo, si temperatura <= 30 → clasificacion = "Templada"
  • de otro modo → clasificacion = "Caliente"
SALIDAS: clasificacion`,
      hint: 'Requiere condicionales anidados (si/de otro modo si). Prueba con al menos 4 valores distintos.',
    },
    {
      id: 's2p3', section: 2, pts: 4, difficulty: '⭐⭐⭐',
      title: 'Cálculo de bono',
      prompt: `Se te da el siguiente ADP. Escribe el pseudocódigo completo y realiza la prueba de escritorio.

ENTRADAS: salario, aniosServicio
PROCESO:
  • bono = 0
  • Si aniosServicio >= 5:
      Si salario < 1000 → bono = salario * 0.20
      de otro modo, → bono = salario * 0.10
  • de otro modo, (aniosServicio < 5):
      bono = salario * 0.05
  • salarioFinal = salario + bono
SALIDAS: bono, salarioFinal`,
      hint: 'Condicionales anidados y múltiples variables. Prueba con: (salario=1200, años=7).',
    },
    {
      id: 's2p4', section: 2, pts: 5, difficulty: '⭐⭐⭐',
      title: 'Prueba de escritorio',
      prompt: `Se te da el siguiente pseudocódigo, hagan la prueba de escritorio.

Problema: Clasificación de tarifa eléctricaProblema: Clasificación de tarifa eléctrica
Una empresa eléctrica cobra el consumo mensual de un cliente según estas reglas:

Se conocen los kWh consumidos y si el cliente es residencial o comercial (1 = residencial, 2 = comercial)
Clientes residenciales:

Primeros 100 kWh → $0.09 por kWh
De 101 a 300 kWh → los primeros 100 al precio anterior, el resto a $0.13 por kWh
Más de 300 kWh → los primeros 100 a $0.09, los siguientes 200 a $0.13, el excedente a $0.18 por kWh


Clientes comerciales: tarifa fija de $0.22 por kWh sin importar el consumo
A todos los clientes se les aplica el ITBMS del 7% sobre el total calculado
Mostrar: consumo, tarifa aplicada, subtotal, monto del ITBMS y total a pagar


Algoritmo TarifaElectrica
{
    //Bloque declarativo de constantes
    flotante ITBMS=0.07;  
    //Bloque declarativo de variables
    entero tipo_Cliente;
    flotante impuestos, potenciaConsumida, potenciaInicial, potenciaMedia, potenciaAlta, potenciaFacturada, total, subtotal;
    //Bloque de instrucciones
    imprimir("Ingrese 1 para cliente residencial y ingrese 2 para cliente comercial");
    leer(tipo_Cliente);
    imprimir("Ingrese la potencia utilizada en kWh (kilovatios por hora)");
    leer(potenciaConsumida);
    potenciaFacturada = potenciaConsumida;
    si(tipo_Cliente==1){
      si(potenciaConsumida>300){
        potenciaInicial = 100 * 0.09;
        potenciaConsumida -= 100;
        imprimir("Por los primeros 100 kWh se le cobrarán: $", potenciaInicial);
        potenciaMedia = 100 * 0.13;
        imprimir("Por los siguientes 100 kWh (200kWH) se le cobrarán: $", potenciaMedia);
        potenciaConsumida -= 100;
        potenciaAlta = potenciaConsumida * 0.18;
        imprimir("Por los ", potenciaConsumida,"kWh restantes se le cobraran: $", potenciaAlta);
        subtotal = potenciaInicial + potenciaMedia + potenciaAlta;
      }
      de otro modo si(potenciaConsumida>=101 && potenciaConsumida<=300){
        potenciaInicial = 100 * 0.09;
        potenciaConsumida -= 100;
        imprimir("Por los primeros 100 kWh se le cobrarán: $", potenciaInicial);
        potenciaMedia = potenciaConsumida * 0.13;
        imprimir("Por los siguientes", potenciaConsumida,"se le cobrarán: $", potenciaMedia);
        subtotal = potenciaInicial + potenciaMedia;
      }
      de otro modo si(potenciaConsumida<=100 && potenciaConsumida>0){
        subtotal = potenciaConsumida * 0.13;
        imprimir("Por los", potenciaConsumida,"kWh se le cobrarán: $", subtotal);
      }
      de otro modo{
        imprimir("Incorrecta cantidad de potencia (nula o negativa), ingrese las cantidades nuevamente");
      }
      imprimir("Tipo de cliente: Residencial");
    }
    de otro modo si(tipo_Cliente==2){
      si (potenciaConsumida>0){
        subtotal = potenciaConsumida * 0.22;
        imprimir("Por los", potenciaConsumida,"kWh se le cobrará: $", subtotal);
      }
      de otro modo{
        imprimir("Incorrecta cantidad de potencia (nula o negativa), ingrese las cantidades nuevamente")
      }
      imprimir("Tipo de cliente: Comercial");
    }
      
    de otro modo{
      imprimir("Cliente desconocido, ingrese valores entre el 1 y 2");
    }
    impuesto = subtotal * ITBMS;
    imprimir("El impuesto a cobrar es de: ", impuesto);
    total = subtotal + impuesto;
    imprimir("El total a pagar por", potenciaFacturada,"kWh fue de: $", total);
}`,
      hint: 'Son libres de hacer la prueba que quieran con el pseudocódigo dado, aunque intenten usar la combinación más rápida',
    },
  ],
};

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  phase: 'lobby',   // lobby | section1 | section2 | done
  groups: {},       // groupId → { name, code, members:[], scores:{s1p1:0,...}, attempts:{s1p1:3,...}, submitted:{} }
  queue: [],        // pending professor reviews: { id, groupId, problemId, text, image, attemptNum, ts }
  reviewed: [],     // completed reviews
};

let submissionCounter = 0;

function groupList() {
  return Object.values(state.groups).map(g => ({
    id: g.id, name: g.name, code: g.code,
    members: g.members,
    scores: g.scores,
    attempts: g.attempts,
    memberCount: g.members.length,
  }));
}

function scoreboard() {
  return Object.values(state.groups)
    .map(g => ({
      id: g.id, name: g.name,
      total: Object.values(g.scores).reduce((a, b) => a + b, 0),
      scores: g.scores,
    }))
    .sort((a, b) => b.total - a.total);
}

function broadcast() {
  io.emit('state', {
    phase: state.phase,
    scoreboard: scoreboard(),
    queueLen: state.queue.length,
  });
}

function broadcastGroups() {
  io.emit('groups', groupList());
}

// ─── Socket ──────────────────────────────────────────────────────────────────
io.on('connection', socket => {
  socket.emit('state', { phase: state.phase, scoreboard: scoreboard(), queueLen: state.queue.length });
  socket.emit('groups', groupList());

  // ── Create group ──
  socket.on('createGroup', ({ groupName, memberName }) => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; var code=''; for(var i=0;i<4;i++) code+=letters[Math.floor(Math.random()*letters.length)];
    const groupId = 'g_' + Date.now();
    const scores = {}, attempts = {}, submitted = {};
    [...state.problems_s1_ids, ...state.problems_s2_ids].forEach(id => {
      scores[id] = 0; attempts[id] = 3; submitted[id] = false;
    });
    state.groups[groupId] = { id: groupId, name: groupName.trim(), code, members: [memberName.trim()], scores, attempts, submitted };
    socket.groupId = groupId;
    socket.memberName = memberName.trim();
    socket.emit('joinedGroup', { groupId, code, groupName: groupName.trim(), isLeader: true,
      scores: state.groups[groupId].scores, attempts: state.groups[groupId].attempts });
    broadcastGroups();
    broadcast();
  });

  // ── Join group by code ──
  socket.on('joinGroup', ({ code, memberName }) => {
    const group = Object.values(state.groups).find(g => g.code === code.toUpperCase().trim());
    if (!group) { socket.emit('joinError', 'Código incorrecto o la sesión se reinició. Pídele al líder que cree el grupo de nuevo.'); return; }
    if (!group.members.includes(memberName.trim())) group.members.push(memberName.trim());
    socket.groupId = group.id;
    socket.memberName = memberName.trim();
    socket.emit('joinedGroup', { groupId: group.id, code: group.code, groupName: group.name, isLeader: false,
      scores: group.scores, attempts: group.attempts });
    broadcastGroups();
  });

  // ── Submit answer ──
  socket.on('submitAnswer', ({ problemId, text, imageData }) => {
    const group = state.groups[socket.groupId];
    if (!group) { socket.emit('submitError', 'Grupo no encontrado. Reconéctate.'); return; }
    if (state.phase === 'lobby') { socket.emit('submitError', 'La actividad aún no ha comenzado.'); return; }
    if (state.phase === 'done') { socket.emit('submitError', 'La actividad ya terminó.'); return; }
    if (state.phase === 'section1' && problemId.startsWith('s2')) { socket.emit('submitError', 'La Sección 2 aún no está activa.'); return; }
    if (state.phase === 'section2' && problemId.startsWith('s1')) { socket.emit('submitError', 'La Sección 1 ya cerró.'); return; }
    if (group.attempts[problemId] <= 0) { socket.emit('submitError', 'Sin intentos restantes para este problema.'); return; }
    if (group.scores[problemId] > 0) { socket.emit('submitError', 'Ya resolviste este problema correctamente.'); return; }

    const subId = 'sub_' + (++submissionCounter);
    // normalise imageData to always be an array
    let images = [];
    if(Array.isArray(imageData)) images = imageData.filter(Boolean);
    else if(imageData) images = [imageData];

    const submission = {
      id: subId, groupId: group.id, groupName: group.name,
      problemId, text: text || '', images,
      attemptNum: 4 - group.attempts[problemId],
      attemptsLeft: group.attempts[problemId],
      ts: Date.now(),
    };
    state.queue.push(submission);
    socket.emit('submitted', { subId, problemId, attemptsLeft: group.attempts[problemId] });
    // Notify professor
    io.emit('newSubmission', submission);
    broadcast();
  });

  // ── Professor: set phase ──
  socket.on('prof:setPhase', ({ phase }) => {
    state.phase = phase;
    broadcast();
    io.emit('phaseChanged', phase);
  });

  // ── Professor: review submission ──
  socket.on('prof:review', ({ subId, correct }) => {
    const idx = state.queue.findIndex(s => s.id === subId);
    if (idx === -1) return;
    const sub = state.queue.splice(idx, 1)[0];
    const group = state.groups[sub.groupId];
    if (!group) return;

    if (correct) {
      const prob = [...PROBLEMS.s1, ...PROBLEMS.s2].find(p => p.id === sub.problemId);
      group.scores[sub.problemId] = prob ? prob.pts : 1;
      group.attempts[sub.problemId] = 0; // no more attempts needed
      sub.result = 'correct';
    } else {
      group.attempts[sub.problemId] = Math.max(0, group.attempts[sub.problemId] - 1);
      sub.result = 'incorrect';
      sub.attemptsLeft = group.attempts[sub.problemId];
    }
    state.reviewed.push(sub);

    // Notify the group
    io.emit('reviewResult', {
      groupId: sub.groupId, problemId: sub.problemId,
      correct, attemptsLeft: group.attempts[sub.problemId],
      score: group.scores[sub.problemId],
    });
    broadcastGroups();
    broadcast();
    io.emit('queueUpdate', state.queue);
  });

  // ── Professor: skip/discard submission ──
  socket.on('prof:skip', ({ subId }) => {
    const idx = state.queue.findIndex(s => s.id === subId);
    if (idx !== -1) state.queue.splice(idx, 1);
    io.emit('queueUpdate', state.queue);
    broadcast();
  });

  socket.on('disconnect', () => {
    // remove member from group if socket disconnects
    if (socket.groupId && socket.memberName) {
      const group = state.groups[socket.groupId];
      if (group) {
        group.members = group.members.filter(m => m !== socket.memberName);
        broadcastGroups();
      }
    }
  });

  // ── Student rejoin (reconnect with saved credentials) ──
  socket.on('rejoin', ({ groupId, memberName }) => {
    const group = state.groups[groupId];
    if (!group) { socket.emit('rejoinFailed'); return; }
    if (!group.members.includes(memberName.trim())) group.members.push(memberName.trim());
    socket.groupId = groupId;
    socket.memberName = memberName.trim();
    // Send joinedGroup first so client restores group state
    socket.emit('joinedGroup', {
      groupId, code: group.code, groupName: group.name, isLeader: false,
      scores: group.scores, attempts: group.attempts
    });
    // Then send current phase so client navigates to right screen
    socket.emit('state', { phase: state.phase, scoreboard: scoreboard(), queueLen: state.queue.length });
    broadcastGroups();
  });

  // ── Student requests current state ──
  socket.on('requestState', () => {
    socket.emit('state', {
      phase: state.phase,
      scoreboard: scoreboard(),
      queueLen: state.queue.length,
    });
  });

  // ── Get queue (professor reconnect) ──
  socket.on('prof:getQueue', () => {
    socket.emit('queueUpdate', state.queue);
  });

  // ── Get problems ──
  socket.on('getProblems', () => {
    socket.emit('problems', PROBLEMS);
  });
});

// Pre-compute problem IDs on state
state.problems_s1_ids = PROBLEMS.s1.map(p => p.id);
state.problems_s2_ids = PROBLEMS.s2.map(p => p.id);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/student', (req, res) => res.sendFile(path.join(__dirname, 'public', 'student.html')));
app.get('/prof',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'professor.html')));
app.get('/',        (req, res) => res.sendFile(path.join(__dirname, 'public', 'professor.html')));

// ─── Start ───────────────────────────────────────────────────────────────────
httpServer.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║      HACKATHON DLA — Servidor iniciado        ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Profesor:    http://localhost:${PORT}             ║`);
  console.log(`║  Estudiantes: http://${ip}:${PORT}/student    ║`);
  console.log('╚══════════════════════════════════════════════╝\n');
});
