document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const scoreArea = document.getElementById('scoreArea');
    const capturedPiecesArea = document.getElementById('capturedPiecesArea');
    const moveList = document.getElementById('moveList');
    
    const pieces = {
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
        document.querySelectorAll('.highlight, .capture').forEach(square => {
            square.classList.remove('highlight', 'capture');
        });
    };

    const highlightMoves = (piece, index) => {
        clearHighlights();
        const pos = parseInt(index, 10);
        possibleMoves = [];

        // This is a simplified move generation. You'll need to implement proper chess rules here.
        if (piece === '♙' || piece === '♟') {
            const direction = piece === '♙' ? -1 : 1;
            const move = pos + (direction * 8);
            if (move >= 1 && move <= 64 && !pieces[move]) {
                possibleMoves.push(move);
            }
            // Add capture moves
            [-1, 1].forEach(offset => {
                const capture = move + offset;
                if (capture >= 1 && capture <= 64 && pieces[capture] && 
                    ((piece === '♙' && pieces[capture].match(/[♟♜♞♝♛♚]/)) ||
                     (piece === '♟' && pieces[capture].match(/[♙♖♘♗♕♔]/)))) {
                    possibleMoves.push(capture);
                }
            });
        }
        // Add move generation for other pieces here

        possibleMoves.forEach(move => {
            const square = document.querySelector(`.square[data-index='${move}']`);
            if (pieces[move]) {
                square.classList.add('capture');
            } else {
                square.classList.add('highlight');
            }
        });
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
        } else if (piece && ((playerTurn === 'white' && piece.match(/[♙♖♘♗♕♔]/)) ||
                             (playerTurn === 'black' && piece.match(/[♟♜♞♝♛♚]/)))) {
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
        drawBoard();
        playSound('moveSound');
        updateMoveHistory(piece, from, to);
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
        status.innerText = gameOver ? 'Game Over' : `Turn: ${playerTurn}`;
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
        scores = { white: 0, black: 0 };
        capturedPieces = { white: [], black: [] };
        drawBoard();
        updateMoveList();
        updateGameStatus();
        updateScore();
        updateCapturedPieces();
    });

    document.getElementById('undoMove').addEventListener('click', () => {
        if (moveHistory.length > 0) {
            moveHistory.pop();
            // Implement logic to revert the board state
            drawBoard();
            updateMoveList();
            playerTurn = playerTurn === 'white' ? 'black' : 'white';
            updateGameStatus();
        }
    });

    document.getElementById('aiMove').addEventListener('click', () => {
        // Implement AI move logic here
        alert('AI Move feature not implemented yet.');
    });

    document.getElementById('toggleSound').addEventListener('click', toggleSound);
    document.getElementById('showHints').addEventListener('click', showHints);

    drawBoard();
    updateGameStatus();
    updateScore();
    updateCapturedPieces();
});