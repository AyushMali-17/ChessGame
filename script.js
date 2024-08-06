document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    const status = document.getElementById('status');
    const hintArea = document.getElementById('hint');
    const scoreArea = document.getElementById('score');
    const squares = 64;
    const pieces = {
        '1': '♖', '2': '♘', '3': '♗', '4': '♕', '5': '♔', '6': '♗', '7': '♘', '8': '♖',
        '9': '♙', '10': '♙', '11': '♙', '12': '♙', '13': '♙', '14': '♙', '15': '♙', '16': '♙',
        '49': '♟', '50': '♟', '51': '♟', '52': '♟', '53': '♟', '54': '♟', '55': '♟', '56': '♟',
        '57': '♜', '58': '♞', '59': '♝', '60': '♛', '61': '♚', '62': '♝', '63': '♞', '64': '♜'
    };

    let boardState = Array(squares).fill(null);
    let moveHistory = [];
    let selectedPiece = null;
    let possibleMoves = [];
    let gameOver = false;
    let playerTurn = 'white'; // Player turn ('white' or 'black')
    let scores = { white: 0, black: 0 }; // Score tracking

    const drawBoard = () => {
        board.innerHTML = '';
        for (let i = 1; i <= squares; i++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.index = i;

            if (pieces[i]) {
                const piece = document.createElement('div');
                piece.className = 'piece';
                piece.innerText = pieces[i];
                square.appendChild(piece);
                boardState[i - 1] = pieces[i];
            } else {
                boardState[i - 1] = null;
            }

            board.appendChild(square);
        }
        updateGameStatus();
        updateScore();
    };

    const clearHighlights = () => {
        possibleMoves.forEach(index => {
            const square = document.querySelector(`.square[data-index='${index}']`);
            if (square) {
                square.classList.remove('highlight');
                square.classList.remove('capture');
            }
        });
        possibleMoves = [];
    };

    const highlightMoves = (piece, position) => {
        const pos = parseInt(position);
        const isWhite = piece === '♙' || piece === '♖' || piece === '♘' || piece === '♗' || piece === '♕' || piece === '♔';
        possibleMoves = [];

        const getPosition = (x, y) => x >= 1 && x <= 8 && y >= 1 && y <= 8 ? `${x + (y - 1) * 8}` : null;

        if (piece === '♙') {
            const move = getPosition(pos % 8, Math.floor(pos / 8) + 1);
            if (move && !document.querySelector(`.square[data-index='${move}'] .piece`)) {
                possibleMoves.push(move);
            }
            const captureLeft = getPosition((pos % 8) - 1, Math.floor(pos / 8) + 1);
            const captureRight = getPosition((pos % 8) + 1, Math.floor(pos / 8) + 1);

            [captureLeft, captureRight].forEach(capture => {
                if (capture) {
                    const target = document.querySelector(`.square[data-index='${capture}'] .piece`);
                    if (target && target.innerText.match(/[♜♞♝♛♚♟]/)) {
                        possibleMoves.push(capture);
                    }
                }
            });
        }

        if (piece === '♟') {
            const move = getPosition(pos % 8, Math.floor(pos / 8) - 1);
            if (move && !document.querySelector(`.square[data-index='${move}'] .piece`)) {
                possibleMoves.push(move);
            }
            const captureLeft = getPosition((pos % 8) - 1, Math.floor(pos / 8) - 1);
            const captureRight = getPosition((pos % 8) + 1, Math.floor(pos / 8) - 1);

            [captureLeft, captureRight].forEach(capture => {
                if (capture) {
                    const target = document.querySelector(`.square[data-index='${capture}'] .piece`);
                    if (target && target.innerText.match(/[♖♘♗♕♔]/)) {
                        possibleMoves.push(capture);
                    }
                }
            });
        }

        possibleMoves.forEach(index => {
            const square = document.querySelector(`.square[data-index='${index}']`);
            if (square) {
                const isCapture = document.querySelector(`.square[data-index='${index}'] .piece`);
                square.classList.add(isCapture ? 'capture' : 'highlight');
            }
        });
    };

    const saveGame = () => {
        localStorage.setItem('chessGameState', JSON.stringify({
            boardState,
            moveHistory,
            gameOver,
            playerTurn,
            scores // Save scores
        }));
        alert('Game saved successfully!');
    };

    const loadGame = () => {
        const savedState = JSON.parse(localStorage.getItem('chessGameState'));

        if (savedState) {
            boardState = savedState.boardState;
            moveHistory = savedState.moveHistory;
            gameOver = savedState.gameOver;
            playerTurn = savedState.playerTurn;
            scores = savedState.scores || scores; // Load scores if available
            for (let i = 0; i < squares; i++) {
                pieces[i + 1] = boardState[i];
            }
            drawBoard();
            updateMoveList();
            updateGameStatus();
            updateScore();
            alert('Game loaded successfully!');
        } else {
            alert('No saved game found.');
        }
    };

    const updateMoveHistory = (piece, from, to) => {
        moveHistory.push(`${piece} moved from ${from} to ${to}`);
    };

    const updateMoveList = () => {
        const moveList = document.getElementById('moveList');
        moveList.innerHTML = '';
        moveHistory.forEach(move => {
            const listItem = document.createElement('li');
            listItem.innerText = move;
            moveList.appendChild(listItem);
        });
    };

    const updateGameStatus = () => {
        if (gameOver) {
            status.innerText = 'Game Over!';
            status.style.color = 'red';
        } else {
            status.innerText = `Turn: ${playerTurn}`;
            status.style.color = playerTurn === 'white' ? 'blue' : 'black';
        }
    };

    const updateScore = () => {
        scoreArea.innerText = `White: ${scores.white} | Black: ${scores.black}`;
    };

    const resetBoard = () => {
        drawBoard();
        moveHistory = [];
        updateMoveList();
        gameOver = false;
        playerTurn = 'white';
        updateGameStatus();
    };

    const movePiece = (from, to) => {
        const fromSquare = document.querySelector(`.square[data-index='${from}']`);
        const toSquare = document.querySelector(`.square[data-index='${to}']`);
        const piece = fromSquare.querySelector('.piece');

        if (piece) {
            piece.style.transform = 'translateY(-100px)';
            setTimeout(() => {
                toSquare.appendChild(piece);
                piece.style.transform = 'translateY(0)';
                if (toSquare.querySelector('.piece') && toSquare.querySelector('.piece').innerText !== piece.innerText) {
                    toSquare.querySelector('.piece').remove();
                    // Update score based on captured piece
                    if (toSquare.querySelector('.piece').innerText.match(/[♖♘♗♕♔]/)) {
                        scores.white++;
                    } else if (toSquare.querySelector('.piece').innerText.match(/[♜♞♝♛♚]/)) {
                        scores.black++;
                    }
                    updateScore();
                }
            }, 200);
        }
    };

    const checkGameEnd = () => {
        if (!document.querySelector('.square .piece[data-piece="♚"]')) {
            gameOver = true;
            updateGameStatus();
        }
    };

    const getRandomMove = () => {
        const availableMoves = Array.from(document.querySelectorAll('.square')).filter(square => 
            square.classList.contains('highlight') || square.classList.contains('capture')
        );
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    };

    const makeAIMove = () => {
        const move = getRandomMove();
        if (move && selectedPiece) {
            const from = selectedPiece.parentElement.dataset.index;
            const to = move.dataset.index;
            updateMoveHistory(selectedPiece.innerText, from, to);
            movePiece(from, to);
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
            clearHighlights();
            updateMoveList();
            checkGameEnd();
            playerTurn = 'white'; // Switch turn back to player
            updateGameStatus();
        }
    };

    const showHints = () => {
        hintArea.innerText = 'Hints: Consider moving pieces that can control the center of the board or put the opponent in check!';
        hintArea.style.color = '#007bff';
        setTimeout(() => {
            hintArea.innerText = '';
        }, 5000);
    };

    const toggleBoardColor = () => {
        document.body.classList.toggle('dark-mode');
    };

    board.addEventListener('click', (e) => {
        const target = e.target;

        if (target.classList.contains('piece')) {
            if (selectedPiece) {
                selectedPiece.classList.remove('selected');
                clearHighlights();
            }
            selectedPiece = target;
            selectedPiece.classList.add('selected');
            highlightMoves(selectedPiece.innerText, selectedPiece.parentElement.dataset.index);
        } else if (target.classList.contains('square') && selectedPiece) {
            if (target.classList.contains('highlight') || target.classList.contains('capture')) {
                const from = selectedPiece.parentElement.dataset.index;
                const to = target.dataset.index;
                updateMoveHistory(selectedPiece.innerText, from, to);
                movePiece(from, to);
                clearHighlights();
                if (target.classList.contains('capture')) {
                    target.removeChild(target.querySelector('.piece'));
                }
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
                updateMoveList();
                checkGameEnd();
                playerTurn = 'black'; // Switch turn to AI
                updateGameStatus();
                setTimeout(makeAIMove, 500); // Make AI move after a short delay
            }
        }
    });

    document.getElementById('resetBoard').addEventListener('click', resetBoard);
    document.getElementById('undoMove').addEventListener('click', () => {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            console.log(`Undoing move: ${lastMove}`);
            updateMoveList();
            drawBoard();
        }
    });
    document.getElementById('saveGame').addEventListener('click', saveGame);
    document.getElementById('loadGame').addEventListener('click', loadGame);
    document.getElementById('aiMove').addEventListener('click', () => {
        if (!gameOver && playerTurn === 'white') {
            makeAIMove();
        }
    });
    document.getElementById('showHints').addEventListener('click', showHints);
    document.getElementById('toggleBoard').addEventListener('click', toggleBoardColor); // New Event Listener

    drawBoard();
});
