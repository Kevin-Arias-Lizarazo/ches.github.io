class IBoardConfig {
    constructor(config = {}) {
        this.initialPosition = config.initialPosition || 'start';
        this.orientation = config.orientation || 'white';
        this.allowMoves = config.allowMoves !== false;
        this.highlightValidMoves = config.highlightValidMoves !== false;
        this.showCoordinates = config.showCoordinates !== false;
        this.moveHandler = config.moveHandler || null;
        this.boardProvider = config.boardProvider || null;
        this.boardSize = config.boardSize || 8;
        this.squareColorStart = config.squareColorStart || 'dark';
        this.onUpdateRequired = config.onUpdateRequired || null;
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

    getBoardProvider() {
        return this.boardProvider;
    }

    getBoardSize() {
        return this.boardSize;
    }

    getSquareColorStart() {
        return this.squareColorStart;
    }

    getOnUpdateRequired() {
        return this.onUpdateRequired;
    }
}

// Clase concreta para configuración
class BoardConfig extends IBoardConfig {
    constructor(config = {}) {
        super(config);
    }
}

