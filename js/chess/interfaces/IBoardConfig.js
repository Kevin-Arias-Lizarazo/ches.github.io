// Interfaz para configuración inicial del tablero
/**
 * Interfaz IBoardConfig
 * Define el contrato para configuración del tablero
 */
class IBoardConfig {
    /**
     * Constructor - debe aceptar un objeto de configuración
     * @param {Object} config - Configuración inicial
     */
    constructor(config = {}) {
        this.initialPosition = config.initialPosition || 'start'; // 'start', FEN string, o objeto BoardState
        this.orientation = config.orientation || 'white'; // 'white' o 'black'
        this.allowMoves = config.allowMoves !== false; // true por defecto
        this.highlightValidMoves = config.highlightValidMoves !== false; // true por defecto
        this.showCoordinates = config.showCoordinates !== false; // true por defecto
        this.moveHandler = config.moveHandler || null; // Instancia de IMoveHandler
        this.boardProvider = config.boardProvider || null; // Instancia de IBoardProvider
    }

    /**
     * Obtener posición inicial
     * @returns {string|Object} - FEN string o estado del tablero
     */
    getInitialPosition() {
        return this.initialPosition;
    }

    /**
     * Obtener orientación
     * @returns {string} - 'white' o 'black'
     */
    getOrientation() {
        return this.orientation;
    }

    /**
     * Verificar si se permiten movimientos
     * @returns {boolean}
     */
    isMoveAllowed() {
        return this.allowMoves;
    }

    /**
     * Verificar si se deben resaltar movimientos válidos
     * @returns {boolean}
     */
    shouldHighlightValidMoves() {
        return this.highlightValidMoves;
    }

    /**
     * Verificar si se deben mostrar coordenadas
     * @returns {boolean}
     */
    shouldShowCoordinates() {
        return this.showCoordinates;
    }

    /**
     * Obtener manejador de movimientos
     * @returns {IMoveHandler|null}
     */
    getMoveHandler() {
        return this.moveHandler;
    }

    /**
     * Obtener proveedor de estado del tablero
     * @returns {IBoardProvider|null}
     */
    getBoardProvider() {
        return this.boardProvider;
    }
}

// Clase concreta para configuración
class BoardConfig extends IBoardConfig {
    constructor(config = {}) {
        super(config);
    }
}

