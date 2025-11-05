// Validador de Movimientos - Separado del motor principal
class MoveValidator {
    constructor(boardProvider) {
        this.boardProvider = boardProvider;
    }

    /**
     * Validar si un movimiento es legal
     * @param {Move} move - Movimiento a validar
     * @returns {Object} - { valid: boolean, reason: string }
     */
    validateMove(move) {
        if (!move || !move.from || !move.to) {
            return { valid: false, reason: 'Movimiento inválido: falta origen o destino' };
        }

        if (!move.isValid()) {
            return { valid: false, reason: 'Formato de casillas inválido' };
        }

        const piece = this.boardProvider.getPiece(move.from);
        if (!piece) {
            return { valid: false, reason: 'No hay pieza en la casilla de origen' };
        }

        if (piece.color !== this.boardProvider.getCurrentPlayer()) {
            return { valid: false, reason: 'No es el turno de esta pieza' };
        }

        const targetPiece = this.boardProvider.getPiece(move.to);
        if (targetPiece && targetPiece.color === piece.color) {
            return { valid: false, reason: 'No puedes capturar tu propia pieza' };
        }

        // Verificar que el movimiento es legal según las reglas del ajedrez
        if (!this.boardProvider.isValidMove(move)) {
            return { valid: false, reason: 'Movimiento ilegal según las reglas del ajedrez' };
        }

        return { valid: true, reason: '' };
    }

    /**
     * Validar si un movimiento dejaría al rey en jaque
     * @param {Move} move - Movimiento a validar
     * @returns {boolean}
     */
    wouldLeaveKingInCheck(move) {
        // Esta validación se hace en el ChessEngine
        // Este método puede ser usado para validaciones adicionales
        return false;
    }

    /**
     * Obtener movimientos válidos desde una casilla
     * @param {string} square - Casilla de origen
     * @returns {string[]} - Array de casillas destino válidas
     */
    getValidMovesFromSquare(square) {
        const piece = this.boardProvider.getPiece(square);
        if (!piece || piece.color !== this.boardProvider.getCurrentPlayer()) {
            return [];
        }

        // Delegar al boardProvider para obtener movimientos posibles
        if (this.boardProvider.getPossibleMovesFromSquare) {
            return this.boardProvider.getPossibleMovesFromSquare(square);
        }

        // Fallback: usar ChessEngine directamente si está disponible
        if (this.boardProvider.getPossibleMovesCoords) {
            const coords = this.squareToCoords(square);
            if (coords) {
                const [row, col] = coords;
                const moves = this.boardProvider.getPossibleMovesCoords(row, col);
                return moves.map(([r, c]) => this.coordsToSquare(r, c));
            }
        }

        return [];
    }

    squareToCoords(square) {
        if (!square || square.length !== 2) return null;
        const file = square.charCodeAt(0) - 97;
        const rank = 8 - parseInt(square[1]);
        if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
        return [rank, file];
    }

    coordsToSquare(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return file + rank;
    }
}

