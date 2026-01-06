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
        const formData = {
            name: form.querySelector('#name').value,
            phone: form.querySelector('#phone').value,
            email: form.querySelector('#email').value,
            grantStatus: form.querySelector('#grant-status').value,
            message: form.querySelector('#message').value,
            source: 'Built by Denny Website',
            timestamp: new Date().toISOString()
        };

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        try {
            // Send to our API endpoint
            const response = await fetch('https://productivity-mcp-server.micaiah-tasks.workers.dev/api/contact-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    business: 'built-by-denny',
                    businessEmail: 'Dennis@builtbydenny.com',
                    businessName: 'Built by Denny',
                    formData: formData,
                    welcomeEmail: {
                        subject: 'Thanks for contacting Built by Denny!',
                        preheader: 'We received your inquiry about VA SAH Grant construction',
                        body: `Hi ${formData.name},\n\nThank you for reaching out to Built by Denny! We received your inquiry and will be in touch within 1 business day.\n\nIn the meantime, feel free to call us at (256) 808-2100 if you have any urgent questions about your VA SAH Grant project.\n\nWe look forward to helping you build your accessible home.\n\nBest regards,\nDenny Liuzzo\nBuilt by Denny\nVA SAH Grant Specialist`
                    }
                })
            });

            if (response.ok) {
                // Show success message
                form.innerHTML = `
                    <div class="form-success">
                        <svg viewBox="0 0 24 24" width="60" height="60" fill="#f5a623">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <h3>Message Sent!</h3>
                        <p>Thanks for reaching out, ${formData.name}. Denny will be in touch with you shortly.</p>
                        <p class="form-success-note">Check your email for a confirmation.</p>
                    </div>
                `;
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Form error:', error);
            // Fallback - send via mailto
            const mailtoLink = `mailto:Dennis@builtbydenny.com?subject=New Website Inquiry from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(
                `New contact form submission:\n\n` +
                `Name: ${formData.name}\n` +
                `Phone: ${formData.phone}\n` +
                `Email: ${formData.email}\n` +
                `Grant Status: ${formData.grantStatus}\n` +
                `Message: ${formData.message}`
            )}`;
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            // Show fallback message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.innerHTML = `
                <p>There was an issue sending your message. Please try again or <a href="${mailtoLink}">click here to email us directly</a>.</p>
            `;
            
            const existingError = form.querySelector('.form-error');
            if (existingError) existingError.remove();
            form.insertBefore(errorDiv, submitBtn);
        }
    });
});