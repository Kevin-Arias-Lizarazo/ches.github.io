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
            boardSize: options.boardSize || 8,
            squareColorStart: options.squareColorStart || 'dark',
            ...options
        };

        this.squares = new Map();
        this.eventListeners = new Map();
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

        const boardGrid = document.createElement('div');
        boardGrid.id = `${this.containerId}-grid`;
        boardGrid.className = 'chessboard-grid';
        boardGrid.style.display = 'grid';
        boardGrid.style.gridTemplateColumns = `repeat(${this.options.boardSize}, 1fr)`;
        boardGrid.style.gridTemplateRows = `repeat(${this.options.boardSize}, 1fr)`;
        boardGrid.style.width = '100%';
        boardGrid.style.aspectRatio = '1';
        boardGrid.style.border = '3px solid var(--primary-color)';
        boardGrid.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';

        this.container.appendChild(boardGrid);

        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].slice(0, this.options.boardSize);
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'].slice(0, this.options.boardSize);

        for (let row = 0; row < this.options.boardSize; row++) {
            for (let col = 0; col < this.options.boardSize; col++) {
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
            boardState = {
                board: Array(this.options.boardSize).fill(null).map(() => Array(this.options.boardSize).fill(null)),
                currentPlayer: 'white'
            };
        }

        const squares = boardState.board || [];
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].slice(0, this.options.boardSize);
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'].slice(0, this.options.boardSize);

        for (let row = 0; row < this.options.boardSize; row++) {
            for (let col = 0; col < this.options.boardSize; col++) {
                const rank = ranks[row];
                const file = files[col];
                const square = file + rank;

                const squareView = this.squares.get(square);
                if (!squareView) continue;

                const pieceData = squares[row] && squares[row][col];
                const piece = pieceData ? new Piece(pieceData.type, pieceData.color, square, pieceData.id) : null;

                const state = {
                    selected: this.selectedSquare === square,
                    validMove: false,
                    lastMove: this.lastMove &&
                        (this.lastMove.from === square || this.lastMove.to === square),
                    inCheck: false,
                    suggestedFrom: this.suggestedMove && this.suggestedMove.from === square,
                    suggestedTo: this.suggestedMove && this.suggestedMove.to === square
                };

                squareView.render(piece, state);
            }
        }
    }

    getHTML() {
        if (!this.container) return '';

        const boardGrid = this.container.querySelector('.chessboard-grid');
        if (!boardGrid) return '';

        return boardGrid.innerHTML;
    }

    renderAsHTML() {
        const startColor = this.options.squareColorStart === 'light' ? 1 : 0;
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].slice(0, this.options.boardSize);
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'].slice(0, this.options.boardSize);

        let html = `<div class="chessboard-grid" style="display: grid; grid-template-columns: repeat(${this.options.boardSize}, 1fr); grid-template-rows: repeat(${this.options.boardSize}, 1fr); width: 100%; aspect-ratio: 1; border: 3px solid var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">`;

        for (let row = 0; row < this.options.boardSize; row++) {
            for (let col = 0; col < this.options.boardSize; col++) {
                const rank = ranks[row];
                const file = files[col];
                const square = file + rank;

                const isLight = (row + col + startColor) % 2 === 1;
                const squareClass = isLight ? 'light' : 'dark';

                const squareView = this.squares.get(square);
                const pieceHtml = squareView && squareView.pieceView
                    ? `<div class="piece ${squareView.pieceView.piece.color}" data-piece="${squareView.pieceView.piece.type}" data-color="${squareView.pieceView.piece.color}" data-piece-id="${squareView.pieceView.piece.id}" data-piece-name="${squareView.pieceView.piece.getName()}">${squareView.pieceView.piece.getSymbol()}</div>`
                    : '';

                html += `<div class="chess-square ${squareClass}" data-square="${square}" data-row="${row}" data-col="${col}">${pieceHtml}</div>`;
            }
        }

        html += '</div>';
        return html;
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
            squareView.on('click', (square, eventData) => {
                this.emit('square-clicked', square, eventData);

                if (eventData.isEmpty) {
                    this.emit('empty-square-clicked', square, eventData);
                }
            });

            if (squareView.pieceView) {
                squareView.pieceView.on('click', (pieceData) => {
                    this.emit('piece-clicked', {
                        ...pieceData,
                        square: square
                    });
                });

                squareView.pieceView.on('mousedown', (pieceData) => {
                    this.emit('piece-drag-start', {
                        ...pieceData,
                        square: square
                    });
                });

                squareView.pieceView.on('dragstart', (pieceData) => {
                    this.emit('piece-drag-start', {
                        ...pieceData,
                        square: square
                    });
                });
            }
        });

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

