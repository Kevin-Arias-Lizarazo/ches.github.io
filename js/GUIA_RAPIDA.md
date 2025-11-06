# Guía Rápida - Sistema de Tablero de Ajedrez

## Inicio Rápido (5 minutos)

### 1. HTML Básico

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div id="board"></div>

    <!-- Scripts en orden -->
    <script src="js/chess/models/Piece.js"></script>
    <script src="js/chess/models/Move.js"></script>
    <script src="js/chess/models/BoardModel.js"></script>
    <script src="js/chess/views/PieceView.js"></script>
    <script src="js/chess/views/SquareView.js"></script>
    <script src="js/chess/views/BoardView.js"></script>
    <script src="js/chess/services/ChessEngine.js"></script>
    <script src="js/chess/services/MoveValidator.js"></script>
    <script src="js/chess/services/NotationParser.js"></script>
    <script src="js/chess/interfaces/IBoardConfig.js"></script>
    <script src="js/chess/interfaces/IBoardProvider.js"></script>
    <script src="js/chess/interfaces/IMoveHandler.js"></script>
    <script src="js/chess/controllers/BoardController.js"></script>
    <script src="js/chess/ChessBoard.js"></script>

    <script>
        const board = new ChessBoard('board', {
            initialPosition: 'start'
        });
    </script>
</body>
</html>
```

### 2. Crear Tablero

```javascript
const board = new ChessBoard('id-contenedor', {
    initialPosition: 'start',    // 'start', FEN, u objeto
    boardSize: 8,               // 1-8
    squareColorStart: 'dark'    // 'dark' o 'light'
});
```

### 3. Escuchar Eventos

```javascript
// Casilla clickeada
board.on('square-clicked', (square, data) => {
    console.log(square, data.isEmpty, data.piece);
});

// Ficha clickeada
board.on('piece-clicked', (pieceData) => {
    console.log(pieceData.pieceName);
    console.log(pieceData.pieceId);
});

// Movimiento completado
board.on('move-completed', (move) => {
    console.log(move.from, '->', move.to);
});
```

### 4. Acceder a Fichas

```javascript
const piece = board.getPiece('e2');

// Propiedades
console.log(piece.type);           // 'pawn'
console.log(piece.color);          // 'white'
console.log(piece.id);             // ID único
console.log(piece.getName());      // 'white-pawn'
console.log(piece.getPieceLabel()); // 'Peón'
console.log(piece.getSymbol());    // '♙'
```

### 5. Exportar HTML

```javascript
const html = board.renderAsHTML();
console.log(html);
```

---

## Referencia de API

### ChessBoard - Métodos

| Método | Descripción |
|--------|-------------|
| `render()` | Renderizar cambios en DOM |
| `renderAsHTML()` | Obtener HTML como string |
| `getHTML()` | Obtener solo el grid interior |
| `on(event, fn)` | Agregar listener |
| `off(event, fn)` | Remover listener |
| `getState()` | Estado del tablero |
| `getPiece(square)` | Obtener pieza en casilla |
| `getValidMoves(square)` | Movimientos válidos |
| `showSuggestions(move)` | Resaltar movimiento |
| `clearSuggestions()` | Limpiar resalte |
| `destroy()` | Eliminar instancia |

### Piece - Propiedades y Métodos

| Propiedad/Método | Retorna |
|------------------|---------|
| `piece.type` | 'pawn', 'rook', etc. |
| `piece.color` | 'white', 'black' |
| `piece.square` | 'e4', 'a1', etc. |
| `piece.id` | ID único |
| `piece.getName()` | 'white-pawn' |
| `piece.getPieceLabel()` | 'Peón' |
| `piece.getSymbol()` | '♙' |
| `piece.getValue()` | 1-9 |
| `piece.clone()` | Copia |
| `piece.equals(other)` | boolean |

### Eventos Disponibles

| Evento | Datos |
|--------|-------|
| `square-clicked` | square, eventData |
| `empty-square-clicked` | square, eventData |
| `piece-clicked` | pieceData |
| `move-attempted` | move |
| `move-completed` | move |
| `invalid-move` | move, reason |

---

## Ejemplos Comunes

### Ejemplo 1: Tablero simple

```javascript
const board = new ChessBoard('game-board', {
    initialPosition: 'start'
});

board.on('move-completed', (move) => {
    console.log('Movimiento:', move.from, '->', move.to);
});
```

### Ejemplo 2: Tablero vacío para puzzle

```javascript
const board = new ChessBoard('puzzle-board', {
    initialPosition: '8/8/8/8/8/8/8/8 w - - 0 1'
});
```

### Ejemplo 3: Rastrear fichas específicas

```javascript
const board = new ChessBoard('board', { initialPosition: 'start' });
const piezasClickeadas = new Map();

board.on('piece-clicked', (pieceData) => {
    if (!piezasClickeadas.has(pieceData.pieceId)) {
        piezasClickeadas.set(pieceData.pieceId, {
            nombre: pieceData.pieceName,
            clicks: 0
        });
    }
    piezasClickeadas.get(pieceData.pieceId).clicks++;
});
```

### Ejemplo 4: Múltiples tableros

```javascript
const board1 = new ChessBoard('board1', { squareColorStart: 'dark' });
const board2 = new ChessBoard('board2', { squareColorStart: 'light' });
const board3 = new ChessBoard('board3', { boardSize: 4 });
```

### Ejemplo 5: Tablero con callback

```javascript
const board = new ChessBoard('board', {
    initialPosition: 'start',
    onUpdateRequired: (boardInstance) => {
        console.log('Tablero listo:', boardInstance.boardId);
        document.getElementById('status').textContent = 'Listo';
    }
});
```

### Ejemplo 6: Renderizar a archivo

```javascript
const board = new ChessBoard('board', { initialPosition: 'start' });

// Exportar HTML
const html = board.renderAsHTML();

// Guardar en string
const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head><link rel="stylesheet" href="css/styles.css"></head>
    <body>${html}</body>
    </html>
`;

console.log(fullHtml);
```

### Ejemplo 7: Resaltar casillas al mover

```javascript
const board = new ChessBoard('board', { initialPosition: 'start' });
let primerClick = null;

board.on('square-clicked', (square, data) => {
    if (!data.isEmpty && !primerClick) {
        primerClick = square;
        board.view.highlightSquare(square, 'selected');
    } else if (primerClick) {
        board.view.clearHighlights();
        primerClick = null;
    }
});
```

---

## Configuración Completa

```javascript
const config = {
    // Posición inicial
    initialPosition: 'start',                    // 'start', FEN, o {board: [...]}

    // Tablero
    boardSize: 8,                                 // 1-8
    squareColorStart: 'dark',                     // 'dark' o 'light'
    showCoordinates: true,                        // true o false
    orientation: 'white',                         // 'white' o 'black'

    // Comportamiento
    allowMoves: true,                             // true o false
    highlightValidMoves: true,                    // true o false

    // Callback de actualización
    onUpdateRequired: (boardInstance) => {
        // Se ejecuta al construir
    },

    // Servicios personalizados
    moveHandler: null,                            // Instancia personalizada
    boardProvider: null                           // Instancia personalizada
};

const board = new ChessBoard('board', config);
```

---

## Troubleshooting

### El tablero no aparece
- Verifica que el contenedor existe: `<div id="board"></div>`
- Verifica que los scripts están en orden correcto
- Abre la consola del navegador para ver errores

### Los eventos no se emiten
- Verifica que llamaste a `board.on()` después de crear el tablero
- Verifica que el callback está bien escrito

### Las fichas no tienen eventos
- Asegúrate de que `PieceView.js` está incluido
- Verifica que los eventos están siendo escuchados en el tablero

### El HTML no renderiza
- Usa `renderAsHTML()` en ChessBoard, no en BoardView
- El HTML devuelto es solo el grid, no la página completa

---

## Archivos Necesarios

**Mínimo requerido:**
- Todos los archivos en `js/chess/` en orden
- `css/styles.css`

**Recomendado:**
- Lee `js/README.md` para documentación completa
- Abre `ejemplo-integracion.html` para ver ejemplo funcional

---

## Atajos

**Crear tablero estándar:**
```javascript
new ChessBoard('id');
```

**Obtener pieza y su ID:**
```javascript
const p = board.getPiece('e4');
const id = p.id;
const nombre = p.getName();
```

**Ver estado completo:**
```javascript
console.log(board.getState());
```

**Limpiar tablero:**
```javascript
board.model.clear();
board.render();
```

---

¿Necesitas ayuda? Consulta `js/README.md` para documentación completa.
