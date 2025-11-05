// Vista de Casilla Individual
class SquareView {
    constructor(square, container, options = {}) {
        this.square = square; // 'e4'
        this.container = container; // Elemento DOM
        this.options = {
            showCoordinates: options.showCoordinates !== false,
            orientation: options.orientation || 'white',
            ...options
        };
        this.element = null;
        this.pieceElement = null;
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
        const isLight = (row + col) % 2 === 0;
        
        this.element.className = `chess-square ${isLight ? 'light' : 'dark'}`;
        this.element.dataset.square = this.square;
        this.element.dataset.row = row;
        this.element.dataset.col = col;
        this.element.setAttribute('role', 'gridcell');
        this.element.setAttribute('aria-label', `Casilla ${this.square}`);
        this.element.setAttribute('tabindex', '0');

        // Añadir etiquetas de coordenadas
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
        // Remover pieza anterior
        if (this.pieceElement) {
            this.pieceElement.remove();
            this.pieceElement = null;
        }

        // Añadir nueva pieza
        if (piece) {
            this.pieceElement = document.createElement('div');
            this.pieceElement.className = `piece ${piece.color}`;
            this.pieceElement.textContent = piece.getSymbol();
            this.pieceElement.dataset.piece = piece.type;
            this.pieceElement.dataset.color = piece.color;
            this.pieceElement.setAttribute('role', 'img');
            this.pieceElement.setAttribute('aria-label', `${piece.color === 'white' ? 'Blanca' : 'Negra'} ${piece.getName()}`);
            this.pieceElement.setAttribute('draggable', 'true');
            this.element.appendChild(this.pieceElement);
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

    // Añadir listener de eventos
    addEventListener(event, callback) {
        if (!this.element) return;
        this.element.addEventListener(event, (e) => {
            callback(this.square, {
                isEmpty: !this.pieceElement,
                piece: this.pieceElement ? {
                    type: this.pieceElement.dataset.piece,
                    color: this.pieceElement.dataset.color
                } : null,
                square: this.square,
                event: e
            });
        });
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.pieceElement = null;
    }
}

