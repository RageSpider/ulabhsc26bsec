import { initVisual } from './visuals.js';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Lenis Setup (Smooth Damped Scroll) ---
const lenis = new Lenis({
    lerp: 0.05, // Lower = Smoother/Heavier feel (More "Cinematic")
    wheelMultiplier: 1,
    infinite: false,
    normalizeWheel: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// --- 2. Main Logic ---
function initApp() {
    initVisual(); // Start WebGL

    // A. Title Reveal
    const splitTitle = new SplitType('.split-text', { types: 'chars' });
    gsap.from(splitTitle.chars, {
        y: 100,
        opacity: 0,
        rotate: 5,
        duration: 1.5,
        stagger: 0.05,
        ease: "power4.out",
        delay: 0.2
    });

    // B. The Horizontal Timeline (Driven by Vertical Scroll)
    const container = document.querySelector('#timeline-container');
    const wrapper = document.querySelector('#timeline-wrapper');
    const track = document.querySelector('#track');

    if (container && track) {
        
        // Calculate dynamic width
        function getScrollAmount() {
            return -(track.scrollWidth - window.innerWidth);
        }

        const tween = gsap.to(track, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: "bottom bottom",
                scrub: 1, // Smooth scrub
                pin: wrapper,
                invalidateOnRefresh: true,
            }
        });

        // C. Parallax Elements (Inner movement)
        document.querySelectorAll('.parallax-el').forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed'));
            gsap.to(el, {
                x: () => (window.innerWidth * speed),
                ease: "none",
                scrollTrigger: {
                    trigger: el.parentElement,
                    containerAnimation: tween,
                    start: "left right",
                    end: "right left",
                    scrub: true
                }
            });
        });

        // D. Fade In Blocks on Enter
        document.querySelectorAll('.memory-block').forEach(block => {
            ScrollTrigger.create({
                trigger: block,
                containerAnimation: tween,
                start: "left 90%", // When left side of block hits 90% of viewport
                onEnter: () => block.classList.add('is-visible'),
                // Don't hide on leave, keep them visible for memory feel
            });
        });
    }
}

// Init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}