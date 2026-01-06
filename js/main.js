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

// Contact Form Handler - Sends through Courier via MCP server
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Get form values
        const name = form.querySelector('#name').value;
        const phone = form.querySelector('#phone').value;
        const email = form.querySelector('#email').value;
        const grantStatus = form.querySelector('#grant-status').value || 'Not specified';
        const message = form.querySelector('#message').value || 'No message provided';

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        try {
            const response = await fetch('https://productivity-mcp-server.micaiah-tasks.workers.dev/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    business: 'built-by-denny',
                    to: 'Dennis@builtbydenny.com',
                    subscriberEmail: email,
                    formData: {
                        name: name,
                        phone: phone,
                        email: email,
                        grantStatus: grantStatus,
                        message: message,
                        source: 'Built by Denny Website',
                        submittedAt: new Date().toISOString()
                    }
                })
            });

            if (response.ok) {
                form.innerHTML = `
                    <div class="form-success">
                        <svg viewBox="0 0 24 24" width="60" height="60" fill="#f5a623">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <h3>Message Sent!</h3>
                        <p>Thanks for reaching out, ${name}. Denny will be in touch with you shortly.</p>
                        <p class="form-success-note">Check your email for a confirmation.</p>
                    </div>
                `;
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Form error:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.innerHTML = `<p>There was an issue sending your message. Please try again or call us at <a href="tel:2568082100">(256) 808-2100</a>.</p>`;
            
            const existingError = form.querySelector('.form-error');
            if (existingError) existingError.remove();
            form.insertBefore(errorDiv, submitBtn);
        }
    });
});