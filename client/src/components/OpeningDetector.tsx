import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';

interface OpeningDetectorProps {
    game: Chess;
    setMessages: React.Dispatch<React.SetStateAction<string[]>>;
}

const OpeningDetector: React.FC<OpeningDetectorProps> = ({ game, setMessages }) => {
    const [lastOpening, setLastOpening] = useState<string | null>(null);

    useEffect(() => {
        const fetchOpening = async () => {
            const movesUCI = game.history({ verbose: true }).map((move) => move.from + move.to).join(',');
            if (movesUCI) {
                try {
                    const response = await fetch(`https://explorer.lichess.ovh/masters?play=${encodeURIComponent(movesUCI)}`);
                    if (!response.ok) {
                        throw new Error('Erro na requisição');
                    }
                    const data = await response.json();

                    if (data.opening && data.opening.name !== lastOpening) {
                        setLastOpening(data.opening.name);
                        setMessages((prev) => [...prev, `A abertura jogada é: ${data.opening.name}`]);
                    }
                    
                } catch (error) {
                    console.error('Erro ao buscar abertura:', error);
                }
            }
        };

        fetchOpening();
    }, [game.history().length, lastOpening, setMessages]);

    return null;
};

export default OpeningDetector;
