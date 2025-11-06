// Modelo de Pieza
class Piece {
    constructor(type, color, square = null, id = null) {
        this.type = type;
        this.color = color;
        this.square = square;
        this.id = id || this.generateUniqueId();
    }

    generateUniqueId() {
        return `${this.color}-${this.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    getName() {
        const fullName = {
            white: {
                king: 'white-king',
                queen: 'white-queen',
                rook: 'white-rook',
                bishop: 'white-bishop',
                knight: 'white-knight',
                pawn: 'white-pawn'
            },
            black: {
                king: 'black-king',
                queen: 'black-queen',
                rook: 'black-rook',
                bishop: 'black-bishop',
                knight: 'black-knight',
                pawn: 'black-pawn'
            }
        };
        return fullName[this.color]?.[this.type] || `${this.color}-${this.type}`;
    }

    getPieceLabel() {
        const labels = {
            king: 'Rey',
            queen: 'Dama',
            rook: 'Torre',
            bishop: 'Alfil',
            knight: 'Caballo',
            pawn: 'Peón'
        };
        return labels[this.type] || this.type;
    }

    getSymbol() {
        const symbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        return symbols[this.color]?.[this.type] || '';
    }

    getValue() {
        const values = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: Infinity
        };
        return values[this.type] || 0;
    }

    equals(other) {
        if (!other) return false;
        return this.type === other.type && this.color === other.color && this.id === other.id;
    }

    equalsTypeAndColor(other) {
        if (!other) return false;
        return this.type === other.type && this.color === other.color;
    }

    clone() {
        return new Piece(this.type, this.color, this.square, this.id);
    }

    toFEN() {
        const fenMap = {
            white: { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: 'P' },
            black: { king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', pawn: 'p' }
        };
        return fenMap[this.color]?.[this.type] || '';
    }

    static fromFEN(fenChar) {
        const fenToPiece = {
            'K': new Piece('king', 'white'),
            'Q': new Piece('queen', 'white'),
            'R': new Piece('rook', 'white'),
            'B': new Piece('bishop', 'white'),
            'N': new Piece('knight', 'white'),
            'P': new Piece('pawn', 'white'),
            'k': new Piece('king', 'black'),
            'q': new Piece('queen', 'black'),
            'r': new Piece('rook', 'black'),
            'b': new Piece('bishop', 'black'),
            'n': new Piece('knight', 'black'),
            'p': new Piece('pawn', 'black')
        };
        return fenToPiece[fenChar] || null;
    }
}

