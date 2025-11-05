// Cargador de módulos - Carga todas las dependencias en orden
// Este archivo debe cargarse antes de usar ChessBoard

// Cargar modelos
if (typeof Piece === 'undefined') {
    throw new Error('Piece.js debe cargarse antes de ChessBoard.js');
}
if (typeof Move === 'undefined') {
    throw new Error('Move.js debe cargarse antes de ChessBoard.js');
}
if (typeof BoardModel === 'undefined') {
    throw new Error('BoardModel.js debe cargarse antes de ChessBoard.js');
}

// Cargar interfaces
if (typeof IBoardProvider === 'undefined') {
    throw new Error('IBoardProvider.js debe cargarse antes de ChessBoard.js');
}
if (typeof IMoveHandler === 'undefined') {
    throw new Error('IMoveHandler.js debe cargarse antes de ChessBoard.js');
}
if (typeof BoardConfig === 'undefined') {
    throw new Error('IBoardConfig.js debe cargarse antes de ChessBoard.js');
}

// Cargar servicios
if (typeof ChessEngine === 'undefined') {
    throw new Error('ChessEngine.js debe cargarse antes de ChessBoard.js');
}
if (typeof MoveValidator === 'undefined') {
    throw new Error('MoveValidator.js debe cargarse antes de ChessBoard.js');
}
if (typeof NotationParser === 'undefined') {
    throw new Error('NotationParser.js debe cargarse antes de ChessBoard.js');
}

// Cargar vistas
if (typeof SquareView === 'undefined') {
    throw new Error('SquareView.js debe cargarse antes de ChessBoard.js');
}
if (typeof BoardView === 'undefined') {
    throw new Error('BoardView.js debe cargarse antes de ChessBoard.js');
}

// Cargar controlador
if (typeof BoardController === 'undefined') {
    throw new Error('BoardController.js debe cargarse antes de ChessBoard.js');
}

// Todo listo - ChessBoard está disponible

