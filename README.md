# Sitio Web para Aprender Ajedrez

Sitio web educativo para aprender ajedrez desde cero con tableros interactivos y ejercicios guiados.

## Estructura del Proyecto

```
├── index.html              # Página principal
├── tablero.html            # El Tablero y notación algebraica
├── movimiento-piezas.html  # Movimiento de todas las piezas
├── movimientos-especiales.html # Enroque, En Passant, Promoción
├── objetivo-juego.html      # Jaque, Jaque Mate, Ahogado
├── principios-apertura.html # Principios de apertura
├── valor-piezas.html       # Valor relativo de las piezas
├── tactica-basica.html     # Táctica básica
├── mates-cortos.html       # Mates cortos
├── mate-legal.html         # Mate de Legal
├── aperturas-comunes.html  # Aperturas comunes
├── juego-medio.html        # Estrategia de juego medio
├── finales-basicos.html    # Finales básicos
├── sugerencias.html        # Formulario de sugerencias
├── css/
│   └── styles.css          # Estilos globales
└── js/
    ├── navigation.js       # Navegación entre páginas
    ├── chess-engine.js     # Motor de ajedrez
    ├── chessboard.js       # Renderizado del tablero
    ├── exercises.js        # Sistema de ejercicios
    └── form-handler.js     # Manejo del formulario
```

## Características

- **Tablero Interactivo**: Tablero de ajedrez funcional con drag & drop
- **Motor de Ajedrez Completo**: Validación de movimientos, detección de jaque/mate
- **Ejercicios Guiados**: Ejercicios interactivos para cada tema
- **Navegación Intuitiva**: Menú de navegación persistente
- **Diseño Responsive**: Funciona en móvil, tablet y desktop
- **Integración Chatbase**: Chatbot integrado en todas las páginas
- **Formulario de Sugerencias**: Formulario conectado con Formspree

## Uso

1. Abre `index.html` en tu navegador
2. Navega por los diferentes temas usando el menú superior
3. Interactúa con los tableros para aprender y practicar
4. Completa los ejercicios en cada sección

## Tecnologías

- HTML5
- CSS3
- JavaScript (Vanilla)
- Formspree (formularios)
- Chatbase (chatbot)

## Notas

- El sitio funciona completamente en el cliente (sin servidor necesario)
- Los ejercicios se validan localmente
- El formulario de sugerencias requiere conexión a internet para enviar

