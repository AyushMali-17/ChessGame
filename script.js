document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const scoreArea = document.getElementById('scoreArea');
    const capturedPiecesArea = document.getElementById('capturedPiecesArea');
    const moveList = document.getElementById('moveList');
    
    const pieces = {};
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
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.innerText = pieces[i];
                square.appendChild(piece);
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
                    if (target && target.innerText.match(/♙/)) {
                        possibleMoves.push(capture);
                    }
                }
            });
        }

        possibleMoves.forEach(move => {
            document.querySelector(`.square[data-index='${move}']`).classList.add('highlight');
        });
    };

    const handleSquareClick = (index) => {
        const piece = pieces[index];
        if (selectedPiece) {
            movePiece(selectedPiece, index);
            clearHighlights();
            selectedPiece = null;
        } else if (piece) {
            selectedPiece = index;
            highlightMoves(piece, index);
        }
    };

    const movePiece = (from, to) => {
        const piece = pieces[from];
        pieces[to] = piece;
        pieces[from] = null;
        boardState[to - 1] = piece;
        boardState[from - 1] = null;
        drawBoard();
        playSound('moveSound');
        updateMoveHistory(piece, from, to);
    };

    const updateMoveHistory = (piece, from, to) => {
        const move = `${piece} from ${from} to ${to}`;
        moveHistory.push(move);
        updateMoveList();
    };

    const updateMoveList = () => {
        moveList.innerHTML = '';
        moveHistory.forEach(move => {
            const listItem = document.createElement('li');
            listItem.innerText = move;
            moveList.appendChild(listItem);
        });
    };

    const updateGameStatus = () => {
        status.innerText = gameOver ? 'Game Over' : `Turn: ${playerTurn}`;
    };

    const updateScore = () => {
        scoreArea.innerHTML = `White: ${scores.white} | Black: ${scores.black}`;
    };

    const updateCapturedPieces = () => {
        capturedPiecesArea.innerHTML = `
            Captured Pieces:
            <div>White: ${capturedPieces.white.join(', ')}</div>
            <div>Black: ${capturedPieces.black.join(', ')}</div>
        `;
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
        alert('Legal moves feature is under development.');
    };

    const showCapturedPieces = () => {
        capturedPiecesArea.style.display = capturedPiecesArea.style.display === 'none' ? 'block' : 'none';
    };

    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('retro-mode');
    };

    const enableCheatMode = () => {
        alert('Cheat mode enabled!');
    };

    const performanceStats = () => {
        alert('Performance Stats:\nTime Played: 30 minutes\nMoves Made: 50');
    };

    const drawBoard = () => {
        board.innerHTML = '';
        for (let i = 1; i <= 64; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.index = i;
            if (pieces[i]) {
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.innerText = pieces[i];
                square.appendChild(piece);
            }
            square.addEventListener('click', () => handleSquareClick(i));
            board.appendChild(square);
        }
    };

    const handleSquareClick = (index) => {
        const piece = pieces[index];
        if (selectedPiece) {
            movePiece(selectedPiece, index);
            clearHighlights();
            selectedPiece = null;
        } else if (piece) {
            selectedPiece = index;
            highlightMoves(piece, index);
        }
    };

    const movePiece = (from, to) => {
        const piece = pieces[from];
        pieces[to] = piece;
        pieces[from] = null;
        boardState[to - 1] = piece;
        boardState[from - 1] = null;
        drawBoard();
        playSound('moveSound');
        updateMoveHistory(piece, from, to);
    };

    const updateMoveHistory = (piece, from, to) => {
        const move = `${piece} from ${from} to ${to}`;
        moveHistory.push(move);
        updateMoveList();
    };

    document.getElementById('resetBoard').addEventListener('click', () => {
        pieces = {};  // Reset pieces
        boardState = Array(64).fill(null);
        drawBoard();
        updateMoveList();
        updateGameStatus();
    });

    document.getElementById('undoMove').addEventListener('click', () => {
        alert('Undo feature not implemented yet.');
    });

    document.getElementById('saveGame').addEventListener('click', saveGame);
    document.getElementById('loadGame').addEventListener('click', loadGame);
    document.getElementById('aiMove').addEventListener('click', () => {
        alert('AI Move feature not implemented yet.');
    });

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
    document.getElementById('moveToStart').addEventListener('click', () => {
        alert('Move to start feature not implemented yet.');
    });
    document.getElementById('moveToEnd').addEventListener('click', () => {
        alert('Move to end feature not implemented yet.');
    });
    document.getElementById('showLeaderboard').addEventListener('click', () => {
        alert('Leaderboard feature under development.');
    });
    document.getElementById('recordGame').addEventListener('click', () => {
        alert('Game recording feature under development.');
    });
    document.getElementById('loadFromSaveState').addEventListener('click', () => {
        alert('Load from save state feature under development.');
    });
    document.getElementById('highlightPossibleMoves').addEventListener('click', () => {
        alert('Highlight possible moves feature under development.');
    });
    document.getElementById('themeSwitcher').addEventListener('click', () => {
        alert('Theme switcher feature under development.');
    });

    drawBoard();
});
