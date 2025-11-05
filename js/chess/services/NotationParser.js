// Parser de Notación Estándar de Ajedrez
class NotationParser {
    /**
     * Parsear notación UCI a objeto Move
     * @param {string} uci - Notación UCI (ej: 'e2e4', 'e7e8q')
     * @returns {Move|null} - Objeto Move o null si es inválido
     */
    static parseUCI(uci) {
        if (!uci || typeof uci !== 'string') return null;
        
        const clean = uci.trim().toLowerCase();
        
        // Formato básico: e2e4 (4 caracteres)
        if (clean.length >= 4 && /^[a-h][1-8][a-h][1-8]/.test(clean)) {
            const from = clean.substring(0, 2);
            const to = clean.substring(2, 4);
            const promotion = clean.length > 4 ? clean.substring(4) : null;
            
            return new Move(from, to, { promotion });
        }
        
        return null;
    }

    /**
     * Convertir Move a notación UCI
     * @param {Move} move - Objeto Move
     * @returns {string} - Notación UCI
     */
    static toUCI(move) {
        if (!move || !move.from || !move.to) return '';
        return move.toUCI();
    }

    /**
     * Parsear notación algebraica corta (SAN simplificado)
     * @param {string} notation - Notación (ej: 'e4', 'Nf3', 'Qxd5')
     * @param {BoardModel} boardModel - Modelo del tablero para contexto
     * @returns {Move|null} - Objeto Move o null
     */
    static parseAlgebraic(notation, boardModel = null) {
        if (!notation || typeof notation !== 'string') return null;
        
        const clean = notation.trim().replace(/[+#!?]/g, '');
        
        // Movimiento simple de peón: e4
        if (/^[a-h][1-8]$/.test(clean)) {
            // Necesita contexto del tablero para determinar origen
            // Por ahora retornamos null y se manejará en el contexto
            return null;
        }

        // Movimiento de pieza mayor: Nf3
        const pieceMoveMatch = clean.match(/^([KQRBN])([a-h]?[1-8]?)([a-h][1-8])$/);
        if (pieceMoveMatch) {
            const [, pieceSymbol, disambiguation, to] = pieceMoveMatch;
            // Sin contexto completo del tablero, retornamos estructura parcial
            return null; // Requiere más contexto
        }

        // Captura: Qxd5
        const captureMatch = clean.match(/^([KQRBN]?)([a-h]?[1-8]?)x([a-h][1-8])$/);
        if (captureMatch) {
            const [, pieceSymbol, disambiguation, to] = captureMatch;
            return null; // Requiere contexto
        }

        return null;
    }

    /**
     * Convertir Move a notación algebraica
     * @param {Move} move - Objeto Move
     * @param {BoardModel} boardModel - Modelo del tablero para contexto
     * @returns {string} - Notación algebraica
     */
    static toAlgebraic(move, boardModel = null) {
        if (!move) return '';
        return move.toAlgebraic(boardModel ? boardModel.getBoardState() : null);
    }

    /**
     * Normalizar notación (convertir cualquier formato a UCI)
     * @param {string} notation - Notación en cualquier formato
     * @param {BoardModel} boardModel - Modelo del tablero para contexto
     * @returns {string|null} - Notación UCI o null
     */
    static normalizeToUCI(notation, boardModel = null) {
        if (!notation) return null;

        // Intentar parsear como UCI primero
        const uciMove = this.parseUCI(notation);
        if (uciMove) {
            return uciMove.toUCI();
        }

        // Intentar parsear como algebraica
        const algMove = this.parseAlgebraic(notation, boardModel);
        if (algMove) {
            return algMove.toUCI();
        }

        return null;
    }

    /**
     * Validar formato de notación UCI
     * @param {string} uci - Notación UCI
     * @returns {boolean}
     */
    static isValidUCI(uci) {
        if (!uci || typeof uci !== 'string') return false;
        const clean = uci.trim().toLowerCase();
        
        // Formato básico: e2e4 (4 caracteres) o con promoción: e7e8q (5 caracteres)
        return /^[a-h][1-8][a-h][1-8][qrnb]?$/.test(clean);
    }

    /**
     * Validar formato de notación algebraica básica
     * @param {string} notation - Notación algebraica
     * @returns {boolean}
     */
    static isValidAlgebraic(notation) {
        if (!notation || typeof notation !== 'string') return false;
        const clean = notation.trim().replace(/[+#!?]/g, '');
        
        // Patrones básicos válidos
        return /^([KQRBN]?[a-h]?[1-8]?)?x?[a-h][1-8](=[QRBN])?$/.test(clean) ||
               /^[a-h][1-8]$/.test(clean);
    }

    /**
     * Comparar dos movimientos (normalizando ambos a UCI)
     * @param {string|Move} move1 - Primer movimiento
     * @param {string|Move} move2 - Segundo movimiento
     * @param {BoardModel} boardModel - Modelo del tablero
     * @returns {boolean} - true si son iguales
     */
    static compareMoves(move1, move2, boardModel = null) {
        const uci1 = move1 instanceof Move ? move1.toUCI() : this.normalizeToUCI(move1, boardModel);
        const uci2 = move2 instanceof Move ? move2.toUCI() : this.normalizeToUCI(move2, boardModel);
        
        if (!uci1 || !uci2) return false;
        return uci1.toLowerCase() === uci2.toLowerCase();
    }
}

