class SquareView {
    constructor(square, container, options = {}) {
        this.square = square;
        this.container = container;
        this.options = {
            showCoordinates: options.showCoordinates !== false,
            orientation: options.orientation || 'white',
            boardSize: options.boardSize || 8,
            squareColorStart: options.squareColorStart || 'dark',
            ...options
        };
        this.element = null;
        this.pieceView = null;
        this.eventListeners = new Map();
        this.state = {
            selected: false,
            validMove: false,
            lastMove: false,
            inCheck: false,
            suggestedFrom: false,
            suggestedTo: false
        };
    }

    render(piece = null, state = {}) {
        if (!this.element) {
            this.createElement();
        }

        this.updateState(state);
        this.updatePiece(piece);
        this.updateVisualState();
    }

    createElement() {
        this.element = document.createElement('div');
        const [row, col] = this.squareToCoords(this.square);

        const startColor = this.options.squareColorStart === 'light' ? 1 : 0;
        const isLight = (row + col + startColor) % 2 === 1;

        this.element.className = `chess-square ${isLight ? 'light' : 'dark'}`;
        this.element.dataset.square = this.square;
        this.element.dataset.row = row;
        this.element.dataset.col = col;
        this.element.setAttribute('role', 'gridcell');
        this.element.setAttribute('aria-label', `Casilla ${this.square}`);
        this.element.setAttribute('tabindex', '0');

        if (this.options.showCoordinates) {
            this.addCoordinateLabels(row, col);
        }

        this.container.appendChild(this.element);
    }

    addCoordinateLabels(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        // File label (a-h) en la última fila
        if (row === 7) {
            const fileLabel = document.createElement('span');
            fileLabel.className = 'square-label file';
            fileLabel.textContent = files[col];
            fileLabel.setAttribute('aria-hidden', 'true');
            this.element.appendChild(fileLabel);
        }

        // Rank label (1-8) en la primera columna
        if (col === 0) {
            const rankLabel = document.createElement('span');
            rankLabel.className = 'square-label rank';
            rankLabel.textContent = ranks[row];
            rankLabel.setAttribute('aria-hidden', 'true');
            this.element.appendChild(rankLabel);
        }
    }

    updateState(state) {
        this.state = {
            selected: state.selected || false,
            validMove: state.validMove || false,
            lastMove: state.lastMove || false,
            inCheck: state.inCheck || false,
            suggestedFrom: state.suggestedFrom || false,
            suggestedTo: state.suggestedTo || false
        };
    }

    updatePiece(piece) {
        if (this.pieceView) {
            this.pieceView.destroy();
            this.pieceView = null;
        }

        if (piece) {
            const pieceElement = document.createElement('div');
            this.pieceView = new PieceView(piece, pieceElement);
            this.pieceView.render();
            this.element.appendChild(pieceElement);
        }
    }

    updateVisualState() {
        if (!this.element) return;

        // Limpiar clases de estado
        this.element.classList.remove(
            'selected', 'valid-move', 'last-move', 'check',
            'suggested-from', 'suggested-to'
        );
        this.element.removeAttribute('aria-selected');

        // Aplicar estados
        if (this.state.selected) {
            this.element.classList.add('selected');
            this.element.setAttribute('aria-selected', 'true');
        }
        if (this.state.validMove) {
            this.element.classList.add('valid-move');
        }
        if (this.state.lastMove) {
            this.element.classList.add('last-move');
        }
        if (this.state.inCheck) {
            this.element.classList.add('check');
        }
        if (this.state.suggestedFrom) {
            this.element.classList.add('suggested-from');
        }
        if (this.state.suggestedTo) {
            this.element.classList.add('suggested-to');
        }
    }

    squareToCoords(square) {
        if (!square || square.length !== 2) return [0, 0];
        const file = square.charCodeAt(0) - 97;
        const rank = 8 - parseInt(square[1]);
        return [rank, file];
    }

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);

        if (this.element) {
            this.element.addEventListener(event, (e) => {
                this.emitEvent(event, e);
            });
        }
    }

    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        const callbacks = this.eventListeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emitEvent(event, domEvent) {
        if (!this.eventListeners.has(event)) return;
        const callbacks = this.eventListeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(this.square, {
                    isEmpty: !this.pieceView,
                    piece: this.pieceView ? this.pieceView.piece : null,
                    square: this.square,
                    domEvent: domEvent
                });
            } catch (e) {
                console.error(`Error en callback de evento ${event}:`, e);
            }
        });
    }

    addEventListener(event, callback) {
        this.on(event, callback);
    }

    destroy() {
        if (this.pieceView) {
            this.pieceView.destroy();
            this.pieceView = null;
        }
        this.eventListeners.clear();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

