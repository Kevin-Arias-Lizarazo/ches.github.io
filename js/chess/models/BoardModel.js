// Modelo del Tablero - Mantiene el estado del tablero
class BoardModel {
    constructor() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.observers = [];
        this.currentPlayer = 'white';
        this.moveHistory = [];
    }

    // Obtener pieza en una casilla (notación algebraica: 'e4')
    getPiece(square) {
        const coords = this.squareToCoords(square);
        if (!coords) return null;
        const [row, col] = coords;
        const piece = this.board[row][col];
        if (!piece) return null;
        return new Piece(piece.type, piece.color, square);
    }

    // Obtener pieza por coordenadas [row, col]
    getPieceAtCoords(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        const piece = this.board[row][col];
        if (!piece) return null;
        const square = this.coordsToSquare(row, col);
        return new Piece(piece.type, piece.color, square);
    }

    // Establecer pieza en una casilla
    setPiece(square, piece) {
        const coords = this.squareToCoords(square);
        if (!coords) return false;
        const [row, col] = coords;
        
        if (piece) {
            this.board[row][col] = {
                type: piece.type,
                color: piece.color
            };
        } else {
            this.board[row][col] = null;
        }
        
        this.notifyObservers();
        return true;
    }

    // Limpiar el tablero
    clear() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.moveHistory = [];
        this.notifyObservers();
    }

    // Clonar el tablero
    clone() {
        const cloned = new BoardModel();
        cloned.board = this.board.map(row => row.map(piece => piece ? { ...piece } : null));
        cloned.currentPlayer = this.currentPlayer;
        cloned.moveHistory = this.moveHistory.map(move => move.clone());
        return cloned;
    }

    // Obtener estado completo del tablero
    getBoardState() {
        return {
            board: this.board.map(row => row.map(piece => piece ? { ...piece } : null)),
            currentPlayer: this.currentPlayer,
            moveHistory: this.moveHistory.map(move => move.clone())
        };
    }

    // Convertir notación algebraica a coordenadas [row, col]
    squareToCoords(square) {
        if (!square || square.length !== 2) return null;
        const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
        const rank = 8 - parseInt(square[1]); // 1=7, 2=6, etc.
        if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
        return [rank, file];
    }

    // Convertir coordenadas [row, col] a notación algebraica
    coordsToSquare(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return file + rank;
    }

    // Verificar si una casilla está vacía
    isEmpty(square) {
        return this.getPiece(square) === null;
    }

    // Registrar observador para cambios
    addObserver(observer) {
        this.observers.push(observer);
    }

    // Remover observador
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    // Notificar a observadores
    notifyObservers() {
        this.observers.forEach(observer => {
            if (typeof observer === 'function') {
                observer(this.getBoardState());
            } else if (observer && typeof observer.update === 'function') {
                observer.update(this.getBoardState());
            }
        });
    }

    // Establecer jugador actual
    setCurrentPlayer(player) {
        this.currentPlayer = player;
        this.notifyObservers();
    }

    // Obtener jugador actual
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    // Añadir movimiento al historial
    addMove(move) {
        this.moveHistory.push(move);
        this.notifyObservers();
    }

    // Obtener último movimiento
    getLastMove() {
        return this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
    }
}

