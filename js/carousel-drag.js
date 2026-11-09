(() => {
    'use strict';

    const tracks = document.querySelectorAll('.drag-carousel');
    if (!tracks.length) return;

    const itemSelector = '.character-slide, .carousel-slide, .carousel-card';

    tracks.forEach((track) => {
        const counterId = track.dataset.carouselCounter;
        const counter = counterId ? document.getElementById(counterId) : null;
        let pointerId = null;
        let startX = 0;
        let startY = 0;
        let startScrollLeft = 0;
        let hasDragged = false;
        let suppressClick = false;
        let scrollFrame = 0;

        track.querySelectorAll('img').forEach((image) => {
            image.draggable = false;
        });

        const getItems = () => Array.from(track.children).filter((child) =>
            child.matches(itemSelector)
        );

        const updateCounter = () => {
            if (!counter) return;
            const items = getItems();
            if (!items.length) return;

            const trackRect = track.getBoundingClientRect();
            const center = trackRect.left + trackRect.width / 2;
            let nearestIndex = 0;
            let nearestDistance = Infinity;

            items.forEach((item, index) => {
                const rect = item.getBoundingClientRect();
                const distance = Math.abs(center - (rect.left + rect.width / 2));
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }
            });

            counter.textContent =
                String(nearestIndex + 1).padStart(2, '0') +
                ' / ' +
                String(items.length).padStart(2, '0');
        };

        track.addEventListener('pointerdown', (event) => {
            if (pointerId !== null) return;
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            if (event.target.closest('button, a, input, select, textarea, [data-no-drag]')) return;

            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            startScrollLeft = track.scrollLeft;
            hasDragged = false;
            track.classList.add('is-dragging');

            try {
                track.setPointerCapture(event.pointerId);
            } catch (_) {
                // The browser may already have canceled this pointer.
            }
        });

        track.addEventListener('pointermove', (event) => {
            if (event.pointerId !== pointerId) return;

            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;

            if (!hasDragged &&
                Math.abs(deltaX) > 5 &&
                Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
                hasDragged = true;
            }

            if (hasDragged) {
                if (event.cancelable) event.preventDefault();
                track.scrollLeft = startScrollLeft - deltaX;
            }
        }, { passive: false });

        const finishDrag = (event, canceled = false) => {
            if (event && event.pointerId !== pointerId) return;
            if (pointerId === null) return;

            if (hasDragged && !canceled) suppressClick = true;
            pointerId = null;
            hasDragged = false;
            track.classList.remove('is-dragging');
            updateCounter();
        };

        track.addEventListener('pointerup', (event) => finishDrag(event));
        track.addEventListener('pointercancel', (event) => finishDrag(event, true));
        track.addEventListener('lostpointercapture', (event) => finishDrag(event, true));

        // A drag must not accidentally activate a card's image/lightbox click.
        track.addEventListener('click', (event) => {
            if (!suppressClick) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            suppressClick = false;
        }, true);

        track.addEventListener('dragstart', (event) => event.preventDefault());

        // Keep the carousel keyboard-accessible without displaying arrow controls.
        track.addEventListener('keydown', (event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            const items = getItems();
            if (!items.length) return;

            const trackRect = track.getBoundingClientRect();
            const center = trackRect.left + trackRect.width / 2;
            let nearestIndex = 0;
            let nearestDistance = Infinity;

            items.forEach((item, index) => {
                const rect = item.getBoundingClientRect();
                const distance = Math.abs(center - (rect.left + rect.width / 2));
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }
            });

            const direction = event.key === 'ArrowRight' ? 1 : -1;
            const nextIndex = Math.max(0, Math.min(items.length - 1, nearestIndex + direction));
            if (nextIndex === nearestIndex) return;

            event.preventDefault();
            const target = items[nextIndex];
            const targetLeft = target.offsetLeft -
                Math.max(0, (track.clientWidth - target.clientWidth) / 2);
            track.scrollTo({
                left: targetLeft,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'auto'
                    : 'smooth'
            });
        });

        track.addEventListener('scroll', () => {
            if (!counter) return;
            if (scrollFrame) cancelAnimationFrame(scrollFrame);
            scrollFrame = requestAnimationFrame(() => {
                updateCounter();
                scrollFrame = 0;
            });
        }, { passive: true });

        updateCounter();
    });
})();
