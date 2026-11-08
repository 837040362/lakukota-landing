/* =========================================================
   LAKUKOTA MARKETING ANALYTICS
   GA4 custom events — never send personal or authentication data.
========================================================= */
(() => {
    'use strict';

    function track(eventName, parameters = {}) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, parameters);
    }

    window.lakukotaAnalytics = Object.freeze({ track });

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;

        const founderRegister = target.closest('#founder-offer-register');
        if (founderRegister) {
            track('click_register', {
                placement: 'founder_offer',
                journey: 'sangkan'
            });
        }

        const link = target.closest('a[href]');
        if (link) {
            try {
                const destination = new URL(link.href, window.location.href);
                if (
                    destination.hostname === window.location.hostname &&
                    destination.pathname.replace(/\/$/, '').endsWith('/sangkan.html')
                ) {
                    track('click_sangkan_entry', {
                        link_url: destination.pathname,
                        placement: 'homepage'
                    });
                }
            } catch (_) {
                // Invalid/non-URL links are ignored.
            }
        }
    });

    const registrationForm = document.getElementById('reg-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', () => {
            // Submit fires only after browser-native form validation succeeds.
            track('begin_registration', {
                journey: 'sangkan',
                form_id: 'reg-form'
            });
        });
    }
})();
