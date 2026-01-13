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

// Contact Form Handler - Sends through Courier
// Includes anti-spam: honeypot field + timing check
(function() {
    const CONFIG = {
        list: 'built-by-denny',
        source: 'built-by-denny',
        funnel: 'website-contact-form',
        formSelector: '#contact-form',
        successMessage: 'Thanks for reaching out! Denny will be in touch shortly.',
        errorMessage: 'Something went wrong. Please try again or call (256) 808-2100.',
        minSubmitTime: 3000 // Minimum 3 seconds before submit (bots are instant)
    };

    const API_URL = 'https://email-bot-server.micaiah-tasks.workers.dev/api/subscribe';
    
    // Track when page loaded for timing check
    let pageLoadTime = Date.now();

    document.addEventListener('DOMContentLoaded', function() {
        const form = document.querySelector(CONFIG.formSelector);
        if (!form) return;
        
        // Reset load time when DOM is ready
        pageLoadTime = Date.now();

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // ANTI-SPAM CHECK 1: Honeypot field
            // If the hidden "website" field has any value, it's a bot
            const honeypot = form.querySelector('#website');
            if (honeypot && honeypot.value) {
                // Fake success - don't let bot know it failed
                fakeSuccess(form);
                return;
            }
            
            // ANTI-SPAM CHECK 2: Timing check
            // If form submitted in less than 3 seconds, probably a bot
            const timeSinceLoad = Date.now() - pageLoadTime;
            if (timeSinceLoad < CONFIG.minSubmitTime) {
                // Fake success - don't let bot know it failed
                fakeSuccess(form);
                return;
            }
            
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn?.textContent;
            
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Sending...';
            }

            // Get form values
            const name = form.querySelector('#name')?.value || '';
            const email = form.querySelector('#email')?.value || '';
            const phone = form.querySelector('#phone')?.value || '';
            const grantStatus = form.querySelector('#grant-status')?.value || 'Not specified';
            const message = form.querySelector('#message')?.value || '';

            // Build payload for subscriber
            const payload = {
                email: email,
                list: CONFIG.list,
                source: CONFIG.source,
                funnel: CONFIG.funnel,
                name: name,
                metadata: {
                    phone: phone,
                    'grant-status': grantStatus,
                    message: message
                }
            };

            try {
                const resp = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await resp.json();

                if (resp.ok) {
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
                    showError(form, btn, originalText, data.error || CONFIG.errorMessage);
                }
            } catch (err) {
                console.error('Form error:', err);
                showError(form, btn, originalText, CONFIG.errorMessage);
            }
        });
    });

    // Show fake success to bots so they think it worked
    function fakeSuccess(form) {
        const name = form.querySelector('#name')?.value || 'there';
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
    }

    function showError(form, btn, originalText, message) {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
        
        let msg = form.querySelector('.form-error');
        if (!msg) {
            msg = document.createElement('div');
            msg.className = 'form-error';
            const submitBtn = form.querySelector('button[type="submit"]');
            form.insertBefore(msg, submitBtn);
        }
        msg.innerHTML = `<p>${message}</p>`;
    }
})();