document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const scoreArea = document.getElementById('scoreArea');
    const capturedPiecesArea = document.getElementById('capturedPiecesArea');
    const moveList = document.getElementById('moveList');
    
    let pieces = {
        1: '♜', 2: '♞', 3: '♝', 4: '♛', 5: '♚', 6: '♝', 7: '♞', 8: '♜',
        9: '♟', 10: '♟', 11: '♟', 12: '♟', 13: '♟', 14: '♟', 15: '♟', 16: '♟',
        49: '♙', 50: '♙', 51: '♙', 52: '♙', 53: '♙', 54: '♙', 55: '♙', 56: '♙',
        57: '♖', 58: '♘', 59: '♗', 60: '♕', 61: '♔', 62: '♗', 63: '♘', 64: '♖'
    };
    let boardState = Array(64).fill(null);
    let moveHistory = [];
    let gameOver = false;
    let playerTurn = 'white';
    let possibleMoves = [];
    let selectedPiece = null;
    let scores = { white: 0, black: 0 };
    let capturedPieces = { white: [], black: [] };
    let soundOn = true;
    let kings = { white: 61, black: 5 };
    
    const drawBoard = () => {
        board.innerHTML = '';
        for (let i = 1; i <= 64; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.index = i;
            if (pieces[i]) {
                square.innerText = pieces[i];
            }
            square.addEventListener('click', () => handleSquareClick(i));
            board.appendChild(square);
        }
    };

    const clearHighlights = () => {
        document.querySelectorAll('.highlight, .capture, .check, .selected').forEach(square => {
            square.classList.remove('highlight', 'capture', 'check', 'selected');
        });
    };

    const highlightMoves = (piece, index) => {
        clearHighlights();
        document.querySelector(`.square[data-index="${index}"]`).classList.add('selected');
        possibleMoves = generateMoves(piece, index);
        possibleMoves.forEach(move => {
            const square = document.querySelector(`.square[data-index='${move}']`);
            if (pieces[move]) {
                square.classList.add('capture');
            } else {
                square.classList.add('highlight');
            }
        });
    };

    const generateMoves = (piece, index) => {
        const moves = [];
        const pos = parseInt(index, 10);
        const x = (pos - 1) % 8;
        const y = Math.floor((pos - 1) / 8);
        const color = piece.match(/[♙♖♘♗♕♔]/) ? 'white' : 'black';

        const addMove = (newPos) => {
            if (newPos >= 1 && newPos <= 64) {
                if (!pieces[newPos] || (pieces[newPos] && isPieceColor(pieces[newPos]) !== color)) {
                    moves.push(newPos);
                }
            }
        };

        const addMoveUntilBlocked = (dx, dy) => {
            let newX = x + dx;
            let newY = y + dy;
            while (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                const newPos = newY * 8 + newX + 1;
                if (!pieces[newPos]) {
                    moves.push(newPos);
                } else {
                    if (isPieceColor(pieces[newPos]) !== color) {
                        moves.push(newPos);
                    }
                    break;
                }
                newX += dx;
                newY += dy;
            }
        };

        switch (piece) {
            case '♙': // White Pawn
                if (y > 0 && !pieces[pos - 8]) {
                    moves.push(pos - 8);
                    if (y === 6 && !pieces[pos - 16]) {
                        moves.push(pos - 16);
                    }
                }
                if (y > 0 && x > 0 && pieces[pos - 9] && isPieceColor(pieces[pos - 9]) === 'black') {
                    moves.push(pos - 9);
                }
                if (y > 0 && x < 7 && pieces[pos - 7] && isPieceColor(pieces[pos - 7]) === 'black') {
                    moves.push(pos - 7);
                }
                break;
            case '♟': // Black Pawn
                if (y < 7 && !pieces[pos + 8]) {
                    moves.push(pos + 8);
                    if (y === 1 && !pieces[pos + 16]) {
                        moves.push(pos + 16);
                    }
                }
                if (y < 7 && x > 0 && pieces[pos + 7] && isPieceColor(pieces[pos + 7]) === 'white') {
                    moves.push(pos + 7);
                }
                if (y < 7 && x < 7 && pieces[pos + 9] && isPieceColor(pieces[pos + 9]) === 'white') {
                    moves.push(pos + 9);
                }
                break;
            case '♖':
            case '♜': // Rook
                addMoveUntilBlocked(1, 0);
                addMoveUntilBlocked(-1, 0);
                addMoveUntilBlocked(0, 1);
                addMoveUntilBlocked(0, -1);
                break;
            case '♘':
            case '♞': // Knight
                const knightMoves = [
                    {dx: -2, dy: -1}, {dx: -2, dy: 1},
                    {dx: -1, dy: -2}, {dx: -1, dy: 2},
                    {dx: 1, dy: -2}, {dx: 1, dy: 2},
                    {dx: 2, dy: -1}, {dx: 2, dy: 1}
                ];
                knightMoves.forEach(move => {
                    const newX = x + move.dx;
                    const newY = y + move.dy;
                    if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                        addMove(newY * 8 + newX + 1);
                    }
                });
                break;
            case '♗':
            case '♝': // Bishop
                addMoveUntilBlocked(1, 1);
                addMoveUntilBlocked(1, -1);
                addMoveUntilBlocked(-1, 1);
                addMoveUntilBlocked(-1, -1);
                break;
            case '♕':
            case '♛': // Queen
                addMoveUntilBlocked(1, 0);
                addMoveUntilBlocked(-1, 0);
                addMoveUntilBlocked(0, 1);
                addMoveUntilBlocked(0, -1);
                addMoveUntilBlocked(1, 1);
                addMoveUntilBlocked(1, -1);
                addMoveUntilBlocked(-1, 1);
                addMoveUntilBlocked(-1, -1);
                break;
            case '♔':
            case '♚': // King
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx !== 0 || dy !== 0) {
                            const newX = x + dx;
                            const newY = y + dy;
                            if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                                addMove(newY * 8 + newX + 1);
                            }
                        }
                    }
                }
                break;
        }

        return moves.filter(move => !wouldBeInCheck(piece, index, move));
    };

    const isPieceColor = (piece) => {
        return piece.match(/[♙♖♘♗♕♔]/) ? 'white' : 'black';
    };

    const handleSquareClick = (index) => {
        const piece = pieces[index];
        if (selectedPiece) {
            if (possibleMoves.includes(index)) {
                movePiece(selectedPiece, index);
                clearHighlights();
                selectedPiece = null;
                playerTurn = playerTurn === 'white' ? 'black' : 'white';
                updateGameStatus();
            } else {
                selectedPiece = null;
                clearHighlights();
            }
        } else if (piece && isPieceColor(piece) === playerTurn) {
            selectedPiece = index;
            highlightMoves(piece, index);
        }
    };

    const movePiece = (from, to) => {
        const piece = pieces[from];
        if (pieces[to]) {
            capturePiece(to);
        }
        pieces[to] = piece;
        delete pieces[from];
        
        // Update king position if moved
        if (piece === '♔') kings.white = to;
        if (piece === '♚') kings.black = to;

        // Pawn promotion
        if ((piece === '♙' && to <= 8) || (piece === '♟' && to >= 57)) {
            pieces[to] = piece === '♙' ? '♕' : '♛'; // Promote to Queen
        }

        drawBoard();
        playSound('moveSound');
        updateMoveHistory(piece, from, to);

        if (isCheck(playerTurn === 'white' ? 'black' : 'white')) {
            playSound('checkSound');
            if (isCheckmate(playerTurn === 'white' ? 'black' : 'white')) {
                gameOver = true;
                scores[playerTurn]++;
                updateScore();
            }
        }
    };

    const capturePiece = (index) => {
        const capturedPiece = pieces[index];
        const capturedBy = playerTurn === 'white' ? 'white' : 'black';
        capturedPieces[capturedBy].push(capturedPiece);
        updateCapturedPieces();
        playSound('captureSound');
    };

    const updateMoveHistory = (piece, from, to) => {
        const move = `${piece} ${indexToNotation(from)} → ${indexToNotation(to)}`;
        moveHistory.push(move);
        updateMoveList();
    };

    const indexToNotation = (index) => {
        const file = String.fromCharCode('a'.charCodeAt(0) + ((index - 1) % 8));
        const rank = 8 - Math.floor((index - 1) / 8);
        return `${file}${rank}`;
    };

    const updateMoveList = () => {
        moveList.innerHTML = '';
        moveHistory.forEach((move, index) => {
            const listItem = document.createElement('li');
            listItem.innerText = `${Math.floor(index / 2) + 1}. ${move}`;
            moveList.appendChild(listItem);
        });
        moveList.scrollTop = moveList.scrollHeight;
    };

    const updateGameStatus = () => {
        if (gameOver) {
            status.innerText = `Game Over - ${playerTurn === 'white' ? 'White' : 'Black'} wins!`;
        } else if (isCheck(playerTurn)) {
            status.innerText = `${playerTurn === 'white' ? 'White' : 'Black'} is in check!`;
        } else {
            status.innerText = `Turn: ${playerTurn === 'white' ? 'White' : 'Black'}`;
        }
    };

    const updateScore = () => {
        scoreArea.innerHTML = `White: ${scores.white} | Black: ${scores.black}`;
    };

    const updateCapturedPieces = () => {
        capturedPiecesArea.innerHTML = `
            Captured:
            <div>White: ${capturedPieces.white.join(' ')}</div>
            <div>Black: ${capturedPieces.black.join(' ')}</div>
        `;
    };

    const toggleSound = () => {
        soundOn = !soundOn;
        document.getElementById('toggleSound').classList.toggle('sound-on', soundOn);
        document.getElementById('toggleSound').classList.toggle('sound-off', !soundOn);
    };

    const playSound = (soundId) => {
        if (soundOn) {
            document.getElementById(soundId).play();
        }
    };

    const showHints = () => {
        if (selectedPiece) {
            highlightMoves(pieces[selectedPiece], selectedPiece);
        } else {
            alert('Select a piece to see hints');
        }
    };

    const isCheck = (color) => {
        const kingPos = kings[color];
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        for (let i = 1; i <= 64; i++) {
            if (pieces[i] && isPieceColor(pieces[i]) === opponentColor) {
                const moves = generateMoves(pieces[i], i);
                if (moves.includes(kingPos)) {
                    document.querySelector(`.square[data-index="${kingPos}"]`).classList.add('check');
                    return true;
                }
            }
        }
        return false;
    };

    const isCheckmate = (color) => {
        if (!isCheck(color)) return false;

        for (let i = 1; i <= 64; i++) {
            if (pieces[i] && isPieceColor(pieces[i]) === color) {
                const moves = generateMoves(pieces[i], i);
                if (moves.length > 0) return false;
            }
        }
        return true;
    };

    const wouldBeInCheck = (piece, from, to) => {
        const originalPiece = pieces[to];
        pieces[to] = piece;
        delete pieces[from];

        const inCheck = isCheck(isPieceColor(piece));

        pieces[from] = piece;
        if (originalPiece) {
            pieces[to] = originalPiece;
        } else {
            delete pieces[to];
        }

        return inCheck;
    };

    document.getElementById('resetBoard').addEventListener('click', () => {
        pieces = {
            1: '♜', 2: '♞', 3: '♝', 4: '♛', 5: '♚', 6: '♝', 7: '♞', 8: '♜',
            9: '♟', 10: '♟', 11: '♟', 12: '♟', 13: '♟', 14: '♟', 15: '♟', 16: '♟',
            49: '♙', 50: '♙', 51: '♙', 52: '♙', 53: '♙', 54: '♙', 55: '♙', 56: '♙',
            57: '♖', 58: '♘', 59: '♗', 60: '♕', 61: '♔', 62: '♗', 63: '♘', 64: '♖'
        };
        boardState = Array(64).fill(null);
        moveHistory = [];
        gameOver = false;
        playerTurn = 'white';
        capturedPieces = { white: [], black: [] };
        kings = { white: 61, black: 5 };
        drawBoard();
        updateMoveList();
        updateGameStatus();
        updateScore();
        updateCapturedPieces();
    });

    document.getElementById('undoMove').addEventListener('click', () => {
        if (moveHistory.length > 0) {
            // Implement undo logic here
            alert('Undo feature not fully implemented yet.');
        }
    });

    document.getElementById('toggleSound').addEventListener('click', toggleSound);
    document.getElementById('showHints').addEventListener('click', showHints);

    drawBoard();
    updateGameStatus();
    updateScore();
    updateCapturedPieces();
});