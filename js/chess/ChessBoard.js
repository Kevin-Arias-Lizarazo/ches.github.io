// Clase Principal ChessBoard - Integra todo con inversión de dependencias
// Soporta múltiples instancias en la misma página
class ChessBoard {
    constructor(containerId, config = {}) {
        // Validar que el contenedor existe y es único
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Contenedor con ID '${containerId}' no encontrado`);
        }

        this.containerId = containerId;
        this.config = new BoardConfig(config);
        
        // Crear componentes con inversión de dependencias
        this.model = new BoardModel();
        this.view = new BoardView(containerId, {
            showCoordinates: this.config.shouldShowCoordinates(),
            orientation: this.config.getOrientation()
        });
        this.controller = new BoardController();

        // Crear o usar servicios inyectados
        this.moveHandler = this.config.getMoveHandler() || new ChessEngine();
        this.boardProvider = this.config.getBoardProvider() || this.moveHandler;
        this.moveValidator = new MoveValidator(this.boardProvider);

        // Inyectar dependencias en el controlador
        this.controller.setModel(this.model);
        this.controller.setView(this.view);
        this.controller.setMoveHandler(this.moveHandler);
        this.controller.setMoveValidator(this.moveValidator);

        // Configurar estado inicial
        this.initializeBoard(this.config.getInitialPosition());

        // Conectar eventos del controlador con namespace único
        this.setupEventHandlers();

        // Registrar instancia globalmente para debugging y gestión
        ChessBoard.instances = ChessBoard.instances || new Map();
        ChessBoard.instances.set(containerId, this);

        // Renderizar inicial
        this.controller.render();
    }

    initializeBoard(initialPosition) {
        if (!initialPosition || initialPosition === 'start') {
            // Posición inicial estándar
            this.loadInitialPosition();
        } else if (typeof initialPosition === 'string') {
            // FEN string
            this.loadFEN(initialPosition);
        } else if (typeof initialPosition === 'object') {
            // Objeto BoardState personalizado
            this.loadCustomPosition(initialPosition);
        }
    }

    loadInitialPosition() {
        // Cargar posición inicial estándar desde el motor
        if (this.moveHandler && typeof this.moveHandler.loadFEN === 'function') {
            this.moveHandler.loadFEN('start');
        }
        
        // Sincronizar modelo con el motor
        this.syncModelFromEngine();
    }

    loadFEN(fen) {
        if (this.moveHandler && typeof this.moveHandler.loadFEN === 'function') {
            this.moveHandler.loadFEN(fen);
            this.syncModelFromEngine();
        } else {
            // Si no hay motor, cargar directamente en el modelo
            this.loadFENToModel(fen);
        }
        this.controller.render();
    }

    loadFENToModel(fen) {
        // Parsear FEN y cargar en el modelo
        const parts = fen.split(' ');
        const position = parts[0];
        const rows = position.split('/');
        
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        for (let row = 0; row < 8; row++) {
            let col = 0;
            for (const char of rows[row]) {
                if (char >= '1' && char <= '8') {
                    col += parseInt(char);
                } else {
                    const piece = Piece.fromFEN(char);
                    if (piece) {
                        const square = files[col] + ranks[row];
                        this.model.setPiece(square, piece);
                        col++;
                    }
                }
            }
        }

        if (parts.length > 1) {
            this.model.setCurrentPlayer(parts[1] === 'b' ? 'black' : 'white');
        }
    }

    loadCustomPosition(position) {
        // Cargar posición personalizada
        if (position.board) {
            const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const pieceData = position.board[row] && position.board[row][col];
                    if (pieceData) {
                        const square = files[col] + ranks[row];
                        const piece = new Piece(pieceData.type, pieceData.color, square);
                        this.model.setPiece(square, piece);
                    }
                }
            }
        }

        if (position.currentPlayer) {
            this.model.setCurrentPlayer(position.currentPlayer);
        }
    }

    syncModelFromEngine() {
        if (!this.moveHandler || !this.model) return;

        // Sincronizar modelo con el estado del motor
        const boardState = this.moveHandler.getBoardState();
        if (boardState && boardState.board) {
            const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const square = files[col] + ranks[row];
                    const pieceData = boardState.board[row] && boardState.board[row][col];
                    if (pieceData) {
                        const piece = new Piece(pieceData.type, pieceData.color, square);
                        this.model.setPiece(square, piece);
                    } else {
                        this.model.setPiece(square, null);
                    }
                }
            }

            this.model.setCurrentPlayer(boardState.currentPlayer || this.moveHandler.getCurrentPlayer());
        }
    }

    setupEventHandlers() {
        // Conectar eventos del controlador con namespace único
        const namespace = `board:${this.containerId}:`;

        // Square clicked
        this.controller.on('square-clicked', (square, eventData) => {
            this.emitEvent(`${namespace}square-clicked`, square, eventData);
            if (eventData.isEmpty) {
                this.emitEvent(`${namespace}empty-square-clicked`, square, eventData);
            }
        });

        // Empty square clicked
        this.controller.on('empty-square-clicked', (square, eventData) => {
            this.emitEvent(`${namespace}empty-square-clicked`, square, eventData);
        });

        // Move attempted
        this.controller.on('move-attempted', (move) => {
            this.emitEvent(`${namespace}move-attempted`, move);
        });

        // Move completed
        this.controller.on('move-completed', (move) => {
            this.syncModelFromEngine();
            this.emitEvent(`${namespace}move-completed`, move);
        });

        // Invalid move
        this.controller.on('invalid-move', (move, reason) => {
            this.emitEvent(`${namespace}invalid-move`, move, reason);
        });

        // Callbacks de configuración
        if (this.config.onMoveCompleted) {
            this.controller.on('move-completed', this.config.onMoveCompleted);
        }
        if (this.config.onSquareClicked) {
            this.controller.on('square-clicked', this.config.onSquareClicked);
        }
        if (this.config.onEmptySquareClicked) {
            this.controller.on('empty-square-clicked', this.config.onEmptySquareClicked);
        }
    }

    // Sistema de eventos público
    on(event, callback) {
        const namespace = `board:${this.containerId}:`;
        const fullEvent = event.startsWith('board:') ? event : `${namespace}${event}`;
        
        if (!this.eventListeners) {
            this.eventListeners = new Map();
        }
        if (!this.eventListeners.has(fullEvent)) {
            this.eventListeners.set(fullEvent, []);
        }
        this.eventListeners.get(fullEvent).push(callback);
    }

    off(event, callback) {
        const namespace = `board:${this.containerId}:`;
        const fullEvent = event.startsWith('board:') ? event : `${namespace}${event}`;
        
        if (!this.eventListeners || !this.eventListeners.has(fullEvent)) return;
        const callbacks = this.eventListeners.get(fullEvent);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emitEvent(event, ...args) {
        if (!this.eventListeners || !this.eventListeners.has(event)) return;
        const callbacks = this.eventListeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(...args);
            } catch (e) {
                console.error(`Error en callback de evento ${event}:`, e);
            }
        });
    }

    // Métodos públicos de conveniencia
    onMoveCompleted(callback) {
        this.on('move-completed', callback);
    }

    onMoveAttempted(callback) {
        this.on('move-attempted', callback);
    }

    onSquareClicked(callback) {
        this.on('square-clicked', callback);
    }

    onEmptySquareClicked(callback) {
        this.on('empty-square-clicked', callback);
    }

    // Mostrar sugerencias
    showSuggestions(move) {
        if (move && typeof move === 'string') {
            // Si es string UCI, convertir a Move
            move = NotationParser.parseUCI(move);
        }
        this.controller.showSuggestions(move);
        this.controller.render();
    }

    clearSuggestions() {
        this.controller.clearSuggestions();
        this.controller.render();
    }

    // Renderizar
    render() {
        this.controller.render();
    }

    // Obtener estado
    getState() {
        return this.model.getBoardState();
    }

    // Obtener pieza
    getPiece(square) {
        return this.model.getPiece(square);
    }

    // Obtener movimientos válidos
    getValidMoves(square) {
        if (this.moveValidator) {
            return this.moveValidator.getValidMovesFromSquare(square);
        }
        return [];
    }

    // Métodos estáticos para gestión de múltiples instancias
    static getInstance(containerId) {
        return this.instances?.get(containerId) || null;
    }

    static getAllInstances() {
        return Array.from(this.instances?.values() || []);
    }

    // Limpiar instancia
    destroy() {
        if (this.controller) {
            this.controller.destroy();
        }
        if (this.view) {
            this.view.destroy();
        }
        if (this.eventListeners) {
            this.eventListeners.clear();
        }
        ChessBoard.instances?.delete(this.containerId);
    }
}

