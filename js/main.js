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
        
        // Get form values
        const name = form.querySelector('#name').value;
        const phone = form.querySelector('#phone').value;
        const email = form.querySelector('#email').value;
        const grantStatus = form.querySelector('#grant-status').value || 'Not specified';
        const message = form.querySelector('#message').value || 'No message provided';

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        // Build email body
        const emailBody = `New Contact Form Submission from Built by Denny Website

Name: ${name}
Phone: ${phone}
Email: ${email}
SAH Grant Status: ${grantStatus}

Message:
${message}

---
Submitted from builtbydenny.com`;

        // Create mailto link as primary method
        const mailtoLink = `mailto:Dennis@builtbydenny.com?subject=${encodeURIComponent('New Website Inquiry from ' + name)}&body=${encodeURIComponent(emailBody)}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message after brief delay
        setTimeout(() => {
            form.innerHTML = `
                <div class="form-success">
                    <svg viewBox="0 0 24 24" width="60" height="60" fill="#f5a623">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <h3>Almost Done!</h3>
                    <p>Your email app should have opened with your message to Denny. Just hit send!</p>
                    <p style="margin-top: 15px; font-size: 0.95rem; color: #666;">If your email didn't open, please call us at <a href="tel:2568082100" style="color: #f5a623; font-weight: 600;">(256) 808-2100</a></p>
                </div>
            `;
        }, 500);
    });
});