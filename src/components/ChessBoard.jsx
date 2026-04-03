import React from 'react';
import { Chessboard } from 'react-chessboard';
import './ChessBoard.css';

const ChessBoard = ({ position, onMove, squareSize, orientation = 'white', lastMove }) => {
    
    const customDarkSquareStyle = { backgroundColor: '#1a1a2e' };
    const customLightSquareStyle = { backgroundColor: '#16213e' };
    
    return (
        <div className="chessboard-container glass-panel">
            <Chessboard 
                position={position} 
                onPieceDrop={onMove}
                boardOrientation={orientation}
                boardWidth={squareSize * 8}
                customDarkSquareStyle={customDarkSquareStyle}
                customLightSquareStyle={customLightSquareStyle}
                customPieces={{
                    // We can add custom pieces here if needed
                }}
            />
        </div>
    );
};

export default ChessBoard;
