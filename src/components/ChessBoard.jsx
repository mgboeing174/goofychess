import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import './ChessBoard.css';

const ChessBoard = ({ game, position, onMove, squareSize, orientation = 'white' }) => {
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});

    const customDarkSquareStyle = { backgroundColor: '#1a1a2e' };
    const customLightSquareStyle = { backgroundColor: '#16213e' };

    const getMoveOptions = (square) => {
        const moves = game.moves({
            square,
            verbose: true
        });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares = {};
        moves.forEach((move) => {
            newSquares[move.to] = {
                background:
                    game.get(move.to) && game.get(move.to).color !== game.get(square).color
                        ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 30%, transparent 30%)',
                borderRadius: '50%'
            };
        });
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)'
        };
        setOptionSquares(newSquares);
        return true;
    };

    const onSquareClick = (square) => {
        // from square
        if (!moveFrom) {
            const hasMoves = getMoveOptions(square);
            if (hasMoves) setMoveFrom(square);
            return;
        }

        // to square
        const move = onMove(moveFrom, square);
        if (move) {
            setMoveFrom('');
            setOptionSquares({});
        } else {
            const hasMoves = getMoveOptions(square);
            if (hasMoves) setMoveFrom(square);
            else setMoveFrom('');
        }
    };

    return (
        <div className="chessboard-container">
            <Chessboard 
                position={position} 
                onPieceDrop={onMove}
                onSquareClick={onSquareClick}
                boardOrientation={orientation}
                boardWidth={squareSize * 8}
                animationDuration={300}
                showBoardCode={true}
                customDarkSquareStyle={customDarkSquareStyle}
                customLightSquareStyle={customLightSquareStyle}
                customSquareStyles={optionSquares}
            />
        </div>
    );
};

export default ChessBoard;
