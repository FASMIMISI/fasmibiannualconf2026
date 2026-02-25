/* ============================================
   FASMI 2026 – Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Sticky Navbar ──
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

        if (!isHomePage) {
            navbar.classList.add('scrolled');
        }

        window.addEventListener('scroll', () => {
            if (isHomePage) {
                if (window.scrollY > 60) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    }

    // ── Mobile Menu Toggle ──
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            // Animate hamburger to X
            const spans = navToggle.querySelectorAll('span');
            if (navLinks.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close mobile menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // ── Tab Switching ──
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById('tab-' + target);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // ── Smooth Scroll for Anchor Links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ── Scroll Animations (IntersectionObserver) ──
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    if (animateElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        animateElements.forEach(el => observer.observe(el));
    }

    // ── Registration Form Submission (Google Sheets via Apps Script) ──
    const form = document.getElementById('registrationForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    // ┌──────────────────────────────────────────────────────────┐
    // │  IMPORTANT: Replace the URL below with your             │
    // │  Google Apps Script Web App URL after deployment.        │
    // └──────────────────────────────────────────────────────────┘
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyrodpAcLZKFnQhDHN1MkUVWT4aEwtsasCoZVbhSqQ00T35tgzqggT5fpZo7om38cX4VQ/exec'; // ← PASTE YOUR APPS SCRIPT URL HERE

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate required fields
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const organization = document.getElementById('organization').value.trim();
            const designation = document.getElementById('designation').value.trim();
            const country = document.getElementById('country').value.trim();
            const category = document.getElementById('category').value;
            const phone = document.getElementById('phone').value.trim();

            if (!fullName || !email || !organization || !designation || !country || !category) {
                showMessage('Please fill in all required fields.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Check if URL is configured
            if (!GOOGLE_SHEETS_URL) {
                showMessage('Form system is being configured. Please email fasmi2026@gmail.com.', 'error');
                return;
            }

            // Submit
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            try {
                const response = await fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    mode: 'cors', // Changed to cors to help debug network errors
                    headers: { 'Content-Type': 'text/plain' }, // Using text/plain to avoid preflight issues
                    body: JSON.stringify({
                        formType: 'registration',
                        fullName,
                        email,
                        organization,
                        designation,
                        country,
                        category,
                        phone
                    })
                });

                showMessage('✓ Registration submitted successfully! You will receive a confirmation email shortly.', 'success');
                form.reset();
            } catch (error) {
                console.error('Submission Error:', error);
                showMessage('Network error. Please try again or email fasmi2026@gmail.com.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Registration';
            }
        });
    }

    function showMessage(text, type) {
        if (!formMessage) return;
        formMessage.textContent = text;
        formMessage.className = 'form-message ' + type;
        formMessage.style.display = 'block';
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ── Sponsorship Enquiry Form ──
    const enquiryForm = document.getElementById('enquiryForm');
    const enquiryMessage = document.getElementById('enquiryMessage');
    const enquirySubmitBtn = document.getElementById('enquirySubmitBtn');

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const contactName = document.getElementById('contactName').value.trim();
            const contactEmail = document.getElementById('contactEmail').value.trim();
            const companyName = document.getElementById('companyName').value.trim();
            const designation = document.getElementById('designation').value.trim();
            const country = document.getElementById('country').value.trim();
            const sponsorTier = document.getElementById('sponsorTier').value;
            const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
            const message = document.getElementById('message') ? document.getElementById('message').value.trim() : '';

            if (!contactName || !contactEmail || !companyName || !designation || !country || !sponsorTier) {
                showEnquiryMessage('Please fill in all required fields.', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contactEmail)) {
                showEnquiryMessage('Please enter a valid email address.', 'error');
                return;
            }

            if (!GOOGLE_SHEETS_URL) {
                showEnquiryMessage('Enquiry system is being configured. Please email fasmi2026@gmail.com directly.', 'error');
                return;
            }

            enquirySubmitBtn.disabled = true;
            enquirySubmitBtn.textContent = 'Submitting...';

            try {
                await fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        formType: 'enquiry',
                        contactName,
                        contactEmail,
                        companyName,
                        designation,
                        country,
                        sponsorTier,
                        phone,
                        message
                    })
                });

                showEnquiryMessage('✓ Enquiry submitted successfully! Our team will contact you shortly.', 'success');
                enquiryForm.reset();
            } catch (error) {
                console.error('Enquiry Error:', error);
                showEnquiryMessage('Network error. Please try again or email fasmi2026@gmail.com.', 'error');
            } finally {
                enquirySubmitBtn.disabled = false;
                enquirySubmitBtn.textContent = 'Submit Enquiry';
            }
        });
    }

    function showEnquiryMessage(text, type) {
        if (!enquiryMessage) return;
        enquiryMessage.textContent = text;
        enquiryMessage.className = 'form-message ' + type;
        enquiryMessage.style.display = 'block';
        enquiryMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

});

