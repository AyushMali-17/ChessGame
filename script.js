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
    let moveHistory = [];
    const moveHistoryElement = document.createElement('div');
    moveHistoryElement.id = 'moveHistory';
    document.body.appendChild(moveHistoryElement);

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

    const updateMoveHistory = (piece, from, to) => {
        moveHistory.push(`${piece} moved from ${from} to ${to}`);
        moveHistoryElement.innerText = moveHistory.join('\n');
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
        moveHistory = [];
        moveHistoryElement.innerText = '';
    });
    document.body.appendChild(resetButton);

    const canCastle = (king, rook) => {
        // Basic validation for castling: ensure the squares between king and rook are empty
        const kingPosition = parseInt(king.parentElement.dataset.index);
        const rookPosition = parseInt(rook.parentElement.dataset.index);

        if (Math.abs(kingPosition - rookPosition) !== 3 && Math.abs(kingPosition - rookPosition) !== 4) {
            return false;
        }

        const direction = kingPosition < rookPosition ? 1 : -1;
        for (let i = kingPosition + direction; i !== rookPosition; i += direction) {
            if (document.querySelector(`.square[data-index='${i}'] .piece`)) {
                return false;
            }
        }

        return true;
    };

    const highlightCastling = (king, position) => {
        const kingPos = parseInt(position);
        const rookLeft = document.querySelector(`.square[data-index='${kingPos - 4}'] .piece`);
        const rookRight = document.querySelector(`.square[data-index='${kingPos + 3}'] .piece`);

        if (rookLeft && rookLeft.innerText === '♖' && canCastle(king, rookLeft)) {
            possibleMoves.push(kingPos - 2);
        }
        if (rookRight && rookRight.innerText === '♖' && canCastle(king, rookRight)) {
            possibleMoves.push(kingPos + 2);
        }

        possibleMoves.forEach(index => {
            const square = document.querySelector(`.square[data-index='${index}']`);
            if (square) {
                square.classList.add('highlight');
            }
        });
    };

    const handleEnPassant = (pawn, from, to) => {
        const direction = pawn.innerText === '♙' ? -1 : 1;
        const target = document.querySelector(`.square[data-index='${parseInt(to) + 8 * direction}'] .piece`);
        if (target && target.innerText === (pawn.innerText === '♙' ? '♟' : '♙')) {
            target.parentElement.removeChild(target);
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
            if (selectedPiece.innerText === '♔') {
                highlightCastling(selectedPiece, selectedPiece.parentElement.dataset.index);
            } else {
                highlightMoves(selectedPiece.innerText, selectedPiece.parentElement.dataset.index);
            }
        } else if (target.classList.contains('square') && selectedPiece) {
            if (target.classList.contains('highlight') || target.classList.contains('capture')) {
                const from = selectedPiece.parentElement.dataset.index;
                const to = target.dataset.index;
                updateMoveHistory(selectedPiece.innerText, from, to);
                clearHighlights();
                if (target.classList.contains('capture')) {
                    target.removeChild(target.querySelector('.piece'));
                }
                if (selectedPiece.innerText === '♙' && Math.abs(from - to) === 16) {
                    handleEnPassant(selectedPiece, from, to);
                }
                target.appendChild(selectedPiece);
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
            }
        }
    });
});
