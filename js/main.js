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

    // ── Dynamic Registration Fee Calculation & Form Handling ──
    const regForm = document.getElementById('registrationForm');
    const regionalCohortSelect = document.getElementById('regionalCohort');
    const attendeeCategorySelect = document.getElementById('attendeeCategory');
    const isMemberDiscountCheckbox = document.getElementById('isMemberDiscount');
    const proofUploadContainer = document.getElementById('proofUploadContainer');
    const proofFileInput = document.getElementById('proofFile');
    const fileInfo = document.getElementById('fileInfo');
    const calculatedFeeDisplay = document.getElementById('calculatedFeeDisplay');
    const btnFeeDisplay = document.getElementById('btnFeeDisplay');
    const summaryCohortText = document.getElementById('summaryCohortText');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');
    const upiQrImage = document.getElementById('upiQrImage');

    // Success Modal Elements
    const successModal = document.getElementById('successModal');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const receiptName = document.getElementById('receiptName');
    const receiptRegId = document.getElementById('receiptRegId');
    const receiptCategory = document.getElementById('receiptCategory');
    const receiptAmount = document.getElementById('receiptAmount');
    const receiptGatewayRef = document.getElementById('receiptGatewayRef');
    const receiptDate = document.getElementById('receiptDate');

    // Official Fee Matrix (in INR)
    const FEE_MATRIX = {
        'Student': {
            'India': { standard: 3500, member: 3000 },
            'Asian': { standard: 5500, member: 4500 },
            'Rest of World': { standard: 8000, member: 6000 }
        },
        'Academic': {
            'India': { standard: 5500, member: 5000 },
            'Asian': { standard: 8000, member: 7000 },
            'Rest of World': { standard: 11000, member: 9000 }
        },
        'Industry': {
            'India': { standard: 8000, member: 7500 },
            'Asian': { standard: 11000, member: 10000 },
            'Rest of World': { standard: 14000, member: 12000 }
        }
    };

    let currentCalculatedFee = null;

    function updateFeeCalculation() {
        if (!regionalCohortSelect || !attendeeCategorySelect || !calculatedFeeDisplay) return;

        const cohort = regionalCohortSelect.value;
        const category = attendeeCategorySelect.value;
        const isDiscounted = isMemberDiscountCheckbox ? isMemberDiscountCheckbox.checked : false;

        // Toggle Proof Upload field visibility
        if (proofUploadContainer) {
            if (isDiscounted) {
                proofUploadContainer.style.display = 'block';
                if (proofFileInput) proofFileInput.required = true;
            } else {
                proofUploadContainer.style.display = 'none';
                if (proofFileInput) proofFileInput.required = false;
            }
        }

        if (cohort && category && FEE_MATRIX[category] && FEE_MATRIX[category][cohort]) {
            const rates = FEE_MATRIX[category][cohort];
            const fee = isDiscounted ? rates.member : rates.standard;
            currentCalculatedFee = fee;

            const formattedFee = `₹${fee.toLocaleString('en-IN')}`;
            calculatedFeeDisplay.textContent = formattedFee;
            if (btnFeeDisplay) btnFeeDisplay.textContent = formattedFee;

            // Dynamically update Live Scannable UPI QR Code image
            if (upiQrImage) {
                const upiUrl = `upi://pay?pa=564720110000688@bkido&pn=PRINCIPAL%20UCE%20OSMANIA%20UNIVERSITY%20FASMI&am=${fee}&cu=INR&tn=FASMI2026%20REG`;
                upiQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}&margin=4`;
            }

            if (summaryCohortText) {
                const discountLabel = isDiscounted ? ' (Preferential / Member Rate)' : ' (Standard Rate)';
                summaryCohortText.textContent = `${cohort} Cohort • ${category}${discountLabel}`;
            }
        } else {
            currentCalculatedFee = null;
            calculatedFeeDisplay.textContent = '--';
            if (btnFeeDisplay) btnFeeDisplay.textContent = '₹--';
            if (summaryCohortText) {
                summaryCohortText.textContent = 'Please select your region & category above';
            }
        }
    }

    if (regionalCohortSelect) regionalCohortSelect.addEventListener('change', updateFeeCalculation);
    if (attendeeCategorySelect) attendeeCategorySelect.addEventListener('change', updateFeeCalculation);
    if (isMemberDiscountCheckbox) isMemberDiscountCheckbox.addEventListener('change', updateFeeCalculation);

    // Initial fee calculation trigger on page load
    updateFeeCalculation();

    // File Selection preview
    if (proofFileInput && fileInfo) {
        proofFileInput.addEventListener('change', () => {
            if (proofFileInput.files && proofFileInput.files[0]) {
                const file = proofFileInput.files[0];
                fileInfo.style.display = 'inline-block';
                fileInfo.innerHTML = `<i class="fas fa-file-circle-check"></i> Selected: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
            } else {
                fileInfo.style.display = 'none';
                fileInfo.textContent = '';
            }
        });
    }

    // Helper to convert file to base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve({ base64: '', name: '', type: '' });
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve({
                base64: reader.result,
                name: file.name,
                type: file.type
            });
            reader.onerror = error => reject(error);
        });
    }

    // Close Success Modal Event Listener
    if (closeSuccessBtn && successModal) {
        closeSuccessBtn.addEventListener('click', () => {
            successModal.style.display = 'none';
            window.location.href = 'index.html';
        });
    }

    // ┌──────────────────────────────────────────────────────────┐
    // │  IMPORTANT: Google Apps Script Web App URL               │
    // └──────────────────────────────────────────────────────────┘
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyrodpAcLZKFnQhDHN1MkUVWT4aEwtsasCoZVbhSqQ00T35tgzqggT5fpZo7om38cX4VQ/exec';

    // ── Direct Form Submit Handler ──
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Validate mandatory fields
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const country = document.getElementById('country').value.trim();
            const organization = document.getElementById('organization').value.trim();
            const designation = document.getElementById('designation').value.trim();
            const regionalCohort = regionalCohortSelect ? regionalCohortSelect.value : '';
            const attendeeCategory = attendeeCategorySelect ? attendeeCategorySelect.value : '';
            const isMemberDiscount = isMemberDiscountCheckbox ? isMemberDiscountCheckbox.checked : false;
            const paymentMode = document.getElementById('paymentMode') ? document.getElementById('paymentMode').value : '';
            const transactionRef = document.getElementById('transactionRef') ? document.getElementById('transactionRef').value.trim() : '';
            const paymentDate = document.getElementById('paymentDate') ? document.getElementById('paymentDate').value : '';
            const dietaryNeeds = document.getElementById('dietaryNeeds') ? document.getElementById('dietaryNeeds').value.trim() : '';
            const receiptFileInput = document.getElementById('receiptFile');

            if (!fullName || !email || !phone || !country || !organization || !designation || !regionalCohort || !attendeeCategory || !paymentMode || !transactionRef || !paymentDate) {
                showRegMessage('Please fill in all mandatory fields marked with an asterisk (*).', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showRegMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Verification proof check if member rate claimed
            if (isMemberDiscount && proofFileInput && (!proofFileInput.files || proofFileInput.files.length === 0)) {
                showRegMessage('Please upload your institutional ID or membership proof to claim the preferential rate.', 'error');
                return;
            }

            if (!currentCalculatedFee) {
                showRegMessage('Please select your region and category to determine the conference fee.', 'error');
                return;
            }

            // Submit Process
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting & Verifying Registration...';

            try {
                // Read proof file if provided
                let proofFileObj = { base64: '', name: '' };
                if (proofFileInput && proofFileInput.files && proofFileInput.files[0]) {
                    proofFileObj = await fileToBase64(proofFileInput.files[0]);
                }

                // Read receipt file if provided
                let receiptFileObj = { base64: '', name: '' };
                if (receiptFileInput && receiptFileInput.files && receiptFileInput.files[0]) {
                    receiptFileObj = await fileToBase64(receiptFileInput.files[0]);
                }

                const randomToken = Math.floor(100000 + Math.random() * 900000);
                const registrationId = `FASMI-2026-REG-${randomToken}`;

                const payload = {
                    formType: 'registration',
                    timestamp: new Date().toISOString(),
                    registrationId: registrationId,
                    fullName: fullName,
                    email: email,
                    phone: phone,
                    country: country,
                    organization: organization,
                    designation: designation,
                    regionalCohort: regionalCohort,
                    attendeeCategory: attendeeCategory,
                    isMemberDiscount: isMemberDiscount ? 'Yes (Discounted Rate)' : 'No (Standard Rate)',
                    calculatedFee: `₹${currentCalculatedFee}`,
                    paymentStatus: 'Submitted (Verification Pending)',
                    paymentMode: paymentMode,
                    transactionRef: transactionRef,
                    paymentDate: paymentDate,
                    dietaryNeeds: dietaryNeeds || 'None',
                    proofFileName: proofFileObj.name || 'None',
                    proofFileData: proofFileObj.base64 || '',
                    receiptFileName: receiptFileObj.name || 'None',
                    receiptFileData: receiptFileObj.base64 || ''
                };

                // Post to Google Sheets
                if (GOOGLE_SHEETS_URL) {
                    await fetch(GOOGLE_SHEETS_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify(payload)
                    });
                }

                // Populate Success Modal / E-Badge Receipt
                if (receiptName) receiptName.textContent = fullName;
                if (receiptRegId) receiptRegId.textContent = registrationId;
                if (receiptCategory) receiptCategory.textContent = `${regionalCohort} • ${attendeeCategory}`;
                if (receiptAmount) receiptAmount.textContent = `₹${currentCalculatedFee.toLocaleString('en-IN')} INR`;
                if (receiptGatewayRef) receiptGatewayRef.textContent = transactionRef;
                if (receiptDate) receiptDate.textContent = paymentDate;

                // Show Success Modal
                if (successModal) successModal.style.display = 'flex';

                // Reset Form
                regForm.reset();
                updateFeeCalculation();
                if (fileInfo) {
                    fileInfo.style.display = 'none';
                    fileInfo.textContent = '';
                }
                showRegMessage('✓ Registration submitted successfully! Your details have been recorded.', 'success');
            } catch (err) {
                console.error('Registration Submission Error:', err);
                showRegMessage('A network error occurred. Please try again or email fasmi2026@gmail.com.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-circle-check"></i> Complete & Submit Registration (<span id="btnFeeDisplay">₹--</span>)';
                updateFeeCalculation();
            }
        });
    }

    function showRegMessage(text, type) {
        if (!formMessage) return;
        formMessage.textContent = text;
        formMessage.className = 'form-message ' + type;
        formMessage.style.display = 'block';
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    // ── Interactive Schedule & Agenda System ──
    const scheduleDayBtns = document.querySelectorAll('.schedule-day-btn');
    const timelineDayPanels = document.querySelectorAll('.timeline-day-panel');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('scheduleSearchInput');
    const printBtn = document.getElementById('printScheduleBtn');
    const viewModeBtn = document.getElementById('viewModeBtn');
    const timelineContainer = document.querySelector('.timeline-container');

    if (viewModeBtn && timelineContainer) {
        viewModeBtn.addEventListener('click', () => {
            timelineContainer.classList.toggle('compact-mode');
            const isCompact = timelineContainer.classList.contains('compact-mode');
            viewModeBtn.innerHTML = isCompact 
                ? '<i class="fas fa-list-ul"></i> Detailed View'
                : '<i class="fas fa-bars-staggered"></i> Compact View';
        });
    }

    if (scheduleDayBtns.length > 0) {
        scheduleDayBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetDay = btn.getAttribute('data-day');

                scheduleDayBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                timelineDayPanels.forEach(panel => {
                    if (targetDay === 'all' || panel.id === 'day-' + targetDay) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });

                applyScheduleFilters();
            });
        });
    }

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyScheduleFilters();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyScheduleFilters();
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    function applyScheduleFilters() {
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const selectedCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const visiblePanels = document.querySelectorAll('.timeline-day-panel.active');
        visiblePanels.forEach(panel => {
            const items = panel.querySelectorAll('.agenda-item');
            items.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                const textContent = item.textContent.toLowerCase();

                const matchesCategory = (selectedCategory === 'all' || itemCategory === selectedCategory);
                const matchesSearch = (!searchTerm || textContent.includes(searchTerm));

                if (matchesCategory && matchesSearch) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

});


