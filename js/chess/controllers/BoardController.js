// Controlador del Tablero - Coordina Modelo y Vista
class BoardController {
    constructor() {
        this.model = null;
        this.view = null;
        this.moveHandler = null;
        this.moveValidator = null;
        this.eventListeners = new Map();
        this.selectedSquare = null;
        this.validMoves = [];
    }

    setModel(model) {
        this.model = model;
    }

    setView(view) {
        this.view = view;
        if (view) {
            this.setupViewListeners();
        }
    }

    setMoveHandler(moveHandler) {
        this.moveHandler = moveHandler;
        if (moveHandler && typeof moveHandler.onMoveCompleted === 'function') {
            moveHandler.onMoveCompleted((move) => {
                this.handleMoveCompleted(move);
            });
        }
    }

    setMoveValidator(validator) {
        this.moveValidator = validator;
    }

    setupViewListeners() {
        if (!this.view) return;

        // Click en casilla
        this.view.on('square-clicked', (square, eventData) => {
            this.handleSquareClick(square, eventData);
        });

        // Click en casilla vacía
        this.view.on('empty-square-clicked', (square, eventData) => {
            this.handleEmptySquareClick(square, eventData);
        });

        // Drag de pieza
        this.view.on('piece-drag-start', (square, eventData) => {
            this.handlePieceDragStart(square, eventData);
        });

        this.view.on('piece-drag-end', (square, eventData) => {
            this.handlePieceDragEnd(square, eventData);
        });
    }

    handleSquareClick(square, eventData) {
        if (!this.model || !this.view) return;

        const piece = this.model.getPiece(square);
        const isEmpty = !piece;

        // Emitir evento de click en casilla
        this.emit('square-clicked', square, {
            isEmpty: isEmpty,
            piece: piece,
            square: square,
            eventData: eventData
        });

        // Si hay una casilla seleccionada, intentar mover
        if (this.selectedSquare && this.selectedSquare !== square) {
            this.attemptMove(this.selectedSquare, square);
        } else if (piece && piece.color === this.model.getCurrentPlayer()) {
            // Seleccionar casilla con pieza del jugador actual
            this.selectSquare(square);
        } else {
            // Deseleccionar
            this.selectSquare(null);
        }
    }

    handleEmptySquareClick(square, eventData) {
        this.emit('empty-square-clicked', square, {
            square: square,
            eventData: eventData
        });
    }

    handlePieceDragStart(square, eventData) {
        const piece = this.model.getPiece(square);
        if (piece && piece.color === this.model.getCurrentPlayer()) {
            this.selectSquare(square);
        }
    }

    handlePieceDragEnd(square, eventData) {
        if (this.selectedSquare && square && this.selectedSquare !== square) {
            this.attemptMove(this.selectedSquare, square);
        }
    }

    selectSquare(square) {
        this.selectedSquare = square;
        this.view.setSelectedSquare(square);

        if (square) {
            // Obtener movimientos válidos
            if (this.moveValidator) {
                this.validMoves = this.moveValidator.getValidMovesFromSquare(square);
            } else if (this.moveHandler && this.moveHandler.getPossibleMovesFromSquare) {
                this.validMoves = this.moveHandler.getPossibleMovesFromSquare(square);
            }

            // Resaltar movimientos válidos
            if (this.view.options.highlightValidMoves) {
                this.view.highlightValidMoves(this.validMoves);
            }
        } else {
            this.validMoves = [];
            this.view.clearHighlights();
        }

        this.render();
    }

    attemptMove(from, to) {
        if (!this.model || !this.moveHandler) return false;

        const move = new Move(from, to);
        const piece = this.model.getPiece(from);
        
        if (piece) {
            move.piece = piece;
        }

        // Validar movimiento
        if (this.moveValidator) {
            const validation = this.moveValidator.validateMove(move);
            if (!validation.valid) {
                this.emit('invalid-move', move, validation.reason);
                this.selectSquare(null);
                return false;
            }
        }

        // Emitir evento de intento de movimiento
        this.emit('move-attempted', move);

        // Intentar ejecutar movimiento
        const success = this.moveHandler.handleMove(move);
        
        if (success) {
            this.selectSquare(null);
            this.view.setLastMove(move);
            this.render();
        } else {
            this.emit('invalid-move', move, 'Movimiento ilegal');
            this.selectSquare(null);
        }

        return success;
    }

    handleMoveCompleted(move) {
        if (!this.model || !this.view) return;

        // Actualizar modelo si es necesario
        // El movimiento ya fue ejecutado por el moveHandler
        
        this.view.setLastMove(move);
        this.render();
        
        // Emitir evento de movimiento completado
        this.emit('move-completed', move);
    }

    render() {
        if (!this.model || !this.view) return;

        const boardState = this.model.getBoardState();
        
        // Convertir formato del modelo a formato esperado por la vista
        const viewState = {
            board: this.convertBoardToViewFormat(boardState.board),
            currentPlayer: boardState.currentPlayer,
            moveHistory: boardState.moveHistory
        };

        this.view.render(viewState);
    }

    convertBoardToViewFormat(board) {
        // El modelo usa array 8x8, la vista también
        // Pero necesitamos asegurar que las piezas sean objetos Piece
        return board.map(row => row.map(pieceData => {
            if (!pieceData) return null;
            return {
                type: pieceData.type,
                color: pieceData.color
            };
        }));
    }

    showSuggestions(move) {
        if (this.view) {
            this.view.showSuggestions(move);
        }
    }

    clearSuggestions() {
        if (this.view) {
            this.view.clearHighlights();
        }
    }

    // Sistema de eventos
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        const callbacks = this.eventListeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, ...args) {
        if (!this.eventListeners.has(event)) return;
        const callbacks = this.eventListeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(...args);
            } catch (e) {
                console.error(`Error en callback de evento ${event}:`, e);
            }
        });
    }

    destroy() {
        this.model = null;
        this.view = null;
        this.moveHandler = null;
        this.moveValidator = null;
        this.eventListeners.clear();
        this.selectedSquare = null;
        this.validMoves = [];
    }
}

