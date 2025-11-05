// Modelo de Movimiento con Notación Estándar
class Move {
    constructor(from, to, options = {}) {
        this.from = from; // 'e2'
        this.to = to; // 'e4'
        this.piece = options.piece || null;
        this.captured = options.captured || null;
        this.promotion = options.promotion || null; // 'q', 'r', 'b', 'n'
        this.castling = options.castling || null; // 'kingside', 'queenside'
        this.enPassant = options.enPassant || false;
        this.check = options.check || false;
        this.checkmate = options.checkmate || false;
        this.annotation = options.annotation || null; // '!', '?', '!!', etc.
    }

    // Convertir a notación UCI (e2e4, e7e8q)
    toUCI() {
        let uci = this.from + this.to;
        if (this.promotion) {
            uci += this.promotion.toLowerCase();
        }
        return uci;
    }

    // Crear desde notación UCI
    static fromUCI(uci) {
        if (!uci || uci.length < 4) return null;
        
        const from = uci.substring(0, 2);
        const to = uci.substring(2, 4);
        const promotion = uci.length > 4 ? uci.substring(4) : null;
        
        return new Move(from, to, { promotion });
    }

    // Convertir a notación algebraica corta (e4, Nf3, Qxd5)
    toAlgebraic(boardState = null) {
        if (!this.piece) {
            return this.to; // Fallback simple
        }

        const pieceType = this.piece.type;
        const pieceSymbol = this.getPieceSymbol(pieceType);
        
        // Movimiento de peón
        if (pieceType === 'pawn') {
            if (this.captured) {
                return `${this.from[0]}x${this.to}`;
            }
            return this.to;
        }

        // Movimiento de pieza mayor
        let notation = pieceSymbol + this.to;
        
        if (this.captured) {
            notation = pieceSymbol + 'x' + this.to;
        }

        // Promoción
        if (this.promotion) {
            const promoMap = { 'q': 'Q', 'r': 'R', 'b': 'B', 'n': 'N' };
            notation += '=' + promoMap[this.promotion.toLowerCase()];
        }

        // Anotaciones
        if (this.checkmate) {
            notation += '#';
        } else if (this.check) {
            notation += '+';
        }

        return notation;
    }

    getPieceSymbol(type) {
        const symbols = {
            king: 'K',
            queen: 'Q',
            rook: 'R',
            bishop: 'B',
            knight: 'N',
            pawn: ''
        };
        return symbols[type] || '';
    }

    // Crear desde notación algebraica (simplificado)
    static fromAlgebraic(notation, boardState = null) {
        // Implementación básica - se puede mejorar
        const clean = notation.replace(/[+#!?]/g, '');
        
        // Movimiento simple como e4
        if (clean.length === 2 && /^[a-h][1-8]$/.test(clean)) {
            // Asumir que es un movimiento de peón
            // Necesitaría contexto del tablero para determinar origen
            return null; // Requiere más contexto
        }

        // Movimiento con captura como Qxd5
        const captureMatch = clean.match(/^([KQRBN]?)([a-h]?[1-8]?)x([a-h][1-8])$/);
        if (captureMatch) {
            const [, piece, from, to] = captureMatch;
            return new Move(from || '', to, { piece: { type: this.getPieceTypeFromSymbol(piece) } });
        }

        return null;
    }

    static getPieceTypeFromSymbol(symbol) {
        const map = {
            'K': 'king',
            'Q': 'queen',
            'R': 'rook',
            'B': 'bishop',
            'N': 'knight',
            '': 'pawn'
        };
        return map[symbol] || 'pawn';
    }

    equals(other) {
        if (!other) return false;
        return this.from === other.from && this.to === other.to;
    }

    clone() {
        return new Move(this.from, this.to, {
            piece: this.piece ? this.piece.clone() : null,
            captured: this.captured ? this.captured.clone() : null,
            promotion: this.promotion,
            castling: this.castling,
            enPassant: this.enPassant,
            check: this.check,
            checkmate: this.checkmate,
            annotation: this.annotation
        });
    }

    // Validar formato básico
    isValid() {
        return this.isValidSquare(this.from) && this.isValidSquare(this.to);
    }

    isValidSquare(square) {
        if (!square || square.length !== 2) return false;
        const file = square[0];
        const rank = square[1];
        return /^[a-h]$/.test(file) && /^[1-8]$/.test(rank);
    }
}

