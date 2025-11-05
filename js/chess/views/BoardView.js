// Vista del Tablero - Solo renderizado visual
class BoardView {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Contenedor con ID '${containerId}' no encontrado`);
        }

        this.options = {
            showCoordinates: options.showCoordinates !== false,
            orientation: options.orientation || 'white',
            ...options
        };

        this.squares = new Map(); // Map<square, SquareView>
        this.eventListeners = new Map(); // Map<event, Array<callbacks>>
        this.selectedSquare = null;
        this.lastMove = null;
        this.suggestedMove = null;

        this.init();
    }

    init() {
        this.createBoard();
        this.attachEventListeners();
    }

    createBoard() {
        this.container.innerHTML = '';
        this.container.setAttribute('role', 'application');
        this.container.setAttribute('aria-label', 'Tablero de ajedrez interactivo');
        this.container.className = 'chessboard-container';
        
        // Crear grid para el tablero
        const boardGrid = document.createElement('div');
        boardGrid.id = `${this.containerId}-grid`;
        boardGrid.className = 'chessboard-grid';
        boardGrid.style.display = 'grid';
        boardGrid.style.gridTemplateColumns = 'repeat(8, 1fr)';
        boardGrid.style.gridTemplateRows = 'repeat(8, 1fr)';
        boardGrid.style.width = '100%';
        boardGrid.style.aspectRatio = '1';
        boardGrid.style.border = '3px solid var(--primary-color)';
        boardGrid.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        
        this.container.appendChild(boardGrid);

        // Crear casillas
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const rank = ranks[row];
                const file = files[col];
                const square = file + rank;

                const squareView = new SquareView(square, boardGrid, this.options);
                this.squares.set(square, squareView);
            }
        }
    }

    render(boardState) {
        if (!boardState) {
            // Si no hay estado, renderizar tablero vacío
            boardState = {
                board: Array(8).fill(null).map(() => Array(8).fill(null)),
                currentPlayer: 'white'
            };
        }

        const squares = boardState.board || [];
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const rank = ranks[row];
                const file = files[col];
                const square = file + rank;

                const squareView = this.squares.get(square);
                if (!squareView) continue;

                // Obtener pieza
                const pieceData = squares[row] && squares[row][col];
                const piece = pieceData ? new Piece(pieceData.type, pieceData.color, square) : null;

                // Determinar estado de la casilla
                const state = {
                    selected: this.selectedSquare === square,
                    validMove: false, // Se establecerá desde fuera
                    lastMove: this.lastMove && 
                        (this.lastMove.from === square || this.lastMove.to === square),
                    inCheck: false, // Se establecerá desde fuera
                    suggestedFrom: this.suggestedMove && this.suggestedMove.from === square,
                    suggestedTo: this.suggestedMove && this.suggestedMove.to === square
                };

                squareView.render(piece, state);
            }
        }
    }

    highlightSquare(square, highlightType = 'selected') {
        const squareView = this.squares.get(square);
        if (squareView) {
            const state = { ...squareView.state };
            state[highlightType] = true;
            squareView.updateState(state);
            squareView.updateVisualState();
        }
    }

    highlightValidMoves(squares) {
        squares.forEach(square => {
            const squareView = this.squares.get(square);
            if (squareView) {
                squareView.updateState({ ...squareView.state, validMove: true });
                squareView.updateVisualState();
            }
        });
    }

    clearHighlights() {
        this.selectedSquare = null;
        this.suggestedMove = null;
        this.squares.forEach(squareView => {
            squareView.updateState({
                selected: false,
                validMove: false,
                suggestedFrom: false,
                suggestedTo: false
            });
            squareView.updateVisualState();
        });
    }

    showSuggestions(move) {
        this.suggestedMove = move;
        if (move && move.from && move.to) {
            const fromView = this.squares.get(move.from);
            const toView = this.squares.get(move.to);
            if (fromView) {
                fromView.updateState({ ...fromView.state, suggestedFrom: true });
                fromView.updateVisualState();
            }
            if (toView) {
                toView.updateState({ ...toView.state, suggestedTo: true });
                toView.updateVisualState();
            }
        }
    }

    setLastMove(move) {
        this.lastMove = move;
    }

    setSelectedSquare(square) {
        this.selectedSquare = square;
    }

    attachEventListeners() {
        this.squares.forEach((squareView, square) => {
            // Click en casilla
            squareView.addEventListener('click', (square, eventData) => {
                this.emit('square-clicked', square, eventData);
                
                if (eventData.isEmpty) {
                    this.emit('empty-square-clicked', square, eventData);
                }
            });

            // Click en pieza
            if (squareView.element) {
                const pieceElement = squareView.element.querySelector('.piece');
                if (pieceElement) {
                    pieceElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.emit('square-clicked', square, {
                            isEmpty: false,
                            piece: {
                                type: pieceElement.dataset.piece,
                                color: pieceElement.dataset.color
                            },
                            square: square,
                            event: e
                        });
                    });
                }
            }

            // Drag and drop
            if (squareView.element) {
                const pieceElement = squareView.element.querySelector('.piece');
                if (pieceElement) {
                    pieceElement.addEventListener('mousedown', (e) => {
                        this.emit('piece-drag-start', square, {
                            piece: {
                                type: pieceElement.dataset.piece,
                                color: pieceElement.dataset.color
                            },
                            square: square,
                            event: e
                        });
                    });
                }
            }
        });

        // Eventos globales de drag
        document.addEventListener('mousemove', (e) => {
            this.emit('piece-drag', null, { event: e });
        });

        document.addEventListener('mouseup', (e) => {
            this.emit('piece-drag-end', null, { event: e });
        });
    }

    // Sistema de eventos simple
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

    refresh() {
        // Forzar re-renderizado completo
        this.squares.forEach(squareView => {
            squareView.updateVisualState();
        });
    }

    destroy() {
        this.squares.forEach(squareView => {
            squareView.destroy();
        });
        this.squares.clear();
        this.eventListeners.clear();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

