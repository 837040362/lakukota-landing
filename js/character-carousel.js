(() => {
    const track = document.getElementById('track-karakter');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.character-slide'));
    const previousButton = document.getElementById('character-prev');
    const nextButton = document.getElementById('character-next');
    const counter = document.getElementById('character-counter');
    const dots = Array.from(document.querySelectorAll('.character-dot'));

    if (!slides.length || !previousButton || !nextButton) return;

    let activeIndex = 0;
    let scrollFrame = null;

    function clampIndex(index) {
        return Math.max(0, Math.min(slides.length - 1, index));
    }

    function renderControls(index) {
        activeIndex = clampIndex(index);

        previousButton.disabled = activeIndex === 0;
        nextButton.disabled = activeIndex === slides.length - 1;

        if (counter) {
            counter.textContent =
                String(activeIndex + 1).padStart(2, '0') +
                ' / ' +
                String(slides.length).padStart(2, '0');
        }

        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === activeIndex;
            dot.classList.toggle('is-active', isActive);

            if (isActive) {
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.removeAttribute('aria-current');
            }
        });
    }

    function goTo(index) {
        const targetIndex = clampIndex(index);
        const targetSlide = slides[targetIndex];

        track.scrollTo({
            left: targetSlide.offsetLeft,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth'
        });

        renderControls(targetIndex);
    }

    previousButton.addEventListener('click', () => goTo(activeIndex - 1));
    nextButton.addEventListener('click', () => goTo(activeIndex + 1));

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = Number(dot.dataset.index);
            if (Number.isInteger(index)) goTo(index);
        });
    });

    track.addEventListener('scroll', () => {
        if (scrollFrame !== null) {
            cancelAnimationFrame(scrollFrame);
        }

        scrollFrame = requestAnimationFrame(() => {
            const center = track.scrollLeft + track.clientWidth / 2;
            let nearestIndex = 0;
            let nearestDistance = Infinity;

            slides.forEach((slide, index) => {
                const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
                const distance = Math.abs(center - slideCenter);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }
            });

            renderControls(nearestIndex);
            scrollFrame = null;
        });
    }, { passive: true });

    window.addEventListener('resize', () => {
        const slide = slides[activeIndex];
        if (slide) {
            track.scrollTo({
                left: slide.offsetLeft,
                behavior: 'auto'
            });
        }
    });

    slides.forEach(slide => {
        const image = slide.querySelector('img');
        if (image) image.draggable = false;
    });

    renderControls(0);
})();
