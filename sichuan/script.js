// PeerX Landing Page Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initializeNavigation();
    initializeSlidesTabs();
    initializeScrollEffects();
    initializeCTAButtons();
    initializeMarketWidget();
});

// Navigation functionality
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item (only for main nav, not actions)
            if (this.parentElement.classList.contains('nav-menu')) {
                this.classList.add('active');
            }
            
            // Smooth scroll to section if it's an anchor link
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Handle scroll to update active nav item
    window.addEventListener('scroll', updateActiveNavItem);
}

// Update active navigation item based on scroll position
function updateActiveNavItem() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href === `#${currentSection}`) {
            item.classList.add('active');
        }
    });
}

// Slides tabs functionality
function initializeSlidesTabs() {
    const slideTabs = document.querySelectorAll('.slide-tab');
    
    slideTabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            slideTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update slide content based on tab
            updateSlideContent(index);
        });
    });
}

// Update slide content
function updateSlideContent(tabIndex) {
    const slideContent = document.querySelector('.slide-content');
    const slideImage = slideContent.querySelector('.slide-image');
    
    // Different content for each tab
    const slideData = [
        {
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/244eea225354784be8cd368c593b09d4c3f438f2?width=1910',
            alt: 'Global P2P Trading'
        },
        {
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/244eea225354784be8cd368c593b09d4c3f438f2?width=1910',
            alt: 'Multi-Network Wallet'
        },
        {
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/244eea225354784be8cd368c593b09d4c3f438f2?width=1910',
            alt: 'Fee-Free Direct Trading'
        }
    ];
    
    // Fade out effect
    slideImage.style.opacity = '0';
    
    setTimeout(() => {
        slideImage.src = slideData[tabIndex].image;
        slideImage.alt = slideData[tabIndex].alt;
        slideImage.style.opacity = '1';
    }, 300);
}

// Scroll effects and animations
function initializeScrollEffects() {
    // Create intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.feature-card, .why-card, .testimonial-card, .hero-content'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroPattern = document.querySelector('.hero-pattern');
        
        if (heroPattern) {
            const speed = scrolled * 0.3;
            heroPattern.style.transform = `translateY(${speed}px)`;
        }
    });
}

// CTA buttons functionality
function initializeCTAButtons() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Handle different CTA actions
            const buttonText = this.textContent.trim();
            
            switch(buttonText) {
                case '지금 시작하기':
                case 'Get Started with PeerX':
                    handleGetStarted();
                    break;
                case '회원가입':
                    handleSignUp();
                    break;
                case '이용 가이드':
                    handleUserGuide();
                    break;
                default:
                    console.log('CTA clicked:', buttonText);
            }
        });
        
        // Add hover sound effect (optional)
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// Market widget functionality
function initializeMarketWidget() {
    const cryptoItems = document.querySelectorAll('.crypto-item');
    
    // Simulate real-time price updates
    setInterval(() => {
        updateCryptoPrices();
    }, 5000); // Update every 5 seconds
    
    // Add hover effects to crypto items
    cryptoItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            this.style.borderRadius = '8px';
            this.style.transition = 'all 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });
}

// Update crypto prices with random fluctuations
function updateCryptoPrices() {
    const priceElements = document.querySelectorAll('.price-value');
    const changeElements = document.querySelectorAll('.price-change');
    
    priceElements.forEach((priceEl, index) => {
        const currentPrice = parseFloat(priceEl.textContent);
        const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% change
        const newPrice = currentPrice * (1 + fluctuation);
        
        // Animate price change
        priceEl.style.transition = 'color 0.3s ease';
        priceEl.style.color = fluctuation > 0 ? '#95CF37' : '#FF6B6B';
        
        setTimeout(() => {
            priceEl.textContent = newPrice.toFixed(2);
            priceEl.style.color = '#FFF';
        }, 300);
        
        // Update percentage change
        const changeEl = changeElements[index];
        if (changeEl) {
            const change = (fluctuation * 100).toFixed(3);
            changeEl.textContent = `${change > 0 ? '+' : ''}${change}%`;
            changeEl.style.color = change > 0 ? '#95CF37' : '#FF6B6B';
        }
    });
}

// CTA Handler Functions
function handleGetStarted() {
    // Smooth scroll to sign up section or open modal
    const signUpSection = document.querySelector('.buy-crypto-section');
    if (signUpSection) {
        signUpSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    // Show success message
    showNotification('환영합니다! PeerX와 함께 거래를 시작하세요.', 'success');
}

function handleSignUp() {
    // Simulate sign up process
    showNotification('회원가입 페이지로 이동합니다...', 'info');
    
    // In a real app, this would redirect to sign up page
    setTimeout(() => {
        console.log('Redirecting to sign up page...');
    }, 1000);
}

function handleUserGuide() {
    // Show user guide modal or redirect
    showNotification('이용 가이드를 확인하고 있습니다...', 'info');
    
    // In a real app, this would open a modal or redirect
    setTimeout(() => {
        console.log('Opening user guide...');
    }, 1000);
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: type === 'success' ? '#95CF37' : type === 'error' ? '#FF6B6B' : '#795AFE',
        color: '#FFF',
        padding: '15px 20px',
        borderRadius: '8px',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        maxWidth: '300px',
        fontSize: '14px',
        fontWeight: '500'
    });
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key to close any open modals/overlays
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
});

// Performance optimization: debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
window.addEventListener('scroll', debounce(updateActiveNavItem, 100));

// Loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    const heroElements = document.querySelectorAll('.hero-content, .market-widget');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Add CSS for animations via JavaScript
const style = document.createElement('style');
style.textContent = `
    .hero-content, .market-widget {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
    }
    
    .notification {
        font-family: 'Pretendard', 'Inter', sans-serif;
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .slide-image {
        transition: opacity 0.3s ease;
    }
    
    .crypto-item {
        transition: all 0.3s ease;
    }
    
    .crypto-item:hover {
        background-color: rgba(255, 255, 255, 0.05) !important;
        border-radius: 8px;
    }
`;

document.head.appendChild(style);

// Console welcome message
console.log(`
    🚀 Welcome to PeerX!
    
    This is a modern P2P cryptocurrency trading platform.
    Built with vanilla HTML, CSS, and JavaScript.
    
    Features:
    - Responsive design
    - Interactive navigation
    - Real-time price simulation
    - Smooth animations
    - Accessibility support
    
    Ready to start trading? 💰
`);
