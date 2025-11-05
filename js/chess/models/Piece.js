// Modelo de Pieza
class Piece {
    constructor(type, color, square = null) {
        this.type = type; // 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king'
        this.color = color; // 'white' o 'black'
        this.square = square; // 'e4', 'a1', etc.
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

    getName() {
        const names = {
            king: 'Rey',
            queen: 'Dama',
            rook: 'Torre',
            bishop: 'Alfil',
            knight: 'Caballo',
            pawn: 'Peón'
        };
        return names[this.type] || this.type;
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
        return this.type === other.type && this.color === other.color;
    }

    clone() {
        return new Piece(this.type, this.color, this.square);
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

