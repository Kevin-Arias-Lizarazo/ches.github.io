// Cargador maestro de dependencias del sistema de ajedrez
// Este archivo carga todos los módulos en el orden correcto

(function() {
    'use strict';

    // Función para cargar scripts en orden
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = function() {
            console.error(`Error cargando script: ${src}`);
            if (callback) callback();
        };
        document.head.appendChild(script);
    }

    // Función para cargar múltiples scripts secuencialmente
    function loadScripts(scripts, callback) {
        if (scripts.length === 0) {
            if (callback) callback();
            return;
        }

        const script = scripts.shift();
        loadScript(script, function() {
            loadScripts(scripts, callback);
        });
    }

    // Verificar si ya están cargados (evitar cargar múltiples veces)
    if (window.ChessBoard && window.ChessBoard.instances) {
        console.log('Sistema de ajedrez ya cargado');
        return;
    }

    // Lista de scripts a cargar en orden
    const scripts = [
        // Modelos
        'js/chess/models/Piece.js',
        'js/chess/models/Move.js',
        'js/chess/models/BoardModel.js',
        
        // Interfaces
        'js/chess/interfaces/IBoardProvider.js',
        'js/chess/interfaces/IMoveHandler.js',
        'js/chess/interfaces/IBoardConfig.js',
        
        // Servicios
        'js/chess/services/NotationParser.js',
        'js/chess/services/ChessEngine.js',
        'js/chess/services/MoveValidator.js',
        
        // Vistas
        'js/chess/views/SquareView.js',
        'js/chess/views/BoardView.js',
        
        // Controlador
        'js/chess/controllers/BoardController.js',
        
        // Clase principal
        'js/chess/ChessBoard.js',
        
        // Sistema de ejercicios (opcional, se carga después)
        'js/exercises.js'
    ];

    // Cargar scripts
    loadScripts(scripts, function() {
        console.log('Sistema de ajedrez cargado correctamente');
        
        // Disparar evento personalizado cuando todo esté listo
        const event = new CustomEvent('chessSystemLoaded');
        window.dispatchEvent(event);
    });
})();

