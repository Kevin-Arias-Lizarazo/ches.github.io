// Motor de Ajedrez Refactorizado - Implementa IBoardProvider e IMoveHandler
// Usa notación estándar y es independiente de la UI
class ChessEngine {
    constructor(initialPosition = null) {
        this.board = initialPosition ? this.loadFromFEN(initialPosition) : this.createInitialBoard();
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.inCheck = { white: false, black: false };
        this.moveCallbacks = {
            completed: [],
            attempted: []
        };
    }

    // Implementación de IBoardProvider
    getPiece(square) {
        const coords = this.squareToCoords(square);
        if (!coords) return null;
        const [row, col] = coords;
        const piece = this.board[row][col];
        if (!piece) return null;
        return new Piece(piece.type, piece.color, square);
    }

    getBoardState() {
        return {
            board: this.board.map(row => row.map(piece => piece ? { ...piece } : null)),
            currentPlayer: this.currentPlayer,
            moveHistory: this.moveHistory.map(move => move.clone ? move.clone() : move)
        };
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    isValidMove(move) {
        if (!move || !move.from || !move.to) return false;
        const fromCoords = this.squareToCoords(move.from);
        const toCoords = this.squareToCoords(move.to);
        if (!fromCoords || !toCoords) return false;
        return this.isValidMoveCoords(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
    }

    // Implementación de IMoveHandler
    handleMove(move) {
        if (!move || !move.from || !move.to) return false;
        
        const fromCoords = this.squareToCoords(move.from);
        const toCoords = this.squareToCoords(move.to);
        if (!fromCoords || !toCoords) return false;

        // Notificar intento de movimiento
        this.notifyMoveAttempted(move);

        if (this.makeMoveCoords(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1], move.promotion)) {
            // Notificar movimiento completado
            this.notifyMoveCompleted(move);
            return true;
        }
        return false;
    }

    onMoveCompleted(callback) {
        if (typeof callback === 'function') {
            this.moveCallbacks.completed.push(callback);
        }
    }

    onMoveAttempted(callback) {
        if (typeof callback === 'function') {
            this.moveCallbacks.attempted.push(callback);
        }
    }

    notifyMoveCompleted(move) {
        this.moveCallbacks.completed.forEach(callback => callback(move));
    }

    notifyMoveAttempted(move) {
        this.moveCallbacks.attempted.forEach(callback => callback(move));
    }

    // Métodos auxiliares
    squareToCoords(square) {
        if (!square || square.length !== 2) return null;
        const file = square.charCodeAt(0) - 97;
        const rank = 8 - parseInt(square[1]);
        if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
        return [rank, file];
    }

    coordsToSquare(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return file + rank;
    }

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }
        
        board[0][0] = { type: 'rook', color: 'black' };
        board[0][7] = { type: 'rook', color: 'black' };
        board[7][0] = { type: 'rook', color: 'white' };
        board[7][7] = { type: 'rook', color: 'white' };
        
        board[0][1] = { type: 'knight', color: 'black' };
        board[0][6] = { type: 'knight', color: 'black' };
        board[7][1] = { type: 'knight', color: 'white' };
        board[7][6] = { type: 'knight', color: 'white' };
        
        board[0][2] = { type: 'bishop', color: 'black' };
        board[0][5] = { type: 'bishop', color: 'black' };
        board[7][2] = { type: 'bishop', color: 'white' };
        board[7][5] = { type: 'bishop', color: 'white' };
        
        board[0][3] = { type: 'queen', color: 'black' };
        board[7][3] = { type: 'queen', color: 'white' };
        
        board[0][4] = { type: 'king', color: 'black' };
        board[7][4] = { type: 'king', color: 'white' };
        
        return board;
    }

    // Cargar desde FEN
    loadFromFEN(fen) {
        if (!fen || fen === 'start') {
            return this.createInitialBoard();
        }

        const parts = fen.split(' ');
        const position = parts[0];
        const rows = position.split('/');
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        for (let row = 0; row < 8; row++) {
            let col = 0;
            for (const char of rows[row]) {
                if (char >= '1' && char <= '8') {
                    col += parseInt(char);
                } else {
                    const piece = Piece.fromFEN(char);
                    if (piece) {
                        board[row][col] = { type: piece.type, color: piece.color };
                        col++;
                    }
                }
            }
        }

        // Establecer jugador actual si se especifica
        if (parts.length > 1) {
            this.currentPlayer = parts[1] === 'b' ? 'black' : 'white';
        }

        return board;
    }

    // Cargar posición desde FEN
    loadFEN(fen) {
        this.board = this.loadFromFEN(fen);
        this.moveHistory = [];
        this.updateCheckStatus();
    }

    // Obtener movimientos posibles desde una casilla (notación algebraica)
    getPossibleMovesFromSquare(square) {
        const coords = this.squareToCoords(square);
        if (!coords) return [];
        const [row, col] = coords;
        return this.getPossibleMovesCoords(row, col).map(([r, c]) => this.coordsToSquare(r, c));
    }

    // Obtener movimientos posibles (coordenadas)
    getPossibleMovesCoords(row, col) {
        const piece = this.getPieceAtCoords(row, col);
        if (!piece) return [];
        return this.getPossibleMovesForPiece(row, col, this.board);
    }

    getPieceAtCoords(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        const piece = this.board[row][col];
        if (!piece) return null;
        const square = this.coordsToSquare(row, col);
        return new Piece(piece.type, piece.color, square);
    }

    // Validar movimiento por coordenadas
    isValidMoveCoords(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPieceAtCoords(fromRow, fromCol);
        if (!piece || piece.color !== this.currentPlayer) return false;

        const targetPiece = this.getPieceAtCoords(toRow, toCol);
        if (targetPiece && targetPiece.color === piece.color) return false;

        const possibleMoves = this.getPossibleMovesForPiece(fromRow, fromCol, this.board);
        const moveFound = possibleMoves.some(move => move[0] === toRow && move[1] === toCol);
        if (!moveFound) return false;

        const testBoard = this.cloneBoard();
        testBoard[toRow][toCol] = testBoard[fromRow][fromCol];
        testBoard[fromRow][fromCol] = null;

        let kingPos;
        if (piece.type === 'king') {
            kingPos = [toRow, toCol];
        } else {
            kingPos = this.getKingPosition(this.currentPlayer);
        }
        
        if (!kingPos) return true;

        const opponentColor = this.currentPlayer === 'white' ? 'black' : 'white';
        return !this.isSquareAttacked(kingPos[0], kingPos[1], opponentColor, testBoard);
    }

    // Realizar movimiento por coordenadas
    makeMoveCoords(fromRow, fromCol, toRow, toCol, promotion = null) {
        if (!this.isValidMoveCoords(fromRow, fromCol, toRow, toCol)) {
            return false;
        }

        const piece = this.getPieceAtCoords(fromRow, fromCol);
        const capturedPiece = this.getPieceAtCoords(toRow, toCol);
        
        const fromSquare = this.coordsToSquare(fromRow, fromCol);
        const toSquare = this.coordsToSquare(toRow, toCol);
        
        const move = new Move(fromSquare, toSquare, {
            piece: piece,
            captured: capturedPiece,
            promotion: promotion
        });

        this.board[toRow][toCol] = piece ? { type: piece.type, color: piece.color } : null;
        this.board[fromRow][fromCol] = null;

        if (piece && piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            const promotionType = promotion || 'queen';
            this.board[toRow][toCol] = { type: promotionType, color: piece.color };
        }

        if (piece && piece.type === 'king') {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        }

        if (piece && piece.type === 'rook') {
            if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
            if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
        }

        this.moveHistory.push(move);
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateCheckStatus();
        
        return true;
    }

    // Mantener métodos existentes para compatibilidad
    makeMove(fromRow, fromCol, toRow, toCol, promotion = null) {
        return this.makeMoveCoords(fromRow, fromCol, toRow, toCol, promotion);
    }

    getPossibleMoves(row, col) {
        return this.getPossibleMovesCoords(row, col);
    }

    getPiece(row, col) {
        return this.getPieceAtCoords(row, col);
    }

    // Método adicional para compatibilidad con MoveValidator
    getPossibleMovesFromSquare(square) {
        const coords = this.squareToCoords(square);
        if (!coords) return [];
        const [row, col] = coords;
        const moves = this.getPossibleMovesCoords(row, col);
        return moves.map(([r, c]) => this.coordsToSquare(r, c));
    }

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

    getPawnMoves(row, col, color, board) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
            moves.push([row + direction, col]);
            
            if (row === startRow && !board[row + 2 * direction][col]) {
                moves.push([row + 2 * direction, col]);
            }
        }

        for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            if (newCol >= 0 && newCol < 8 && row + direction >= 0 && row + direction < 8) {
                const targetPiece = board[row + direction][newCol];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push([row + direction, newCol]);
                }
            }
        }

        return moves;
    }

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

    getQueenMoves(row, col, color, board) {
        return [
            ...this.getRookMoves(row, col, color, board),
            ...this.getBishopMoves(row, col, color, board)
        ];
    }

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

        return moves;
    }

    updateCheckStatus() {
        const whiteKing = this.getKingPosition('white');
        const blackKing = this.getKingPosition('black');
        
        this.inCheck.white = whiteKing ? this.isSquareAttacked(whiteKing[0], whiteKing[1], 'black') : false;
        this.inCheck.black = blackKing ? this.isSquareAttacked(blackKing[0], blackKing[1], 'white') : false;
    }

    isCheckmate(color) {
        if (!this.inCheck[color]) return false;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getPossibleMovesForPiece(row, col, this.board);
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

    isStalemate(color) {
        if (this.inCheck[color]) return false;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getPossibleMovesForPiece(row, col, this.board);
                    if (moves.length > 0) return false;
                }
            }
        }

        return true;
    }

    cloneBoard() {
        return this.board.map(row => row.map(piece => piece ? {...piece} : null));
    }

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

    getFEN() {
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
        fen += ` ${this.currentPlayer === 'white' ? 'w' : 'b'}`;
        return fen;
    }

    getPieceChar(piece) {
        const chars = {
            'pawn': 'P', 'rook': 'R', 'knight': 'N', 'bishop': 'B', 'queen': 'Q', 'king': 'K'
        };
        const char = chars[piece.type];
        return piece.color === 'white' ? char : char.toLowerCase();
    }
}

