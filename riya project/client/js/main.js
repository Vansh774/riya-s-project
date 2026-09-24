// Main JavaScript - Landing Page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth
    auth.initAuth();

    // Setup navbar
    setupNavbar();

    // Setup scroll reveal
    setupScrollReveal();

    // Setup counter animations
    setupCounters();

    // Setup hamburger menu
    setupHamburger();

    // Update auth buttons
    updateAuthButtons();
});

// Setup Navbar
function setupNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Setup Scroll Reveal
function setupScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// Setup Counter Animations
function setupCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60;
    const duration = 1500;
    const stepTime = duration / 60;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, stepTime);
}

// Setup Hamburger Menu
function setupHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        // Close on link click (mobile)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }
}

// Update Auth Buttons
function updateAuthButtons() {
    const authButtons = document.querySelector('.nav-actions');
    const user = auth.getCurrentUser();
    
    if (auth.isAuthenticated() && user) {
        // User is logged in
        authButtons.innerHTML = `
            <span class="user-greeting" style="color: var(--text-secondary); font-weight: 500;">Hi, ${user.name.split(' ')[0]}</span>
            <a href="${user.role === 'farmer' ? 'farmer-dashboard.html' : 'customer-dashboard.html'}" class="btn btn-primary btn-sm">
                <i class="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <button class="btn btn-secondary btn-sm" onclick="auth.handleLogout()" style="background: rgba(229, 62, 62, 0.1); color: #e53e3e; border-color: rgba(229, 62, 62, 0.2);">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    } else {
        // User is not logged in
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-secondary btn-sm">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
            <a href="login.html#register" class="btn btn-primary btn-sm">
                <i class="fas fa-user-plus"></i> Register
            </a>
        `;
    }
}