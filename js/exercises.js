// Sistema de Ejercicios Refactorizado - Usa nueva arquitectura MVC
class ExerciseManager {
    constructor(boardId = null) {
        this.boards = new Map(); // Map<containerId, ChessBoard>
        this.exerciseBoardId = boardId; // ID del tablero principal del ejercicio
        this.currentExercise = null;
        this.exerciseIndex = 0;
        this.attempts = 0;
        this.hintsShown = 0;
        this.exercises = {};
        this.showSuggestions = false;
        this.suggestedMoves = [];
        this.completedExercises = this.getCompletedExercises();
    }

    // Registrar un tablero para ejercicios
    registerBoard(containerId, board) {
        if (!board || !containerId) {
            console.error('registerBoard requiere containerId y board');
            return;
        }

        this.boards.set(containerId, board);
        
        // Si no hay tablero principal, usar este
        if (!this.exerciseBoardId) {
            this.exerciseBoardId = containerId;
        }

        // Configurar listeners solo para este tablero
        const namespace = `board:${containerId}:`;
        
        board.on(`${namespace}move-completed`, (move) => {
            if (containerId === this.exerciseBoardId) {
                this.handleMove(move);
            }
        });
        
        board.on(`${namespace}empty-square-clicked`, (square, eventData) => {
            if (containerId === this.exerciseBoardId) {
                this.handleEmptySquareClick(square, eventData);
            }
        });

        board.on(`${namespace}square-clicked`, (square, eventData) => {
            if (containerId === this.exerciseBoardId) {
                this.handleSquareClick(square, eventData);
            }
        });
    }

    // Establecer qué tablero es el principal para el ejercicio
    setExerciseBoard(containerId) {
        this.exerciseBoardId = containerId;
    }

    // Obtener tablero principal
    getExerciseBoard() {
        return this.boards.get(this.exerciseBoardId);
    }

    // Cargar ejercicios desde objeto global
    registerExercises(exercises) {
        this.exercises = exercises || {};
    }

    // Cargar un ejercicio específico
    loadExercise(exerciseId) {
        if (!this.exercises[exerciseId]) {
            console.error(`Ejercicio ${exerciseId} no encontrado`);
            return false;
        }

        const exercise = this.exercises[exerciseId];
        this.currentExercise = { ...exercise, id: exerciseId };
        this.exerciseIndex = 0;
        this.attempts = 0;
        this.hintsShown = 0;
        this.showSuggestions = false;
        this.suggestedMoves = [];

        const board = this.getExerciseBoard();
        if (!board) {
            console.error('No hay tablero registrado para ejercicios');
            return false;
        }

        // Cargar posición inicial exacta desde FEN
        if (exercise.fen) {
            board.loadFEN(exercise.fen);
        } else if (exercise.initialPosition) {
            board.loadCustomPosition(exercise.initialPosition);
        } else {
            board.loadInitialPosition();
        }

        // Calcular movimientos sugeridos
        this.calculateSuggestedMoves();

        // Actualizar sugerencias visuales
        this.updateBoardSuggestions();

        // Renderizar
        board.render();

        // Cargar estado de completado
        this.loadCompletionStatus();

        // Mostrar objetivo
        this.showObjective();

        return true;
    }

    // Calcular movimientos sugeridos basados en la solución
    calculateSuggestedMoves() {
        if (!this.currentExercise) return;

        const solution = this.currentExercise.solution;
        if (!solution) return;

        this.suggestedMoves = [];

        if (Array.isArray(solution)) {
            // Si hay múltiples movimientos, sugerir el primero pendiente
            const nextMove = solution[this.exerciseIndex] || solution[0];
            if (nextMove) {
                const move = this.parseMove(nextMove);
                if (move) {
                    this.suggestedMoves.push(move);
                }
            }
        } else if (typeof solution === 'string') {
            // Movimiento único
            const move = this.parseMove(solution);
            if (move) {
                this.suggestedMoves.push(move);
            }
        }
    }

    // Parsear movimiento (soporta UCI y algebraica)
    parseMove(notation) {
        if (!notation || typeof notation !== 'string') return null;

        // Intentar parsear como UCI primero
        let move = NotationParser.parseUCI(notation);
        if (move) {
            return move;
        }

        // Si es formato simple como "e2e4" sin espacios
        const clean = notation.trim().replace(/[^a-h1-8]/g, '');
        if (clean.length >= 4) {
            move = NotationParser.parseUCI(clean.substring(0, 4));
            if (move && clean.length > 4) {
                move.promotion = clean.substring(4);
            }
            return move;
        }

        return null;
    }

    // Manejar movimiento completado
    handleMove(move) {
        if (!this.currentExercise) return;

        this.attempts++;

        const expectedMoves = this.currentExercise.solution;
        const moveUCI = move.toUCI();

        // Verificar si el movimiento actual coincide con el esperado
        let isCorrect = false;
        let nextStep = null;

        if (Array.isArray(expectedMoves)) {
            // Ejercicio con múltiples pasos
            if (this.exerciseIndex < expectedMoves.length) {
                const expectedMove = this.parseMove(expectedMoves[this.exerciseIndex]);
                const expectedUCI = expectedMove ? expectedMove.toUCI() : expectedMoves[this.exerciseIndex];
                
                // Comparar usando notación normalizada
                if (NotationParser.compareMoves(moveUCI, expectedUCI)) {
                    isCorrect = true;
                    this.exerciseIndex++;
                    
                    // Recalcular sugerencias para el siguiente paso
                    this.calculateSuggestedMoves();
                    this.updateBoardSuggestions();

                    // Verificar si quedan más pasos
                    if (this.exerciseIndex < expectedMoves.length) {
                        nextStep = expectedMoves[this.exerciseIndex];
                    }
                }
            }
        } else if (typeof expectedMoves === 'string') {
            // Ejercicio con un solo movimiento
            const expectedMove = this.parseMove(expectedMoves);
            const expectedUCI = expectedMove ? expectedMove.toUCI() : expectedMoves;
            
            if (NotationParser.compareMoves(moveUCI, expectedUCI)) {
                isCorrect = true;
            }
        }

        // Mostrar feedback
        this.showFeedback(isCorrect, nextStep);

        // Si el ejercicio está completo
        if (isCorrect && this.isExerciseComplete()) {
            this.completeExercise();
        }

        // Mostrar sugerencia después de 2 intentos fallidos
        if (!isCorrect && this.attempts >= 2 && !this.showSuggestions) {
            this.showSuggestions = true;
            this.updateBoardSuggestions();
            this.showSuggestionButton();
        }
    }

    // Manejar click en casilla vacía
    handleEmptySquareClick(square, eventData) {
        if (!this.currentExercise) return;

        // Algunos ejercicios pueden requerir clicks en casillas vacías
        // Por ejemplo, ejercicios de aperturas donde se pregunta "¿qué casilla ocuparías?"
        const exercise = this.currentExercise;
        
        if (exercise.expectsEmptySquareClick && exercise.expectedSquare) {
            if (square.toLowerCase() === exercise.expectedSquare.toLowerCase()) {
                this.showFeedback(true);
                this.completeExercise();
            } else {
                this.showFeedback(false, `Intenta con otra casilla. La respuesta es ${exercise.expectedSquare}`);
            }
        }
    }

    // Manejar click en casilla
    handleSquareClick(square, eventData) {
        // Puede ser usado para ejercicios interactivos específicos
        if (this.currentExercise && this.currentExercise.onSquareClick) {
            this.currentExercise.onSquareClick(square, eventData);
        }
    }

    // Verificar si el ejercicio está completo
    isExerciseComplete() {
        if (!this.currentExercise) return false;

        const solution = this.currentExercise.solution;
        if (Array.isArray(solution)) {
            return this.exerciseIndex >= solution.length;
        }
        return this.exerciseIndex > 0;
    }

    // Completar ejercicio
    completeExercise() {
        if (!this.currentExercise) return;

        const exerciseId = this.currentExercise.id;
        this.markExerciseCompleted(exerciseId);
        this.showFeedback(true, '¡Ejercicio completado!');
    }

    // Mostrar feedback
    showFeedback(isCorrect, message = null) {
        const feedbackEl = document.getElementById('exercise-feedback');
        if (!feedbackEl) return;

        feedbackEl.classList.add('show');
        feedbackEl.classList.remove('success', 'error', 'info');

        if (isCorrect) {
            feedbackEl.classList.add('success');
            feedbackEl.textContent = message || '¡Correcto!';
        } else {
            feedbackEl.classList.add('error');
            feedbackEl.textContent = message || 'Incorrecto. Intenta de nuevo.';
        }

        // Mostrar explicación si está disponible
        if (isCorrect && this.currentExercise.explanation) {
            const explanationEl = document.getElementById('exercise-explanation');
            if (explanationEl) {
                explanationEl.style.display = 'block';
                explanationEl.textContent = this.currentExercise.explanation;
            }
        }
    }

    // Mostrar objetivo
    showObjective() {
        const objectiveEl = document.querySelector('.exercise-objective');
        if (objectiveEl && this.currentExercise) {
            let objectiveText = `<strong>Objetivo:</strong> ${this.currentExercise.objective || 'Completa el ejercicio'}`;
            
            // Añadir indicador de completado si ya está completado
            if (this.isExerciseCompleted(this.currentExercise.id)) {
                objectiveText += '<span class="completion-indicator"> ✓ Completado</span>';
                objectiveEl.classList.add('completed');
            } else {
                objectiveEl.classList.remove('completed');
            }
            
            objectiveEl.innerHTML = objectiveText;
        }
    }

    // Actualizar sugerencias visuales en el tablero
    updateBoardSuggestions() {
        const board = this.getExerciseBoard();
        if (!board) return;

        if (this.showSuggestions && this.suggestedMoves.length > 0) {
            const suggestion = this.suggestedMoves[0];
            board.showSuggestions(suggestion);
        } else {
            board.clearSuggestions();
        }
    }

    // Mostrar sugerencias
    showSuggestions() {
        this.showSuggestions = true;
        this.updateBoardSuggestions();
    }

    // Ocultar sugerencias
    hideSuggestions() {
        this.showSuggestions = false;
        this.updateBoardSuggestions();
    }

    // Toggle de sugerencias
    toggleSuggestions() {
        this.showSuggestions = !this.showSuggestions;
        this.updateBoardSuggestions();
        return this.showSuggestions;
    }

    // Mostrar botón de sugerencia
    showSuggestionButton() {
        const btn = document.getElementById('show-suggestion-btn');
        if (btn) {
            btn.style.display = 'inline-block';
        }
    }

    // Reiniciar ejercicio
    resetExercise() {
        if (!this.currentExercise) return;

        this.loadExercise(this.currentExercise.id);
    }

    // Gestión de ejercicios completados
    markExerciseCompleted(exerciseId) {
        const completed = this.getCompletedExercises();
        if (!completed.includes(exerciseId)) {
            completed.push(exerciseId);
            localStorage.setItem('chess_completed_exercises', JSON.stringify(completed));
            this.completedExercises = completed;
            this.updateExerciseCompletionUI(exerciseId, true);
        }
    }

    getCompletedExercises() {
        try {
            const stored = localStorage.getItem('chess_completed_exercises');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    isExerciseCompleted(exerciseId) {
        return this.completedExercises.includes(exerciseId);
    }

    updateExerciseCompletionUI(exerciseId, isCompleted) {
        const exercisePanels = document.querySelectorAll('.exercise-panel');
        exercisePanels.forEach(panel => {
            const objective = panel.querySelector('.exercise-objective');
            if (objective) {
                let indicator = objective.querySelector('.completion-indicator');
                if (isCompleted && !indicator) {
                    indicator = document.createElement('span');
                    indicator.className = 'completion-indicator';
                    indicator.innerHTML = ' ✓ Completado';
                    indicator.setAttribute('aria-label', 'Ejercicio completado');
                    objective.appendChild(indicator);
                } else if (!isCompleted && indicator) {
                    indicator.remove();
                }
            }
        });

        const currentObjective = document.querySelector('.exercise-objective');
        if (currentObjective && this.currentExercise && this.currentExercise.id === exerciseId) {
            if (isCompleted) {
                currentObjective.classList.add('completed');
            } else {
                currentObjective.classList.remove('completed');
            }
        }
    }

    loadCompletionStatus() {
        if (this.currentExercise) {
            const isCompleted = this.isExerciseCompleted(this.currentExercise.id);
            this.updateExerciseCompletionUI(this.currentExercise.id, isCompleted);
        }
    }
}
