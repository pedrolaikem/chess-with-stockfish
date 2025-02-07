const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/db');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();
const { Chess } = require('chess.js');

app.use(express.json());
app.use('/auth', authRoutes);
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});


const stockfishPath = 'C:\\Users\\Usuario\\Desktop\\Stockfish\\stockfish\\stockfish-windows-x86-64-avx2.exe';
const stockfish = spawn(stockfishPath);

let chess = new Chess(); // Instancia o objeto Chess

stockfish.stdin.write('uci\n');

io.on('connection', (socket) => {
  socket.on('user_move', (move) => {
    // Verifica se o movimento é válido
    const moveResult = chess.move(move);
    
    if (moveResult) {
      // Atualiza a posição e solicita a melhor jogada
      stockfish.stdin.write(`position fen ${chess.fen()}\n`);
      stockfish.stdin.write('go movetime 500\n');
      console.log(`Movimento do usuário: ${move}`);
    }
  });

  stockfish.stdout.on('data', (data) => {
    const message = data.toString();
    if (message.includes('bestmove')) {
      console.log(message);
      const bestMove = message.split('bestmove ')[1].split(' ')[0];
      socket.emit('stockfish_move', bestMove); // Envia a melhor jogada sugerida
      console.log(`Melhor jogada sugerida pelo Stockfish: ${bestMove}`);
      // Não atualiza o tabuleiro com a jogada sugerida, apenas retorna ao cliente
    }
  });

  socket.on('reset_board', () => {
    chess = new Chess(); // Reinicia o objeto Chess para um novo jogo
    console.log('O tabuleiro foi resetado pelo usuário');
  });

});

sequelize.sync()
  .then(() => server.listen(5000, () => console.log('Servidor rodando na porta 5000')))
  .catch((err) => console.log('Erro ao sincronizar o banco de dados:', err));
