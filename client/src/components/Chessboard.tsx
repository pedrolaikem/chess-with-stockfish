import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Container, Typography, Button, TextField, List, ListItem, Avatar, Box } from '@mui/material';
import { Grid } from '@mui/joy';
import io from 'socket.io-client';
import { Chess } from 'chess.js';
import Chat from './Chat';
import OpeningDetector from './OpeningDetector';

const socket = io('http://localhost:5000'); // Endereço do servidor Node.js

const ChessBoard: React.FC = () => {
  const [messages, setMessages] = useState<string[]>(['Seja bem vindo, vamos jogar xadrez!']);
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const [previousMove, setPreviousMove] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (sourceSquare: string, targetSquare: string) => {
    const move = {
      from: sourceSquare,
      to: targetSquare,
    };

    try {
      const moveResult = game.move(move);

      if (!moveResult) throw new Error('Movimento inválido');

      setPosition(game.fen());
      setPreviousMove(moveResult.san);
      socket.emit('user_move', moveResult.san);
      
      // Verifica se o jogo terminou com cheque-mate
      if (game.isCheckmate()) {
        const winnerColor = game.turn() === 'w' ? 'pretas' : 'brancas'; // A cor que venceu é a que não está em cheque
        setMessages((prev) => [...prev, `Cheque-mate! As ${winnerColor} venceram!`]);
      }

      return true
      
    } catch (error) {
      console.error("Movimento inválido:", move);
      setMessages((prev) => [...prev, 'Movimento inválido!']);
      return false
    }

  };

  useEffect(() => {
    socket.on('stockfish_move', (suggestion: string) => {
      const playerColor = game.turn() == 'w' ? 'brancas' : 'pretas';
      const opponentColor = game.turn() == 'w' ? 'pretas' : 'brancas';
      // Cria a mensagem com a jogada anterior e a sugestão do Stockfish
      const message = previousMove
        ? `As ${opponentColor} jogaram: ${previousMove}. Eu recomendo que as ${playerColor} joguem: ${suggestion}.`
        : `Eu recomendo que as ${playerColor} joguem: ${suggestion}.`;

      if (!game.isCheckmate()) {
        setMessages((prev) => [...prev, message]);
      }
      console.log(suggestion);
    });

    return () => {
      socket.off('stockfish_move');
    };
  }, [previousMove]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const resetBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    setMessages(['Você gostaria de tentar outras jogadas?']);
    setPreviousMove(null);
    socket.emit('reset_board');
  };

  return (
    <Container>
      <Grid container spacing={2}>

        <Grid xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>

          <Chessboard position={position} onPieceDrop={handleMove} boardWidth={600} />
          <OpeningDetector game={game} setMessages={setMessages} />

          {/* Área de Chat */}
          <Grid xs={12} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Chat messages={messages} messagesEndRef={messagesEndRef} />

            {/* Botão de Reset */}
            <Button variant="contained" color="primary" onClick={resetBoard} style={{ marginTop: '20px' }}>
              Resetar Tabuleiro
            </Button>
          </Grid>
        </Grid>
      </Grid>


    </Container>
  );
};

export default ChessBoard;
