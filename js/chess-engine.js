// Motor de Ajedrez - Validación de movimientos y estado del juego
class ChessEngine {
    constructor() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white'; // 'white' o 'black'
        this.moveHistory = [];
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.inCheck = { white: false, black: false };
    }

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Peones
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }
        
        // Torres
        board[0][0] = { type: 'rook', color: 'black' };
        board[0][7] = { type: 'rook', color: 'black' };
        board[7][0] = { type: 'rook', color: 'white' };
        board[7][7] = { type: 'rook', color: 'white' };
        
        // Caballos
        board[0][1] = { type: 'knight', color: 'black' };
        board[0][6] = { type: 'knight', color: 'black' };
        board[7][1] = { type: 'knight', color: 'white' };
        board[7][6] = { type: 'knight', color: 'white' };
        
        // Alfiles
        board[0][2] = { type: 'bishop', color: 'black' };
        board[0][5] = { type: 'bishop', color: 'black' };
        board[7][2] = { type: 'bishop', color: 'white' };
        board[7][5] = { type: 'bishop', color: 'white' };
        
        // Damas
        board[0][3] = { type: 'queen', color: 'black' };
        board[7][3] = { type: 'queen', color: 'white' };
        
        // Reyes
        board[0][4] = { type: 'king', color: 'black' };
        board[7][4] = { type: 'king', color: 'white' };
        
        return board;
    }

    // Convertir coordenadas algebraicas a índices (ej: 'e4' -> [4, 4])
    algebraicToCoords(algebraic) {
        if (!algebraic || algebraic.length < 2) return null;
        const file = algebraic.charCodeAt(0) - 97; // a=0, b=1, etc.
        const rank = 8 - parseInt(algebraic[1]); // 1=7, 2=6, etc.
        if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
        return [rank, file];
    }

    // Convertir índices a notación algebraica (ej: [4, 4] -> 'e4')
    coordsToAlgebraic(row, col) {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return file + rank;
    }

    // Obtener pieza en una casilla
    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    // Obtener posición del rey
    getKingPosition(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    // Validar si un movimiento es legal
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece || piece.color !== this.currentPlayer) return false;

        const targetPiece = this.getPiece(toRow, toCol);
        if (targetPiece && targetPiece.color === piece.color) return false;

        // Obtener movimientos posibles de la pieza
        const possibleMoves = this.getPossibleMoves(fromRow, fromCol);
        const moveFound = possibleMoves.some(move => 
            move[0] === toRow && move[1] === toCol
        );

        if (!moveFound) return false;

        // Verificar que el movimiento no deje al rey en jaque
        const testBoard = this.cloneBoard();
        testBoard[toRow][toCol] = testBoard[fromRow][fromCol];
        testBoard[fromRow][fromCol] = null;

        // Si el rey se está moviendo, usar la nueva posición
        let kingPos;
        if (piece.type === 'king') {
            kingPos = [toRow, toCol];
        } else {
            kingPos = this.getKingPosition(this.currentPlayer);
        }
        
        if (!kingPos) return true;

        // Verificar si el rey queda en jaque después del movimiento
        const opponentColor = this.currentPlayer === 'white' ? 'black' : 'white';
        const isInCheck = this.isSquareAttacked(kingPos[0], kingPos[1], opponentColor, testBoard);

        return !isInCheck;
    }

    // Verificar si una casilla está siendo atacada
    isSquareAttacked(row, col, attackingColor, board = this.board) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === attackingColor) {
                    const moves = this.getPossibleMovesForPiece(r, c, board);
                    if (moves.some(move => move[0] === row && move[1] === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Obtener movimientos posibles desde una casilla
    getPossibleMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        return this.getPossibleMovesForPiece(row, col, this.board);
    }

    // Obtener movimientos posibles para una pieza específica
    getPossibleMovesForPiece(row, col, board) {
        const piece = board[row][col];
        if (!piece) return [];

        const moves = [];

        switch (piece.type) {
            case 'pawn':
                moves.push(...this.getPawnMoves(row, col, piece.color, board));
                break;
            case 'rook':
                moves.push(...this.getRookMoves(row, col, piece.color, board));
                break;
            case 'knight':
                moves.push(...this.getKnightMoves(row, col, piece.color, board));
                break;
            case 'bishop':
                moves.push(...this.getBishopMoves(row, col, piece.color, board));
                break;
            case 'queen':
                moves.push(...this.getQueenMoves(row, col, piece.color, board));
                break;
            case 'king':
                moves.push(...this.getKingMoves(row, col, piece.color, board));
                break;
        }

        return moves;
    }

    // Movimientos del peón
    getPawnMoves(row, col, color, board) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Movimiento hacia adelante
        if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
            moves.push([row + direction, col]);
            
            // Movimiento doble desde la posición inicial
            if (row === startRow && !board[row + 2 * direction][col]) {
                moves.push([row + 2 * direction, col]);
            }
        }

        // Capturas diagonales
        for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            if (newCol >= 0 && newCol < 8 && row + direction >= 0 && row + direction < 8) {
                const targetPiece = board[row + direction][newCol];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push([row + direction, newCol]);
                }
            }
        }

        // En passant (simplificado - se manejará mejor en el método makeMove)
        if (this.enPassantTarget) {
            const [epRow, epCol] = this.enPassantTarget;
            if (row === epRow && Math.abs(col - epCol) === 1) {
                moves.push([row + direction, epCol]);
            }
        }

        return moves;
    }

    // Movimientos de la torre
    getRookMoves(row, col, color, board) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;
                
                const piece = board[newRow][newCol];
                if (!piece) {
                    moves.push([newRow, newCol]);
                } else {
                    if (piece.color !== color) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
            }
        }

        return moves;
    }

    // Movimientos del caballo
    getKnightMoves(row, col, color, board) {
        const moves = [];
        const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

        for (const [dr, dc] of offsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const piece = board[newRow][newCol];
                if (!piece || piece.color !== color) {
                    moves.push([newRow, newCol]);
                }
            }
        }

        return moves;
    }

    // Movimientos del alfil
    getBishopMoves(row, col, color, board) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;
                
                const piece = board[newRow][newCol];
                if (!piece) {
                    moves.push([newRow, newCol]);
                } else {
                    if (piece.color !== color) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
            }
        }

        return moves;
    }

    // Movimientos de la dama
    getQueenMoves(row, col, color, board) {
        return [
            ...this.getRookMoves(row, col, color, board),
            ...this.getBishopMoves(row, col, color, board)
        ];
    }

    // Movimientos del rey
    getKingMoves(row, col, color, board) {
        const moves = [];
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const piece = board[newRow][newCol];
                if (!piece || piece.color !== color) {
                    moves.push([newRow, newCol]);
                }
            }
        }

        // Enroque (simplificado)
        // Se manejará mejor en el método makeMove con validación completa

        return moves;
    }

    // Realizar un movimiento
    makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return false;
        }

        const piece = this.getPiece(fromRow, fromCol);
        const capturedPiece = this.getPiece(toRow, toCol);
        
        // Registrar movimiento
        const move = {
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            piece: piece,
            captured: capturedPiece,
            notation: this.coordsToAlgebraic(fromRow, fromCol) + this.coordsToAlgebraic(toRow, toCol)
        };

        // Realizar movimiento
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Promoción del peón
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            const promotionType = promotionPiece || 'queen';
            this.board[toRow][toCol] = { type: promotionType, color: piece.color };
        }

        // Actualizar enroque
        if (piece.type === 'king') {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        }

        if (piece.type === 'rook') {
            if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
            if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
        }

        this.moveHistory.push(move);
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Actualizar estado de jaque
        this.updateCheckStatus();

        return true;
    }

    // Actualizar estado de jaque
    updateCheckStatus() {
        const whiteKing = this.getKingPosition('white');
        const blackKing = this.getKingPosition('black');
        
        this.inCheck.white = whiteKing ? this.isSquareAttacked(whiteKing[0], whiteKing[1], 'black') : false;
        this.inCheck.black = blackKing ? this.isSquareAttacked(blackKing[0], blackKing[1], 'white') : false;
    }

    // Verificar jaque mate
    isCheckmate(color) {
        if (!this.inCheck[color]) return false;

        // Verificar si hay algún movimiento legal
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === color) {
                    const moves = this.getPossibleMoves(row, col);
                    for (const move of moves) {
                        const testBoard = this.cloneBoard();
                        testBoard[move[0]][move[1]] = testBoard[row][col];
                        testBoard[row][col] = null;
                        
                        const kingPos = this.getKingPosition(color);
                        if (kingPos) {
                            const opponentColor = color === 'white' ? 'black' : 'white';
                            const stillInCheck = this.isSquareAttacked(kingPos[0], kingPos[1], opponentColor, testBoard);
                            if (!stillInCheck) return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    // Verificar ahogado (tablas)
    isStalemate(color) {
        if (this.inCheck[color]) return false;

        // Verificar si hay algún movimiento legal
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === color) {
                    const moves = this.getPossibleMoves(row, col);
                    if (moves.length > 0) return false;
                }
            }
        }

        return true;
    }

    // Clonar tablero
    cloneBoard() {
        return this.board.map(row => row.map(piece => piece ? {...piece} : null));
    }

    // Obtener FEN (simplificado)
    getFEN() {
        // Implementación simplificada - se puede mejorar
        let fen = '';
        for (let row = 0; row < 8; row++) {
            let emptyCount = 0;
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) {
                    emptyCount++;
                } else {
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    const pieceChar = this.getPieceChar(piece);
                    fen += pieceChar;
                }
            }
            if (emptyCount > 0) fen += emptyCount;
            if (row < 7) fen += '/';
        }
        return fen;
    }

    getPieceChar(piece) {
        const chars = {
            'pawn': 'P', 'rook': 'R', 'knight': 'N', 'bishop': 'B', 'queen': 'Q', 'king': 'K'
        };
        const char = chars[piece.type];
        return piece.color === 'white' ? char : char.toLowerCase();
    }

    // Cargar posición desde FEN (simplificado)
    loadFEN(fen) {
        // Implementación básica - se puede mejorar
        const rows = fen.split('/');
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        for (let row = 0; row < 8; row++) {
            let col = 0;
            for (const char of rows[row]) {
                if (char >= '1' && char <= '8') {
                    col += parseInt(char);
                } else {
                    const piece = this.charToPiece(char);
                    if (piece) {
                        this.board[row][col] = piece;
                        col++;
                    }
                }
            }
        }
    }

    charToPiece(char) {
        const isWhite = char === char.toUpperCase();
        const type = {
            'P': 'pawn', 'R': 'rook', 'N': 'knight', 'B': 'bishop', 'Q': 'queen', 'K': 'king'
        }[char.toUpperCase()];
        
        if (!type) return null;
        return { type, color: isWhite ? 'white' : 'black' };
    }

    // Resetear tablero
    reset() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.inCheck = { white: false, black: false };
    }
}

