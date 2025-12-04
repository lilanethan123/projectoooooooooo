class SmoothScroll {
    constructor() {
        this.current = 0;
        this.target = 0;
        this.ease = 0.075;
        this.rafId = null;
        this.isEnabled = true;
    }

    init() {
        document.body.style.height = document.documentElement.scrollHeight + 'px';
        this.update();
        window.addEventListener('scroll', () => {
            this.target = window.scrollY;
        }, { passive: true });
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    update() {
        if (!this.isEnabled) return;
        
        this.current = this.lerp(this.current, this.target, this.ease);
        
        if (Math.abs(this.current - this.target) < 0.1) {
            this.current = this.target;
        }

        this.rafId = requestAnimationFrame(() => this.update());
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }
}

class ScrollAnimations {
    constructor() {
        this.elements = [];
        this.progressBar = document.querySelector('.progress-bar');
        this.timelineProgress = document.querySelector('.timeline-progress');
        this.yearDisplay = document.querySelector('.nav-year .current-year');
        this.sections = document.querySelectorAll('[data-year]');
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollProgress();
        this.setupParallax();
        this.setupCounters();
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    if (entry.target.classList.contains('info-card') || 
                        entry.target.classList.contains('connection-card')) {
                        const cards = entry.target.parentElement.children;
                        Array.from(cards).forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('visible');
                            }, index * 100);
                        });
                    }
                }
            });
        }, options);

        const animatedElements = document.querySelectorAll(
            '.slide-up, .slide-left, .slide-right, .scale-in, .fade-in'
        );
        
        animatedElements.forEach(el => observer.observe(el));
    }

    setupScrollProgress() {
        this.onScroll();
    }

    onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        if (this.progressBar) {
            this.progressBar.style.width = `${scrollPercent}%`;
        }

        if (this.timelineProgress) {
            this.timelineProgress.style.height = `${scrollPercent}%`;
        }

        this.updateCurrentYear(scrollTop);
    }

    updateCurrentYear(scrollTop) {
        if (!this.yearDisplay || !this.sections.length) return;

        let currentYear = '1870';
        
        this.sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2) {
                currentYear = section.dataset.year;
            }
        });

        if (this.yearDisplay.textContent !== currentYear) {
            this.yearDisplay.style.transform = 'translateY(-10px)';
            this.yearDisplay.style.opacity = '0';
            
            setTimeout(() => {
                this.yearDisplay.textContent = currentYear;
                this.yearDisplay.style.transform = 'translateY(0)';
                this.yearDisplay.style.opacity = '1';
            }, 150);
        }
    }

    setupParallax() {
        const parallaxElements = document.querySelectorAll('.full-image-bg, .hero-bg');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            
            parallaxElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const parentRect = el.parentElement.getBoundingClientRect();
                
                if (parentRect.top < window.innerHeight && parentRect.bottom > 0) {
                    const speed = 0.3;
                    const yPos = (scrollTop - el.parentElement.offsetTop) * speed;
                    el.style.transform = `translateY(${yPos}px) scale(1.1)`;
                }
            });
        }, { passive: true });
    }

    setupCounters() {
        const counterElements = document.querySelectorAll('[data-count]');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counterElements.forEach(el => counterObserver.observe(el));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);
            
            if (target >= 1000000) {
                element.textContent = (current / 1000000).toFixed(1) + 'M+';
            } else if (target >= 1000) {
                element.textContent = Math.floor(current).toLocaleString();
            } else {
                element.textContent = current;
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }
}

class MouseEffects {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursorFollower = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.cursorFollower.className = 'custom-cursor-follower';
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.followerX = 0;
        this.followerY = 0;
        
        if (window.innerWidth > 1024) {
            this.init();
        }
    }

    init() {
        this.addStyles();
        document.body.appendChild(this.cursor);
        document.body.appendChild(this.cursorFollower);

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        this.animate();
        this.setupHoverEffects();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .custom-cursor {
                position: fixed;
                width: 8px;
                height: 8px;
                background: #f5c518;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                mix-blend-mode: difference;
                transition: transform 0.15s ease;
            }
            .custom-cursor-follower {
                position: fixed;
                width: 40px;
                height: 40px;
                border: 1px solid rgba(245, 197, 24, 0.5);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.3s ease, width 0.3s ease, height 0.3s ease;
            }
            .custom-cursor.hover {
                transform: scale(2);
            }
            .custom-cursor-follower.hover {
                width: 60px;
                height: 60px;
                border-color: rgba(245, 197, 24, 0.8);
            }
        `;
        document.head.appendChild(style);
    }

    animate() {
        this.cursorX += (this.mouseX - this.cursorX) * 0.2;
        this.cursorY += (this.mouseY - this.cursorY) * 0.2;
        this.followerX += (this.mouseX - this.followerX) * 0.1;
        this.followerY += (this.mouseY - this.followerY) * 0.1;

        this.cursor.style.left = `${this.cursorX - 4}px`;
        this.cursor.style.top = `${this.cursorY - 4}px`;
        this.cursorFollower.style.left = `${this.followerX - 20}px`;
        this.cursorFollower.style.top = `${this.followerY - 20}px`;

        requestAnimationFrame(() => this.animate());
    }

    setupHoverEffects() {
        const hoverElements = document.querySelectorAll('a, button, .info-card, .connection-card, .era-image');
        
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
                this.cursorFollower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
                this.cursorFollower.classList.remove('hover');
            });
        });
    }
}

class MagneticButtons {
    constructor() {
        this.buttons = document.querySelectorAll('.info-card, .connection-card');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => this.onMouseMove(e, button));
            button.addEventListener('mouseleave', (e) => this.onMouseLeave(e, button));
        });
    }

    onMouseMove(e, button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const moveX = x * 0.1;
        const moveY = y * 0.1;
        
        button.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    onMouseLeave(e, button) {
        button.style.transform = 'translate(0, 0)';
    }
}

class TextReveal {
    constructor() {
        this.init();
    }

    init() {
        const titles = document.querySelectorAll('.era-title, .section-title, .finale-title');
        
        titles.forEach(title => {
            const text = title.textContent;
            title.innerHTML = '';
            
            text.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.cssText = `
                    display: inline-block;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transition-delay: ${index * 0.02}s;
                `;
                title.appendChild(span);
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chars = entry.target.querySelectorAll('span');
                    chars.forEach(char => {
                        char.style.opacity = '1';
                        char.style.transform = 'translateY(0)';
                    });
                }
            });
        }, { threshold: 0.5 });

        titles.forEach(title => observer.observe(title));
    }
}

class ImageLoader {
    constructor() {
        this.images = document.querySelectorAll('.era-image img');
        this.init();
    }

    init() {
        this.images.forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.6s ease';

            if (img.complete) {
                img.style.opacity = '1';
            } else {
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
    new MouseEffects();
    new MagneticButtons();
    new ImageLoader();
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    document.querySelectorAll('.era-image').forEach(container => {
        container.addEventListener('mouseenter', function() {
            this.querySelector('img').style.filter = 'grayscale(0%)';
        });
        container.addEventListener('mouseleave', function() {
            this.querySelector('img').style.filter = 'grayscale(30%)';
        });
    });

    console.log('%c PORSCHE LEGACY ', 'background: #f5c518; color: #0a0a0a; font-size: 24px; font-weight: bold; padding: 10px 20px;');
    console.log('%c The Evolution of Cars: 1870-2025 ', 'color: #888; font-size: 12px;');
});

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
});
