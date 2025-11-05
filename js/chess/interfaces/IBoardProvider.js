// Interfaz para proveedor de estado del tablero
// En JavaScript, las interfaces se implementan como clases abstractas o documentación

/**
 * Interfaz IBoardProvider
 * Define el contrato para proveedores de estado del tablero
 */
class IBoardProvider {
    /**
     * Obtener pieza en una casilla
     * @param {string} square - Notación algebraica (ej: 'e4')
     * @returns {Piece|null} - Pieza o null si está vacía
     */
    getPiece(square) {
        throw new Error('Método getPiece debe ser implementado');
    }

    /**
     * Obtener estado completo del tablero
     * @returns {Object} - Estado del tablero
     */
    getBoardState() {
        throw new Error('Método getBoardState debe ser implementado');
    }

    /**
     * Obtener jugador actual
     * @returns {string} - 'white' o 'black'
     */
    getCurrentPlayer() {
        throw new Error('Método getCurrentPlayer debe ser implementado');
    }

    /**
     * Validar si un movimiento es legal
     * @param {Move} move - Movimiento a validar
     * @returns {boolean} - true si es válido
     */
    isValidMove(move) {
        throw new Error('Método isValidMove debe ser implementado');
    }
}

