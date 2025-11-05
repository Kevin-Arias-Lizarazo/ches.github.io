// Interfaz para manejador de movimientos
/**
 * Interfaz IMoveHandler
 * Define el contrato para manejadores de movimientos
 */
class IMoveHandler {
    /**
     * Manejar un movimiento
     * @param {Move} move - Movimiento a ejecutar
     * @returns {boolean} - true si se ejecutó correctamente
     */
    handleMove(move) {
        throw new Error('Método handleMove debe ser implementado');
    }

    /**
     * Registrar callback para cuando se completa un movimiento
     * @param {Function} callback - Función a llamar
     */
    onMoveCompleted(callback) {
        throw new Error('Método onMoveCompleted debe ser implementado');
    }

    /**
     * Registrar callback para cuando se intenta un movimiento
     * @param {Function} callback - Función a llamar
     */
    onMoveAttempted(callback) {
        throw new Error('Método onMoveAttempted debe ser implementado');
    }
}

