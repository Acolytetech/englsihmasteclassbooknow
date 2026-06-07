document.addEventListener("DOMContentLoaded", () => {
    // 1. Accordion Interactivity
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
        const header = item.querySelector(".faq-header");
        const content = item.querySelector(".faq-content");
        
        header.addEventListener("click", () => {
            const isOpen = item.classList.contains("active");
            
            // Close other open FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains("active")) {
                    otherItem.classList.remove("active");
                    otherItem.querySelector(".faq-content").style.maxHeight = null;
                }
            });
            
            // Toggle current item
            if (isOpen) {
                item.classList.remove("active");
                content.style.maxHeight = null;
            } else {
                item.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // 2. Persisted Scarcity Countdown Timer
    const countdownTimeKey = "elite_talkers_timer_expiry";
    let targetTime = localStorage.getItem(countdownTimeKey);
    
    // If no target time exists, set it to 14 minutes and 32 seconds from now (highly specific timing boosts trust)
    if (!targetTime) {
        const durationMs = (14 * 60 + 32) * 1000;
        targetTime = Date.now() + durationMs;
        localStorage.setItem(countdownTimeKey, targetTime);
    } else {
        targetTime = parseInt(targetTime, 10);
        // If the saved target time has already expired, reset it to a new 15-minute window
        if (targetTime < Date.now()) {
            const durationMs = (14 * 60 + 32) * 1000;
            targetTime = Date.now() + durationMs;
            localStorage.setItem(countdownTimeKey, targetTime);
        }
    }

    function updateTimers() {
        const now = Date.now();
        let diff = targetTime - now;

        // Reset if expired while page is open
        if (diff <= 0) {
            const durationMs = (14 * 60 + 32) * 1000;
            targetTime = now + durationMs;
            localStorage.setItem(countdownTimeKey, targetTime);
            diff = durationMs;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const paddedHours = String(hours).padStart(2, "0");
        const paddedMinutes = String(minutes).padStart(2, "0");
        const paddedSeconds = String(seconds).padStart(2, "0");

        // Update main page timer values
        document.querySelectorAll(".timer-hours").forEach(el => el.textContent = paddedHours);
        document.querySelectorAll(".timer-minutes").forEach(el => el.textContent = paddedMinutes);
        document.querySelectorAll(".timer-seconds").forEach(el => el.textContent = paddedSeconds);

        // Update sticky bottom bar timer values
        const stickyTimerVal = document.getElementById("sticky-timer-val");
        if (stickyTimerVal) {
            stickyTimerVal.textContent = `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
        }
    }

    updateTimers();
    setInterval(updateTimers, 1000);

    // 3. Sticky Bottom CTA Bar Visibility Logic
    const stickyBar = document.getElementById("sticky-bar");
    const heroCta = document.getElementById("hero-cta");

    window.addEventListener("scroll", () => {
        if (!stickyBar || !heroCta) return;

        const heroCtaBottom = heroCta.getBoundingClientRect().bottom + window.scrollY;
        const currentScroll = window.scrollY;

        // If user scrolled past the hero CTA button, display the sticky bottom bar
        if (currentScroll > heroCtaBottom) {
            stickyBar.classList.add("visible");
        } else {
            stickyBar.classList.remove("visible");
        }
    });

    // 4. Media Lightbox Modal system
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxIframe = document.getElementById("lightbox-iframe");
    const lightboxClose = document.getElementById("lightbox-close");

    if (lightbox && lightboxClose) {
        // Close modal helper
        const closeLightbox = () => {
            lightbox.classList.remove("active");
            // Zero out iframe src to stop audio/video playing in background
            lightboxIframe.src = "";
            lightboxIframe.style.display = "none";
            lightboxImg.src = "";
            lightboxImg.style.display = "none";
            document.body.style.overflow = ""; // restore scrolling
        };

        lightboxClose.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Trigger Lightbox for Video Testimonial Grid
        const testimonialThumbtails = document.querySelectorAll(".thumb-container");
        testimonialThumbtails.forEach(thumb => {
            thumb.addEventListener("click", () => {
                const videoUrl = thumb.getAttribute("data-video-url");
                if (videoUrl) {
                    lightboxIframe.src = videoUrl + "?autoplay=1&rel=0";
                    lightboxIframe.style.display = "block";
                    lightboxImg.style.display = "none";
                    lightbox.classList.add("active");
                    document.body.style.overflow = "hidden"; // disable scrolling
                }
            });
        });

        // Trigger Lightbox for zoomable images (like steps)
        const zoomImages = document.querySelectorAll(".zoomable-image");
        zoomImages.forEach(wrapper => {
            wrapper.addEventListener("click", () => {
                const img = wrapper.querySelector("img");
                if (img) {
                    lightboxImg.src = img.src;
                    lightboxImg.style.display = "block";
                    lightboxIframe.style.display = "none";
                    lightbox.classList.add("active");
                    document.body.style.overflow = "hidden"; // disable scrolling
                }
            });
        });
    }

    // 5. Stat Counter Count-up on Scroll (Desktop only)
    const statNumbers = document.querySelectorAll(".stat-number");
    console.log("Stat Counter initialized. Elements found:", statNumbers.length);
    
    // Indian number formatting helper (e.g., 2,49,497)
    function formatIndianNumber(num) {
        let x = Math.floor(num).toString();
        if (x.length <= 3) return x;
        let lastThree = x.substring(x.length - 3);
        let otherNumbers = x.substring(0, x.length - 3);
        let res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
        return res;
    }

    const observerOptions = {
        threshold: 0.05
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            console.log("Observer entry intersecting:", entry.isIntersecting);
            if (entry.isIntersecting) {
                console.log("Triggering count-up animation!");
                startCounting();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const trustBanner = document.querySelector(".trust-banner");
    if (trustBanner && statNumbers.length > 0) {
        console.log("Observing trust banner...");
        statsObserver.observe(trustBanner);
    } else {
        console.log("Observing trust banner failed. Banner found:", !!trustBanner);
    }

    function startCounting() {
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute("data-target"));
            const decimals = parseInt(stat.getAttribute("data-decimals") || "0", 10);
            const suffix = stat.getAttribute("data-suffix") || "";
            const isIndian = stat.getAttribute("data-format") === "indian";
            const duration = 1800; // 1.8 seconds animation
            const startTime = performance.now();
            console.log(`Stat counter starting for target: ${target}, isIndian: ${isIndian}`);

            function updateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out quad
                const easeProgress = progress * (2 - progress);
                const currentValue = easeProgress * target;
                
                let formattedValue = "";
                if (isIndian) {
                    formattedValue = formatIndianNumber(currentValue);
                } else if (decimals > 0) {
                    formattedValue = currentValue.toFixed(decimals);
                } else {
                    formattedValue = Math.floor(currentValue).toString();
                }
                
                stat.textContent = formattedValue + suffix;
                
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    // Set final exact values
                    let finalValue = "";
                    if (isIndian) {
                        finalValue = formatIndianNumber(target);
                    } else if (decimals > 0) {
                        finalValue = target.toFixed(decimals);
                    } else {
                        finalValue = target.toString();
                    }
                    stat.textContent = finalValue + suffix;
                    console.log(`Stat counter complete for target: ${target}`);
                }
            }
            
            requestAnimationFrame(updateNumber);
        });
    }
});
