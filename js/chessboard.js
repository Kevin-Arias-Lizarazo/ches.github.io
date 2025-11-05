// Abstracción del tablero de ajedrez - Desacoplada del proceso de aprendizaje
class ChessBoardRenderer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showCoordinates: options.showCoordinates !== false,
            orientation: options.orientation || 'white', // 'white' o 'black'
            onSquareClick: options.onSquareClick || null,
            onPieceMove: options.onPieceMove || null,
            getPiece: options.getPiece || null,
            getValidMoves: options.getValidMoves || null,
            getSquareState: options.getSquareState || null,
            ...options
        };
        
        this.selectedSquare = null;
        this.validMoves = [];
        this.draggedPiece = null;
        this.lastMove = null;
        this.suggestedMove = null; // Movimiento sugerido para ejercicios
        
        if (this.container) {
            this.init();
        }
    }

    init() {
        this.createBoard();
        this.render();
        this.attachEventListeners();
    }

    createBoard() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.setAttribute('role', 'application');
        this.container.setAttribute('aria-label', 'Tablero de ajedrez interactivo');
        
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        // Crear tablero desde la perspectiva del jugador blanco
        // Fila 0 (arriba) = rank 8, Fila 7 (abajo) = rank 1
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const visualRank = 8 - row; // Rank visual: 8-1
                const file = files[col];
                const rank = ranks[row];
                
                // Alternar colores: a1 es oscuro, así que (row + col) % 2 === 1 es oscuro
                const isLight = (row + col) % 2 === 0;
                square.className = `chess-square ${isLight ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.dataset.square = file + rank;
                square.setAttribute('role', 'gridcell');
                square.setAttribute('aria-label', `Casilla ${file}${rank}`);
                square.setAttribute('tabindex', '0');
                
                // Etiquetas de coordenadas
                if (this.options.showCoordinates) {
                    if (row === 7) { // Última fila (rank 1)
                        const fileLabel = document.createElement('span');
                        fileLabel.className = 'square-label file';
                        fileLabel.textContent = file;
                        fileLabel.setAttribute('aria-hidden', 'true');
                        square.appendChild(fileLabel);
                    }
                    if (col === 0) { // Primera columna (file a)
                        const rankLabel = document.createElement('span');
                        rankLabel.className = 'square-label rank';
                        rankLabel.textContent = rank;
                        rankLabel.setAttribute('aria-hidden', 'true');
                        square.appendChild(rankLabel);
                    }
                }
                
                this.container.appendChild(square);
            }
        }
    }

    render() {
        if (!this.container) return;
        
        const squares = this.container.querySelectorAll('.chess-square');
        
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            // Limpiar clases de estado
            square.classList.remove('selected', 'valid-move', 'last-move', 'check');
            square.removeAttribute('aria-selected');
            
            // Remover pieza anterior
            const existingPiece = square.querySelector('.piece');
            if (existingPiece) {
                existingPiece.remove();
            }
            
            // Obtener pieza usando callback
            const piece = this.options.getPiece ? this.options.getPiece(row, col) : null;
            
            // Renderizar pieza
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece.color}`;
                pieceElement.textContent = this.getPieceSymbol(piece);
                pieceElement.dataset.piece = piece.type;
                pieceElement.dataset.color = piece.color;
                pieceElement.setAttribute('role', 'img');
                pieceElement.setAttribute('aria-label', `${piece.color === 'white' ? 'Blanca' : 'Negra'} ${this.getPieceName(piece.type)}`);
                pieceElement.setAttribute('draggable', 'true');
                square.appendChild(pieceElement);
            }
            
            // Obtener estado de la casilla usando callback
            const state = this.options.getSquareState ? this.options.getSquareState(row, col) : {};
            
            // Resaltar casilla seleccionada
            if (this.selectedSquare && this.selectedSquare[0] === row && this.selectedSquare[1] === col) {
                square.classList.add('selected');
                square.setAttribute('aria-selected', 'true');
            }
            
            // Resaltar movimientos válidos
            if (this.validMoves.some(move => move[0] === row && move[1] === col)) {
                square.classList.add('valid-move');
            }
            
            // Resaltar última jugada
            if (this.lastMove) {
                const [fromRow, fromCol] = this.lastMove.from;
                const [toRow, toCol] = this.lastMove.to;
                if ((row === fromRow && col === fromCol) || (row === toRow && col === toCol)) {
                    square.classList.add('last-move');
                }
            }
            
            // Estado personalizado
            if (state.selected) {
                square.classList.add('selected');
            }
            if (state.validMove) {
                square.classList.add('valid-move');
            }
            if (state.lastMove) {
                square.classList.add('last-move');
            }
            if (state.inCheck) {
                square.classList.add('check');
            }
            
            // Resaltar sugerencias visuales
            if (this.suggestedMove) {
                const [fromRow, fromCol] = this.suggestedMove.from;
                const [toRow, toCol] = this.suggestedMove.to;
                
                if (row === fromRow && col === fromCol) {
                    square.classList.add('suggested-from');
                }
                if (row === toRow && col === toCol) {
                    square.classList.add('suggested-to');
                }
            }
        });
    }

    getPieceSymbol(piece) {
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
        return symbols[piece.color]?.[piece.type] || '';
    }

    getPieceName(pieceType) {
        const names = {
            king: 'Rey',
            queen: 'Dama',
            rook: 'Torre',
            bishop: 'Alfil',
            knight: 'Caballo',
            pawn: 'Peón'
        };
        return names[pieceType] || pieceType;
    }

    attachEventListeners() {
        if (!this.container) return;
        
        const squares = this.container.querySelectorAll('.chess-square');
        
        squares.forEach(square => {
            // Click en casilla
            square.addEventListener('click', (e) => {
                if (e.target.classList.contains('piece')) return;
                this.handleSquareClick(square, e);
            });
            
            // Navegación por teclado
            square.addEventListener('keydown', (e) => {
                this.handleKeyPress(square, e);
            });
            
            // Pieza dentro de la casilla
            const piece = square.querySelector('.piece');
            if (piece) {
                piece.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handlePieceClick(square, e);
                });
                
                // Drag and drop
                piece.addEventListener('mousedown', (e) => {
                    this.startDrag(e, square, piece);
                });
                
                piece.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                    this.startDrag(e, square, piece);
                });
            }
        });
        
        // Mouse events para drag
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));
        document.addEventListener('dragend', (e) => this.endDrag(e));
    }

    handleSquareClick(square, e) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (this.options.onSquareClick) {
            this.options.onSquareClick(row, col, square, e);
        } else {
            this.defaultSquareClick(row, col);
        }
    }

    handlePieceClick(square, e) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (this.options.onSquareClick) {
            this.options.onSquareClick(row, col, square, e);
        } else {
            this.defaultPieceClick(row, col);
        }
    }

    handleKeyPress(square, e) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleSquareClick(square, e);
        }
    }

    defaultSquareClick(row, col) {
        if (this.selectedSquare) {
            const [fromRow, fromCol] = this.selectedSquare;
            this.selectSquare(null);
            if (this.options.onPieceMove) {
                this.options.onPieceMove(fromRow, fromCol, row, col);
            }
        } else {
            const piece = this.options.getPiece ? this.options.getPiece(row, col) : null;
            if (piece) {
                this.selectSquare([row, col]);
            }
        }
    }

    defaultPieceClick(row, col) {
        if (this.selectedSquare && this.selectedSquare[0] === row && this.selectedSquare[1] === col) {
            this.selectSquare(null);
        } else {
            this.selectSquare([row, col]);
        }
    }

    selectSquare(square) {
        this.selectedSquare = square;
        if (square && this.options.getValidMoves) {
            this.validMoves = this.options.getValidMoves(square[0], square[1]);
        } else {
            this.validMoves = [];
        }
        this.render();
    }

    startDrag(e, square, piece) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const chessPiece = this.options.getPiece ? this.options.getPiece(row, col) : null;
        
        if (!chessPiece) return;
        
        this.draggedPiece = {
            element: piece,
            square: square,
            row: row,
            col: col,
            offsetX: e.offsetX || 0,
            offsetY: e.offsetY || 0
        };
        
        piece.classList.add('dragging');
        this.selectSquare([row, col]);
    }

    handleDrag(e) {
        if (!this.draggedPiece) return;
        
        const piece = this.draggedPiece.element;
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left - this.draggedPiece.offsetX;
        const y = e.clientY - rect.top - this.draggedPiece.offsetY;
        
        piece.style.position = 'absolute';
        piece.style.left = x + 'px';
        piece.style.top = y + 'px';
        piece.style.zIndex = '1000';
    }

    endDrag(e) {
        if (!this.draggedPiece) return;
        
        const piece = this.draggedPiece.element;
        const square = document.elementFromPoint(e.clientX, e.clientY);
        
        piece.classList.remove('dragging');
        piece.style.position = '';
        piece.style.left = '';
        piece.style.top = '';
        piece.style.zIndex = '';
        
        if (square && square.classList.contains('chess-square')) {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            if (this.options.onPieceMove) {
                this.options.onPieceMove(this.draggedPiece.row, this.draggedPiece.col, row, col);
            }
        }
        
        this.render();
        this.draggedPiece = null;
    }

    setLastMove(from, to) {
        this.lastMove = { from, to };
        this.render();
    }

    update() {
        this.render();
    }

    reset() {
        this.selectedSquare = null;
        this.validMoves = [];
        this.lastMove = null;
        this.suggestedMove = null;
        this.render();
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Clase wrapper para compatibilidad con el código existente
class ChessBoard {
    constructor(containerId, engine) {
        this.engine = engine;
        this.renderer = new ChessBoardRenderer(containerId, {
            getPiece: (row, col) => engine.getPiece(row, col),
            getValidMoves: (row, col) => engine.getPossibleMoves(row, col),
            getSquareState: (row, col) => {
                const state = {};
                const kingPos = engine.getKingPosition(engine.currentPlayer);
                if (kingPos && kingPos[0] === row && kingPos[1] === col && engine.inCheck[engine.currentPlayer]) {
                    state.inCheck = true;
                }
                return state;
            },
            onSquareClick: (row, col) => {
                if (this.renderer.selectedSquare) {
                    const [fromRow, fromCol] = this.renderer.selectedSquare;
                    if (engine.makeMove(fromRow, fromCol, row, col)) {
                        this.renderer.setLastMove([fromRow, fromCol], [row, col]);
                        this.renderer.selectSquare(null);
                        if (this.onMoveCallback) {
                            this.onMoveCallback();
                        }
                    } else {
                        const piece = engine.getPiece(row, col);
                        if (piece && piece.color === engine.currentPlayer) {
                            this.renderer.selectSquare([row, col]);
                        } else {
                            this.renderer.selectSquare(null);
                        }
                    }
                } else {
                    const piece = engine.getPiece(row, col);
                    if (piece && piece.color === engine.currentPlayer) {
                        this.renderer.selectSquare([row, col]);
                    }
                }
            },
            onPieceMove: (fromRow, fromCol, toRow, toCol) => {
                if (engine.makeMove(fromRow, fromCol, toRow, toCol)) {
                    this.renderer.setLastMove([fromRow, fromCol], [toRow, toCol]);
                    this.renderer.selectSquare(null);
                    if (this.onMoveCallback) {
                        this.onMoveCallback();
                    }
                } else {
                    this.renderer.update();
                }
            }
        });
        
        this.onMoveCallback = null;
    }

    render() {
        this.renderer.update();
    }

    reset() {
        this.engine.reset();
        this.renderer.reset();
    }

    loadPosition(fen) {
        this.engine.loadFEN(fen);
        this.renderer.reset();
    }

    toggleCoordinates() {
        this.renderer.options.showCoordinates = !this.renderer.options.showCoordinates;
        this.renderer.createBoard();
        this.renderer.render();
        this.renderer.attachEventListeners();
    }

    playMoveSequence(moves, delay = 1000) {
        let index = 0;
        const playNext = () => {
            if (index >= moves.length) return;
            const move = moves[index];
            const [fromRow, fromCol] = this.engine.algebraicToCoords(move.from);
            const [toRow, toCol] = this.engine.algebraicToCoords(move.to);
            if (this.engine.makeMove(fromRow, fromCol, toRow, toCol)) {
                this.renderer.setLastMove([fromRow, fromCol], [toRow, toCol]);
                index++;
                if (index < moves.length) {
                    setTimeout(playNext, delay);
                }
            }
        };
        playNext();
    }
}
