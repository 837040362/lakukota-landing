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

    // Signup success is identified from the existing success modal.
    // The event contains no name, email, password, or Supabase user ID.
    const successModal = document.getElementById('custom-modal');
    const successTitle = document.getElementById('modal-title');
    const successMessage = document.getElementById('modal-message');
    let signupTracked = false;

    function detectSuccessfulSignup() {
        if (signupTracked || !successModal || !successTitle || !successMessage) return;
        const isVisible = !successModal.classList.contains('hidden');
        const isSignupSuccess =
            successTitle.textContent.trim() === 'RITUAL BERHASIL' &&
            successMessage.textContent.includes('LAKU-CODE Anda:');

        if (isVisible && isSignupSuccess) {
            signupTracked = true;
            track('sign_up', {
                method: 'email',
                journey: 'sangkan'
            });
        }
    }

    if (successModal) {
        new MutationObserver(detectSuccessfulSignup).observe(successModal, {
            attributes: true,
            attributeFilter: ['class'],
            childList: true,
            subtree: true
        });
    }
})();
