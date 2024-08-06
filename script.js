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
        if (pieces[i]) {
            const piece = document.createElement('div');
            piece.className = 'piece';
            piece.innerText = pieces[i];
            square.appendChild(piece);
        }
        board.appendChild(square);
    }
});
