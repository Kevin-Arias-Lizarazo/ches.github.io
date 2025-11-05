// Navegación entre páginas con menú hamburguesa
const navigation = {
    pages: [
        { id: 'index', name: 'Inicio', file: 'index.html' },
        { id: 'tablero', name: 'El Tablero', file: 'tablero.html' },
        { id: 'movimiento-piezas', name: 'Movimiento de Piezas', file: 'movimiento-piezas.html' },
        { id: 'movimientos-especiales', name: 'Movimientos Especiales', file: 'movimientos-especiales.html' },
        { id: 'objetivo-juego', name: 'Objetivo del Juego', file: 'objetivo-juego.html' },
        { id: 'principios-apertura', name: 'Principios de Apertura', file: 'principios-apertura.html' },
        { id: 'valor-piezas', name: 'Valor de Piezas', file: 'valor-piezas.html' },
        { id: 'tactica-basica', name: 'Táctica Básica', file: 'tactica-basica.html' },
        { id: 'mates-cortos', name: 'Mates Cortos', file: 'mates-cortos.html' },
        { id: 'mate-legal', name: 'Mate de Legal', file: 'mate-legal.html' },
        { id: 'aperturas-comunes', name: 'Aperturas Comunes', file: 'aperturas-comunes.html' },
        { id: 'juego-medio', name: 'Juego Medio', file: 'juego-medio.html' },
        { id: 'finales-basicos', name: 'Finales Básicos', file: 'finales-basicos.html' },
        { id: 'sugerencias', name: 'Sugerencias', file: 'sugerencias.html' }
    ],

    init() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        // Crear contenedor de navegación
        const navContainer = document.createElement('div');
        navContainer.className = 'nav-container';
        
        // Crear logo
        const logo = document.createElement('a');
        logo.href = 'index.html';
        logo.className = 'logo';
        logo.innerHTML = '<span>♟️</span> <span>Aprende Ajedrez</span>';
        logo.setAttribute('aria-label', 'Ir a página principal');
        
        // Crear botón hamburguesa
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-controls', 'main-menu');
        menuToggle.innerHTML = `
            <span class="hamburger-icon" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
            </span>
        `;
        
        // Crear menú
        const menu = document.createElement('ul');
        menu.id = 'main-menu';
        menu.setAttribute('role', 'menubar');

        // Agregar enlaces
        this.pages.forEach(page => {
            const li = document.createElement('li');
            li.setAttribute('role', 'none');
            const a = document.createElement('a');
            a.href = page.file;
            a.textContent = page.name;
            a.setAttribute('role', 'menuitem');
            
            // Marcar página actual
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            if (currentPage === page.file) {
                a.setAttribute('aria-current', 'page');
            }
            
            // Cerrar menú al hacer clic en móvil
            a.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.toggleMenu(false);
                }
            });
            
            li.appendChild(a);
            menu.appendChild(li);
        });

        // Toggle del menú
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            this.toggleMenu(!isExpanded);
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !nav.contains(e.target) && 
                menuToggle.getAttribute('aria-expanded') === 'true') {
                this.toggleMenu(false);
            }
        });

        // Cerrar menú al presionar Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
                this.toggleMenu(false);
                menuToggle.focus();
            }
        });

        // Ensamblar navegación
        navContainer.appendChild(logo);
        navContainer.appendChild(menuToggle);
        navContainer.appendChild(menu);
        nav.innerHTML = '';
        nav.appendChild(navContainer);

        // Manejar resize de ventana
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768) {
                    this.toggleMenu(true); // Mantener abierto en desktop
                } else {
                    this.toggleMenu(false); // Cerrar en móvil
                }
            }, 250);
        });

        // Estado inicial según tamaño de pantalla
        if (window.innerWidth <= 768) {
            this.toggleMenu(false);
        }
    },

    toggleMenu(isOpen) {
        const menuToggle = document.querySelector('.menu-toggle');
        const menu = document.querySelector('#main-menu');
        
        if (!menuToggle || !menu) return;

        if (isOpen) {
            menu.classList.remove('menu-hidden');
            menu.classList.add('menu-open');
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
        } else {
            menu.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
            
            // En móvil, ocultar completamente después de la animación
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    if (!menu.classList.contains('menu-open')) {
                        menu.classList.add('menu-hidden');
                    }
                }, 300);
            }
        }
    }
};

// Inicializar navegación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => navigation.init());
} else {
    navigation.init();
}


