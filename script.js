document.addEventListener('DOMContentLoaded', () => {
    // Sticky Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Scroll Reveal Animation
    function reveal() {
        var reveals = document.querySelectorAll(".reveal");
        for (var i = 0; i < reveals.length; i++) {
            var windowHeight = window.innerHeight;
            var elementTop = reveals[i].getBoundingClientRect().top;
            var elementVisible = 100;
            
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add("active");
            }
        }
    }
    
    window.addEventListener("scroll", reveal);
    reveal(); // Trigger on load

    // Counter Animation
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;

    function startCounters() {
        if (hasCounted) return;
        
        const statsSection = document.querySelector('.stats');
        if (!statsSection) return;
        
        const sectionTop = statsSection.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight) {
            hasCounted = true;
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                
                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target + (counter.getAttribute('data-plus') ? '+' : '');
                    }
                };
                updateCounter();
            });
        }
    }
    
    window.addEventListener("scroll", startCounters);
    startCounters(); // Trigger on load if in view

    // Contact form submission (Real Firebase integration with localStorage fallback)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.disabled = true;

            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim() || '';
            const serviceType = document.getElementById('serviceType').value;
            const message = document.getElementById('message').value.trim() || '';

            // Map frontend service to CRM requirements
            let type = 'Residential';
            let system = 'On-grid';
            if (serviceType === 'commercial') type = 'Commercial';
            if (serviceType === 'industrial') type = 'Industrial';
            if (serviceType === 'solarPump') { type = 'Industrial'; system = 'Off-grid'; }
            if (serviceType === 'evCharging') { type = 'Commercial'; system = 'Hybrid'; }

            const newLead = {
                id: 'LD-' + Math.floor(1000 + Math.random() * 9000),
                name: name,
                phone: phone,
                email: email,
                type: type,
                address: 'Submitted online via Quote Form',
                bill: 'TBD',
                load: '0',
                finalPrice: '0',
                system: system,
                status: 'New Lead',
                trackingStatus: 'Pending / New',
                notes: 'Interested Service: ' + serviceType + '. Details: ' + message,
                createdAt: new Date().toISOString().split('T')[0],
                createdBy: 'Website Form'
            };

            try {
                // Dynamically import Firebase modules
                const { db } = await import("./firebase-config.js");
                const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
                
                // Write directly to Firebase
                await setDoc(doc(db, "leads", newLead.id), newLead);
                console.log("Online Quote Lead saved to Firebase Firestore successfully.");

                // Update local storage fallback
                let localLeads = JSON.parse(localStorage.getItem('vpat_leads')) || [];
                localLeads.unshift(newLead);
                localStorage.setItem('vpat_leads', JSON.stringify(localLeads));
            } catch (err) {
                console.warn("Firebase online save failed, saving to local cache fallback:", err);
                let localLeads = JSON.parse(localStorage.getItem('vpat_leads')) || [];
                localLeads.unshift(newLead);
                localStorage.setItem('vpat_leads', JSON.stringify(localLeads));
            }
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Message Sent Successfully';
                btn.style.background = 'var(--green-accent)';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1000);
        });

        // Auto-select service from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam = urlParams.get('service');
        if (serviceParam) {
            const serviceSelect = document.getElementById('serviceType');
            if (serviceSelect) {
                const option = Array.from(serviceSelect.options).find(opt => opt.value === serviceParam);
                if (option) {
                    option.selected = true;
                }
            }
        }
    }
});
