class PieceView {
    constructor(piece, element) {
        this.piece = piece;
        this.element = element;
        this.eventListeners = new Map();
    }

    render() {
        if (!this.element) return;

        this.element.className = `piece ${this.piece.color}`;
        this.element.textContent = this.piece.getSymbol();
        this.element.dataset.piece = this.piece.type;
        this.element.dataset.color = this.piece.color;
        this.element.dataset.pieceId = this.piece.id;
        this.element.dataset.pieceName = this.piece.getName();
        this.element.setAttribute('role', 'img');
        this.element.setAttribute('aria-label', `${this.piece.color === 'white' ? 'Blanca' : 'Negra'} ${this.piece.getPieceLabel()}`);
        this.element.setAttribute('draggable', 'true');
    }

    updatePiece(piece) {
        this.piece = piece;
        this.render();
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
                callback({
                    pieceId: this.piece.id,
                    pieceName: this.piece.getName(),
                    type: this.piece.type,
                    color: this.piece.color,
                    square: this.piece.square,
                    domEvent: domEvent
                });
            } catch (e) {
                console.error(`Error en callback de evento ${event} para pieza:`, e);
            }
        });
    }

    destroy() {
        this.eventListeners.clear();
        this.element = null;
        this.piece = null;
    }
}
