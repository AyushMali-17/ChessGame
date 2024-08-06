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
            }
        });
        possibleMoves = [];
    };

    const highlightMoves = (piece, position) => {
        if (piece === '♙') {
            const move = parseInt(position) + 8;
            if (move <= 64) possibleMoves.push(move);
        } else if (piece === '♟') {
            const move = parseInt(position) - 8;
            if (move >= 1) possibleMoves.push(move);
        }

        possibleMoves.forEach(index => {
            const square = document.querySelector(`.square[data-index='${index}']`);
            if (square) {
                square.classList.add('highlight');
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
            clearHighlights();
            target.appendChild(selectedPiece);
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
        }
    });

    // Additional functionality for enhanced interactivity
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
});
