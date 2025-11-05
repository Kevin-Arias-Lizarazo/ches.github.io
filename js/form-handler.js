// Manejo del formulario de sugerencias
const formHandler = {
    init() {
        const form = document.getElementById('suggestions-form');
        if (!form) return;

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validación en tiempo real
        const emailInput = form.querySelector('input[name="email"]');
        const messageInput = form.querySelector('textarea[name="message"]');
        
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
        }
        
        if (messageInput) {
            messageInput.addEventListener('input', () => this.validateMessage(messageInput));
        }
    },

    validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errorElement = input.parentElement.querySelector('.form-error');
        
        if (!email) {
            this.showError(errorElement, 'El email es requerido');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError(errorElement, 'Por favor ingresa un email válido');
            return false;
        }
        
        this.hideError(errorElement);
        return true;
    },

    validateMessage(input) {
        const message = input.value.trim();
        const errorElement = input.parentElement.querySelector('.form-error');
        
        if (!message) {
            this.showError(errorElement, 'El mensaje es requerido');
            return false;
        }
        
        if (message.length < 10) {
            this.showError(errorElement, 'El mensaje debe tener al menos 10 caracteres');
            return false;
        }
        
        this.hideError(errorElement);
        return true;
    },

    showError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },

    hideError(errorElement) {
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const successElement = document.getElementById('form-success');
        const emailInput = form.querySelector('input[name="email"]');
        const messageInput = form.querySelector('textarea[name="message"]');
        
        // Validar campos
        const isEmailValid = this.validateEmail(emailInput);
        const isMessageValid = this.validateMessage(messageInput);
        
        if (!isEmailValid || !isMessageValid) {
            return;
        }
        
        // Deshabilitar botón durante el envío
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        // Ocultar mensaje de éxito anterior si existe
        if (successElement) {
            successElement.classList.remove('show');
        }
        
        try {
            const formData = new FormData(form);
            
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Mostrar mensaje de éxito
                if (successElement) {
                    successElement.classList.add('show');
                    successElement.textContent = '¡Gracias! Tu sugerencia ha sido enviada correctamente.';
                }
                
                // Resetear formulario
                form.reset();
                
                // Ocultar errores
                form.querySelectorAll('.form-error').forEach(error => {
                    error.classList.remove('show');
                });
            } else {
                throw new Error('Error al enviar el formulario');
            }
        } catch (error) {
            console.error('Error:', error);
            
            // Mostrar mensaje de error
            if (successElement) {
                successElement.classList.add('show');
                successElement.classList.remove('success');
                successElement.style.backgroundColor = '#f8d7da';
                successElement.style.color = '#721c24';
                successElement.textContent = 'Hubo un error al enviar tu sugerencia. Por favor, intenta de nuevo más tarde.';
            }
        } finally {
            // Rehabilitar botón
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar';
        }
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => formHandler.init());
} else {
    formHandler.init();
}

