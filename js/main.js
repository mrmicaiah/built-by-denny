// Mobile Navigation Toggle
function toggleNav() {
    const nav = document.getElementById('nav');
    const menuButton = document.querySelector('.mobile-menu');
    nav.classList.toggle('active');
    menuButton.setAttribute('aria-expanded', nav.classList.contains('active'));
}

// Close mobile nav when clicking outside
document.addEventListener('click', function(event) {
    const nav = document.getElementById('nav');
    const menuButton = document.querySelector('.mobile-menu');
    
    if (nav && nav.classList.contains('active')) {
        if (!nav.contains(event.target) && !menuButton.contains(event.target)) {
            nav.classList.remove('active');
            menuButton.setAttribute('aria-expanded', 'false');
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            
            // Close mobile nav if open
            const nav = document.getElementById('nav');
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
            
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Get form data
        const formData = new FormData(form);
        const name = formData.get('name');

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        try {
            // Send to Formspree
            const response = await fetch('https://formspree.io/f/xwpkgjkr', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success message
                form.innerHTML = `
                    <div class="form-success">
                        <svg viewBox="0 0 24 24" width="60" height="60" fill="#f5a623">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <h3>Message Sent!</h3>
                        <p>Thanks for reaching out, ${name}. Denny will be in touch with you shortly.</p>
                    </div>
                `;
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Form error:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.innerHTML = `<p>There was an issue sending your message. Please try again or call us at (256) 808-2100.</p>`;
            
            const existingError = form.querySelector('.form-error');
            if (existingError) existingError.remove();
            form.insertBefore(errorDiv, submitBtn);
        }
    });
});