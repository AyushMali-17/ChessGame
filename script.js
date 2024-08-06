document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    const squares = 64;
    const pieces = {
        '1': '♖', '2': '♘', '3': '♗', '4': '♕', '5': '♔', '6': '♗', '7': '♘', '8': '♖',
        '9': '♙', '10': '♙', '11': '♙', '12': '♙', '13': '♙', '14': '♙', '15': '♙', '16': '♙',
        '49': '♟', '50': '♟', '51': '♟', '52': '♟', '53': '♟', '54': '♟', '55': '♟', '56': '♟',
        '57': '♜', '58': '♞', '59': '♝', '60': '♛', '61': '♚', '62': '♝', '63': '♞', '64': '♜'
    };

    for (let i = 1; i <= squares; i++) {
        const square = document.createElement('div');
        square.className = 'square';
        square.dataset.index = i;

        if (pieces[i]) {
            const piece = document.createElement('div');
            piece.className = 'piece';
            piece.innerText = pieces[i];
            square.appendChild(piece);
        }

        board.appendChild(square);
    }

    let selectedPiece = null;
    let possibleMoves = [];

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
                clearHighlights();
                if (target.classList.contains('capture')) {
                    target.removeChild(target.querySelector('.piece'));
                }
                target.appendChild(selectedPiece);
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
            }
        }
    });

    const resetButton = document.createElement('button');
    resetButton.innerText = 'Reset Board';
    resetButton.addEventListener('click', () => {
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
            }

            board.appendChild(square);
        }
    });
    document.body.appendChild(resetButton);

    // Additional functionalities and improvements
    const moveHistory = [];
    const updateMoveHistory = (piece, from, to) => {
        moveHistory.push(`${piece} moved from ${from} to ${to}`);
        console.log(moveHistory);
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
                clearHighlights();
                if (target.classList.contains('capture')) {
                    target.removeChild(target.querySelector('.piece'));
                }
                target.appendChild(selectedPiece);
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
            }
        }
    });

    const undoButton = document.createElement('button');
    undoButton.innerText = 'Undo Move';
    undoButton.addEventListener('click', () => {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            console.log(`Undoing move: ${lastMove}`);
            // Logic to undo the last move
        }
    });
    document.body.appendChild(undoButton);

    const moveList = document.createElement('ul');
    document.body.appendChild(moveList);
    const updateMoveList = () => {
        moveList.innerHTML = '';
        moveHistory.forEach(move => {
            const listItem = document.createElement('li');
            listItem.innerText = move;
            moveList.appendChild(listItem);
        });
    };

    // Additional event listener to update move list in real-time
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
                clearHighlights();
                if (target.classList.contains('capture')) {
                    target.removeChild(target.querySelector('.piece'));
                }
                target.appendChild(selectedPiece);
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
                updateMoveList();
            }
        }
    });
});
