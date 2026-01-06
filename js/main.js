/* ========================================
   BUILT BY DENNY - Main JavaScript
   ======================================== */

// Mobile Navigation Toggle
function toggleNav() {
    const nav = document.getElementById('nav');
    nav.classList.toggle('active');
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile nav if open
            document.getElementById('nav').classList.remove('active');
        }
    });
});

// Header shadow on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 30px rgba(0,0,0,0.12)';
    } else {
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)';
    }
});

// ========================================
// GALLERY LIGHTBOX
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                openLightbox(img.src, img.alt);
            }
        });
    });
});

function openLightbox(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 2rem;
    `;
    overlay.innerHTML = `
        <div style="position: relative; max-width: 90vw; max-height: 90vh;">
            <button style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 2rem; cursor: pointer;" class="lightbox-close">&times;</button>
            <img src="${src}" alt="${alt}" style="max-width: 100%; max-height: 85vh; object-fit: contain;">
            <p style="color: white; text-align: center; margin-top: 1rem; opacity: 0.8;">${alt}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay || e.target.className === 'lightbox-close') {
            closeLightbox(overlay);
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox(overlay);
        }
    });
}

function closeLightbox(overlay) {
    overlay.remove();
    document.body.style.overflow = '';
}