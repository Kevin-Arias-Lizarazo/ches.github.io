# Sistema de Tablero de Ajedrez MVC

Este directorio contiene un sistema completo de tablero de ajedrez implementado con arquitectura MVC (Modelo-Vista-Controlador). El sistema es totalmente parametrizable y flexible para diferentes casos de uso.

## Características

- **Arquitectura MVC**: Separación clara entre Modelo, Vista y Controlador
- **Instancias múltiples**: Soporte para varios tableros en la misma página
- **Identificación única de fichas**: Cada ficha tiene un ID único independiente de su posición o color
- **Sistema de eventos**: Listeners para casillas, fichas y movimientos
- **Tablero parametrizable**:
  - Tamaño configurable del tablero
  - Color inicial de casillas (negro o blanco)
  - Posición inicial personalizable (FEN, objeto, o posición estándar)
- **Renderizado HTML**: Método `renderAsHTML()` que devuelve el tablero como HTML en texto plano
- **Callback de actualización**: Listener que se ejecuta cuando la interfaz necesita actualizarse

## Estructura de Archivos

```
js/
├── chess/
│   ├── ChessBoard.js              # Clase principal (MVC + integración)
│   ├── models/
│   │   ├── BoardModel.js          # Modelo del tablero y estado
│   │   ├── Move.js                # Modelo de movimientos
│   │   └── Piece.js               # Modelo de fichas (con ID único)
│   ├── views/
│   │   ├── BoardView.js           # Vista del tablero completo
│   │   ├── SquareView.js          # Vista de casilla individual
│   │   └── PieceView.js           # Vista de ficha individual
│   ├── controllers/
│   │   └── BoardController.js     # Controlador de interacciones
│   ├── services/
│   │   ├── ChessEngine.js         # Motor de ajedrez
│   │   ├── MoveValidator.js       # Validador de movimientos
│   │   └── NotationParser.js      # Parser de notación
│   └── interfaces/
│       ├── IBoardConfig.js        # Configuración del tablero
│       ├── IBoardProvider.js      # Interface de proveedor
│       └── IMoveHandler.js        # Interface de manejador de movimientos
```

## Instalación y Uso Básico

### 1. Importar los Scripts

Asegúrate de incluir los archivos JavaScript en el siguiente orden:

```html
<!-- Modelos -->
<script src="js/chess/models/Piece.js"></script>
<script src="js/chess/models/Move.js"></script>
<script src="js/chess/models/BoardModel.js"></script>

<!-- Vistas -->
<script src="js/chess/views/PieceView.js"></script>
<script src="js/chess/views/SquareView.js"></script>
<script src="js/chess/views/BoardView.js"></script>

<!-- Servicios -->
<script src="js/chess/services/ChessEngine.js"></script>
<script src="js/chess/services/MoveValidator.js"></script>
<script src="js/chess/services/NotationParser.js"></script>

<!-- Interfaces -->
<script src="js/chess/interfaces/IBoardConfig.js"></script>
<script src="js/chess/interfaces/IBoardProvider.js"></script>
<script src="js/chess/interfaces/IMoveHandler.js"></script>

<!-- Controlador -->
<script src="js/chess/controllers/BoardController.js"></script>

<!-- Clase principal -->
<script src="js/chess/ChessBoard.js"></script>

<!-- Estilos CSS -->
<link rel="stylesheet" href="css/styles.css">
```

### 2. HTML Básico

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tablero de Ajedrez</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- Contenedor del tablero -->
    <div id="chessboard"></div>

    <!-- Scripts -->
    <!-- (Incluir todos los scripts en el orden mencionado arriba) -->

    <script>
        // Crear instancia del tablero
        const board = new ChessBoard('chessboard', {
            initialPosition: 'start',
            boardSize: 8,
            squareColorStart: 'dark',
            showCoordinates: true
        });
    </script>
</body>
</html>
```

## Opciones de Configuración

### Parámetros de Configuración

```javascript
const config = {
    // Posición inicial del tablero
    // Opciones: 'start', FEN string, o objeto personalizado
    initialPosition: 'start',

    // Tamaño del tablero (número de casillas por lado)
    // Por defecto: 8 (tablero estándar de ajedrez)
    boardSize: 8,

    // Color inicial de las casillas
    // Opciones: 'dark' o 'light'
    // Determina cómo se intercalan los colores
    squareColorStart: 'dark',

    // Mostrar coordenadas (a-h, 1-8)
    showCoordinates: true,

    // Orientación del tablero
    // Opciones: 'white' (fila 1 abajo) o 'black' (fila 8 abajo)
    orientation: 'white',

    // Permitir movimientos
    allowMoves: true,

    // Resaltar movimientos válidos
    highlightValidMoves: true,

    // Callback ejecutado cuando la interfaz necesita actualizarse
    onUpdateRequired: (board) => {
        console.log('Tablero actualizado:', board.boardId);
    },

    // Motor de ajedrez personalizado
    moveHandler: null,

    // Proveedor de estado del tablero
    boardProvider: null
};

const board = new ChessBoard('chessboard', config);
```

## Estructura de una Ficha (Piece)

Cada ficha tiene:

```javascript
{
    type: 'pawn',           // 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king'
    color: 'white',         // 'white' o 'black'
    square: 'e4',           // Posición actual (notación algebraica)
    id: 'white-pawn-xxx',   // ID único generado automáticamente
    getName(): 'white-pawn' // Nombre de la ficha (color-tipo)
}
```

### Métodos de Piece

```javascript
piece.getSymbol()          // Retorna símbolo Unicode (♙, ♟, etc.)
piece.getPieceLabel()      // Retorna nombre en español (Peón, Rey, etc.)
piece.getName()            // Retorna nombre completo (white-pawn, black-king, etc.)
piece.getValue()           // Retorna valor de la pieza (1 para peón, 5 para torre, etc.)
piece.clone()              // Crea copia de la pieza
piece.equals(other)        // Compara por tipo, color e ID
piece.equalsTypeAndColor() // Compara solo tipo y color
```

## Sistema de Eventos

### Eventos de Casillas

```javascript
board.on('square-clicked', (square, eventData) => {
    console.log('Casilla clickeada:', square);
    console.log('¿Vacía?:', eventData.isEmpty);
    console.log('Pieza:', eventData.piece);
});

board.on('empty-square-clicked', (square, eventData) => {
    console.log('Casilla vacía clickeada:', square);
});
```

### Eventos de Fichas

```javascript
board.on('piece-clicked', (pieceData) => {
    console.log('Ficha clickeada:');
    console.log('ID:', pieceData.pieceId);
    console.log('Nombre:', pieceData.pieceName);      // 'white-pawn'
    console.log('Tipo:', pieceData.type);             // 'pawn'
    console.log('Color:', pieceData.color);           // 'white'
    console.log('Casilla:', pieceData.square);        // 'e4'
});
```

### Eventos de Movimientos

```javascript
board.on('move-attempted', (move) => {
    console.log('Movimiento intentado:', move.from, '->', move.to);
});

board.on('move-completed', (move) => {
    console.log('Movimiento completado:', move.from, '->', move.to);
});

board.on('invalid-move', (move, reason) => {
    console.log('Movimiento inválido:', reason);
});
```

### Agregar y Remover Listeners

```javascript
// Agregar listener
const handleSquareClick = (square, eventData) => {
    console.log('Casilla:', square);
};

board.on('square-clicked', handleSquareClick);

// Remover listener
board.off('square-clicked', handleSquareClick);
```

## Funciones Principales

### Renderizado

```javascript
// Renderizar cambios en el DOM
board.render();

// Obtener HTML como texto plano (sin inyectar en el DOM)
const html = board.renderAsHTML();
console.log(html); // Devuelve string HTML

// Obtener HTML interno del grid
const gridHtml = board.getHTML();
```

### Gestión de Posiciones

```javascript
// Obtener estado actual del tablero
const state = board.getState();

// Obtener pieza en una casilla
const piece = board.getPiece('e4');

// Obtener movimientos válidos desde una casilla
const validMoves = board.getValidMoves('e2');
```

### Sugerencias

```javascript
// Mostrar casillas sugeridas
board.showSuggestions({
    from: 'e2',
    to: 'e4'
});

// Limpiar sugerencias
board.clearSuggestions();
```

## Múltiples Instancias

Puedes tener varios tableros en la misma página:

```html
<div id="board1" style="width: 400px;"></div>
<div id="board2" style="width: 400px;"></div>

<script>
    const board1 = new ChessBoard('board1', {
        initialPosition: 'start',
        squareColorStart: 'dark'
    });

    const board2 = new ChessBoard('board2', {
        initialPosition: '8/8/8/8/8/8/8/8 w - - 0 1', // Tablero vacío
        squareColorStart: 'light'
    });

    // Obtener instancia por ID
    const instance = ChessBoard.getInstance('board1');

    // Obtener todas las instancias
    const allInstances = ChessBoard.getAllInstances();
</script>
```

## Callback de Actualización

El callback `onUpdateRequired` se ejecuta cuando la interfaz necesita actualizarse:

```javascript
const board = new ChessBoard('chessboard', {
    initialPosition: 'start',
    onUpdateRequired: (boardInstance) => {
        // Este callback se ejecuta cuando se necesita actualizar la UI
        console.log('ID único del tablero:', boardInstance.boardId);
        console.log('Contenedor:', boardInstance.containerId);

        // Puedes usar esto para sincronizar con sistemas externos
        // o ejecutar lógica adicional
        updateExternalUI(boardInstance.boardId);
    }
});
```

## Ejemplo Completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Tablero de Ajedrez Interactivo</title>
    <link rel="stylesheet" href="css/styles.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .board-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        #chessboard {
            max-width: 600px;
            margin: 0 auto;
        }
        .info {
            margin-top: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 4px;
            border-left: 4px solid #3498db;
        }
        .info h3 {
            margin-top: 0;
        }
        .info p {
            margin: 5px 0;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="board-container">
        <h1>Tablero de Ajedrez</h1>
        <div id="chessboard"></div>
        <div class="info">
            <h3>Información del Tablero</h3>
            <p>ID del Tablero: <strong id="boardId">-</strong></p>
            <p>Última Acción: <strong id="lastAction">-</strong></p>
            <p>Ficha Seleccionada: <strong id="selectedPiece">-</strong></p>
        </div>
    </div>

    <!-- Scripts (incluir en orden) -->
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
        const board = new ChessBoard('chessboard', {
            initialPosition: 'start',
            boardSize: 8,
            squareColorStart: 'dark',
            showCoordinates: true,
            onUpdateRequired: (boardInstance) => {
                document.getElementById('boardId').textContent = boardInstance.boardId;
            }
        });

        board.on('square-clicked', (square, eventData) => {
            document.getElementById('lastAction').textContent =
                `Casilla ${square} clickeada (${eventData.isEmpty ? 'vacía' : 'con pieza'})`;
        });

        board.on('piece-clicked', (pieceData) => {
            document.getElementById('selectedPiece').textContent =
                `${pieceData.pieceName} en ${pieceData.square} (ID: ${pieceData.pieceId.substring(0, 10)}...)`;
        });

        board.on('move-completed', (move) => {
            document.getElementById('lastAction').textContent =
                `Movimiento: ${move.from} → ${move.to}`;
        });
    </script>
</body>
</html>
```

## Notas Importantes

1. **IDs Únicos de Fichas**: Cada ficha genera automáticamente un ID único al crearse, permitiendo identificar fichas específicas incluso si hay varias del mismo tipo y color.

2. **Nombres de Fichas**: El nombre de una ficha sigue el formato `{color}-{type}` (ej: `white-pawn`, `black-queen`). Este nombre es diferente del ID y es útil para categorizar fichas.

3. **El sistema NO inyecta HTML directamente**: Los scripts solo crean el HTML necesario cuando se inicializa el tablero. Puedes obtener el HTML como texto con `renderAsHTML()` sin que se inyecte en el DOM.

4. **Callback de Actualización**: Se ejecuta solo al crear el tablero. Para escuchar cambios continuos, usa el sistema de eventos con `board.on()`.

5. **Tamaño Parametrizable**: Aunque está pensado para 8x8, puedes crear tableros de otros tamaños modificando `boardSize`. Las letras y números se asignan automáticamente.

## Soporte y Debugging

```javascript
// Ver todas las instancias de tableros activas
console.log(ChessBoard.getAllInstances());

// Obtener instancia específica
const myBoard = ChessBoard.getInstance('chessboard');

// Ver estado completo del tablero
console.log(myBoard.getState());

// Ver pieza específica
console.log(myBoard.getPiece('e4'));
```

## Licencia

Uso libre para propósitos educativos y comerciales.
