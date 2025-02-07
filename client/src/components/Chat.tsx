import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Grid } from '@mui/joy';
import stockfishImg from './imgs/stockfish.png';

interface ChatComponentProps {
  messages: string[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ messages, messagesEndRef }) => {
  return (
    <Grid xs={12} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h6">Chat de Sugestões</Typography>
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 1,
          boxShadow: 1,
          width: 419,
          p: 2,
          height: 400,
          overflowY: 'auto',
          marginBottom: 2,
          color: 'black',
          mt: 2,
        }}
      >
        {messages.map((msg, index) => (
          <Grid key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={stockfishImg} sx={{ mr: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, border: '1px solid blue', borderRadius: 1, p: 1 }}>
              <Typography variant="body1">{msg}</Typography>
            </Box>
          </Grid>
        ))}
        <div ref={messagesEndRef} />
      </Box>
    </Grid>
  );
};

export default ChatComponent;
