document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    const status = document.createElement('div');
    status.id = 'status';
    document.body.appendChild(status);

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
        const isWhite = piece === '♙';

        if (piece === '♙' || piece === '♟') {
            const move = isWhite ? pos + 8 : pos - 8;
            const captureLeft = isWhite ? pos + 7 : pos - 9;
            const captureRight = isWhite ? pos + 9 : pos - 7;

            if (move >= 1 && move <= 64 && !document.querySelector(`.square[data-index='${move}'] .piece`)) {
                possibleMoves.push(move);
            }
            if (captureLeft >= 1 && captureLeft <= 64) {
                const target = document.querySelector(`.square[data-index='${captureLeft}'] .piece`);
                if (target && (isWhite ? target.innerText.match(/[♜♞♝♛♚♟]/) : target.innerText.match(/[♖♘♗♕♔♙]/))) {
                    possibleMoves.push(captureLeft);
                }
            }
            if (captureRight >= 1 && captureRight <= 64) {
                const target = document.querySelector(`.square[data-index='${captureRight}'] .piece`);
                if (target && (isWhite ? target.innerText.match(/[♜♞♝♛♚♟]/) : target.innerText.match(/[♖♘♗♕♔♙]/))) {
                    possibleMoves.push(captureRight);
                }
            }
        }

        possibleMoves.forEach(index => {
            const square = document.querySelector(`.square[data-index='${index}']`);
            if (square) {
                square.classList.add(square.querySelector('.piece') ? 'capture' : 'highlight');
            }
        });
    };

    const saveGame = () => {
        localStorage.setItem('chessBoardState', JSON.stringify(boardState));
        localStorage.setItem('moveHistory', JSON.stringify(moveHistory));
        alert('Game saved successfully!');
    };

    const loadGame = () => {
        const savedState = JSON.parse(localStorage.getItem('chessBoardState'));
        const savedMoves = JSON.parse(localStorage.getItem('moveHistory'));

        if (savedState) {
            for (let i = 0; i < squares; i++) {
                pieces[i + 1] = savedState[i];
            }
            moveHistory = savedMoves || [];
            drawBoard();
            updateMoveList();
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
        } else {
            status.innerText = 'Game in Progress';
        }
    };

    const resetBoard = () => {
        drawBoard();
        moveHistory = [];
        updateMoveList();
        gameOver = false;
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
            }, 200);
        }
    };

    const checkGameEnd = () => {
        // Simple check for game end (for demonstration purposes)
        if (boardState.filter(p => p === '♚').length === 0) {
            gameOver = true;
            updateGameStatus();
        }
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

    drawBoard();
});
