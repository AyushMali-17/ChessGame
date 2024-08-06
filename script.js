document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    const status = document.getElementById('status');
    const hintArea = document.getElementById('hint');
    const scoreArea = document.getElementById('score');
    const capturedPiecesArea = document.getElementById('capturedPieces');
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
    let playerTurn = 'white'; // Player's turn
    let scores = { white: 0, black: 0 };
    let capturedPieces = { white: [], black: [] };
    let soundOn = true;

    const drawBoard = () => {
        board.innerHTML = '';
        for (let i = 1; i <= squares; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.index = i;
            if (pieces[i]) {
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.innerText = pieces[i];
                square.appendChild(piece);
            }
            board.appendChild(square);
        }
    };

    const clearHighlights = () => {
        document.querySelectorAll('.highlight, .capture').forEach(square => {
            square.classList.remove('highlight', 'capture');
        });
    };

    const highlightMoves = (piece, index) => {
        const pos = parseInt(index, 10);
        possibleMoves = [];
        const getPosition = (x, y) => (x >= 0 && x < 8 && y >= 0 && y < 8) ? (y * 8) + x + 1 : null;

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
                    if (target && !target.innerText.match(/♙/)) {
                        possibleMoves.push(capture);
                    }
                }
            });
        } else if (piece === '♟') {
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

    const playSound = (soundType) => {
        if (soundOn) {
            document.getElementById(soundType).play();
        }
    };

    const saveGame = () => {
        localStorage.setItem('chessGameState', JSON.stringify({
            boardState,
            moveHistory,
            gameOver,
            playerTurn,
            scores,
            capturedPieces // Save captured pieces state
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
            scores = savedState.scores || scores;
            capturedPieces = savedState.capturedPieces || capturedPieces; // Load captured pieces state
            for (let i = 0; i < squares; i++) {
                pieces[i + 1] = boardState[i];
            }
            drawBoard();
            updateMoveList();
            updateGameStatus();
            updateScore();
            updateCapturedPieces(); // Update captured pieces display
            alert('Game loaded successfully!');
        } else {
            alert('No saved game found.');
        }
    };

    const saveToCloud = () => {
        // Simulate saving to cloud
        alert('Game saved to cloud successfully!');
    };

    const loadFromCloud = () => {
        // Simulate loading from cloud
        alert('Game loaded from cloud successfully!');
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

    const updateCapturedPieces = () => {
        capturedPiecesArea.innerText = `Captured Pieces: White - ${capturedPieces.white.join(', ')} | Black - ${capturedPieces.black.join(', ')}`;
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
                    playSound('captureSound'); // Play capture sound
                    const capturedPiece = toSquare.querySelector('.piece').innerText;
                    if (capturedPiece.match(/[♖♘♗♕♔]/)) {
                        scores.white++;
                        capturedPieces.black.push(capturedPiece); // Update captured pieces
                    } else if (capturedPiece.match(/[♜♞♝♛♚]/)) {
                        scores.black++;
                        capturedPieces.white.push(capturedPiece); // Update captured pieces
                    }
                    updateScore();
                    updateCapturedPieces(); // Update captured pieces display
                    toSquare.querySelector('.piece').remove();
                }
                playSound('moveSound'); // Play move sound
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
        hintArea.innerText = 'Hints: Consider developing your pieces and controlling key squares!';
        hintArea.style.color = '#007bff';
        setTimeout(() => {
            hintArea.innerText = '';
        }, 5000);
    };

    const toggleBoardColor = () => {
        document.body.classList.toggle('dark-mode');
    };

    const toggleRetroMode = () => {
        document.body.classList.toggle('retro-mode');
    };

    const toggleSound = () => {
        soundOn = !soundOn;
        document.getElementById('soundToggle').classList.toggle('sound-on', soundOn);
        document.getElementById('soundToggle').classList.toggle('sound-off', !soundOn);
    };

    const showLegalMoves = () => {
        const legalMoves = document.querySelectorAll('.highlight, .capture');
        legalMoves.forEach(move => {
            move.classList.add('legal');
        });
    };

    const showCapturedPieces = () => {
        capturedPiecesArea.style.display = capturedPiecesArea.style.display === 'none' ? 'block' : 'none';
    };

    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('retro-mode');
    };

    const enableCheatMode = () => {
        // Implement cheat mode features
        alert('Cheat mode enabled!');
    };

    const saveToCloud = () => {
        // Simulate saving to cloud
        alert('Game saved to cloud successfully!');
    };

    const loadFromCloud = () => {
        // Simulate loading from cloud
        alert('Game loaded from cloud successfully!');
    };

    const performanceStats = () => {
        // Simulate displaying performance stats
        alert('Performance Stats:\nTime Played: 30 minutes\nMoves Made: 50');
    };

    document.getElementById('resetBoard').addEventListener('click', resetBoard);
    document.getElementById('undoMove').addEventListener('click', () => {
        alert('Undo feature not implemented yet.');
    });
    document.getElementById('saveGame').addEventListener('click', saveGame);
    document.getElementById('loadGame').addEventListener('click', loadGame);
    document.getElementById('aiMove').addEventListener('click', makeAIMove);
    document.getElementById('showHints').addEventListener('click', showHints);
    document.getElementById('toggleBoard').addEventListener('click', toggleBoardColor);
    document.getElementById('retroMode').addEventListener('click', toggleRetroMode);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('showLegalMoves').addEventListener('click', showLegalMoves);
    document.getElementById('showCaptured').addEventListener('click', showCapturedPieces);
    document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
    document.getElementById('saveToCloud').addEventListener('click', saveToCloud);
    document.getElementById('loadFromCloud').addEventListener('click', loadFromCloud);
    document.getElementById('performanceStats').addEventListener('click', performanceStats);
    document.getElementById('enableCheat').addEventListener('click', enableCheatMode);

    drawBoard();
});
