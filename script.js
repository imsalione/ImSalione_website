// Function to update all translatable elements
function updateContentLanguage(lang) {
    document.querySelectorAll('[data-en][data-fa]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });

    // Update flags and text for desktop
    const langIconDesktop = document.getElementById('langIcon');
    const langTextDesktop = document.getElementById('langText');
    if (langIconDesktop && langTextDesktop) {
        if (lang === 'en') {
            langIconDesktop.innerHTML = '🇺🇸';
            langTextDesktop.textContent = langTextDesktop.getAttribute('data-en');
        } else {
            langIconDesktop.innerHTML = '🇮🇷';
            langTextDesktop.textContent = langTextDesktop.getAttribute('data-fa');
        }
    }

    // Update language text for mobile settings menu
    const langTextMobile = document.getElementById('langTextMobile');
    if (langTextMobile) {
        if (lang === 'en') {
            langTextMobile.textContent = 'English (🇺🇸)';
        } else {
            langTextMobile.textContent = 'فارسی (🇮🇷)';
        }
    }

    // Update theme text for desktop
    const themeTextDesktop = document.getElementById('themeText');
    if (themeTextDesktop) {
        const currentTheme = document.body.getAttribute('data-theme');
        // This is the label for the theme user can switch TO
        if (lang === 'en') {
            themeTextDesktop.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
        } else { // 'fa'
            themeTextDesktop.textContent = currentTheme === 'dark' ? 'روشن' : 'تاریک';
        }
    }

    // Update mobile bottom nav labels (includes mobile settings toggle)
    document.querySelectorAll('.mobile-nav-link .label, .mobile-nav-toggle-btn .label').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });

    // Update body direction
    document.body.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    
    // Dispatch a custom event after language change for other components to react (like skill description)
    document.dispatchEvent(new CustomEvent('languageChange'));
}

// Function to update theme labels based on current theme and language
function updateThemeDisplay(theme) {
    const isDark = theme === 'dark';

    // Desktop: show label for the theme user can switch TO
    const themeTextDesktop = document.getElementById('themeText');
    if (themeTextDesktop) {
        if (currentLang === 'en') {
            themeTextDesktop.textContent = isDark ? 'Light' : 'Dark';
        } else {
            themeTextDesktop.textContent = isDark ? 'روشن' : 'تاریک';
        }
    }

    // Mobile Settings Menu: show label for the theme user can switch TO
    const mobileThemeText = document.getElementById('mobileThemeText');
    const mobileThemeIcon = document.querySelector('#mobileThemeToggle .icon');
    if (mobileThemeText) {
        if (currentLang === 'en') {
            mobileThemeText.textContent = isDark ? 'Light' : 'Dark';
        } else {
            mobileThemeText.textContent = isDark ? 'روشن' : 'تاریک';
        }
    }

    // Update mobile theme icon to show the icon of the current theme
    if (mobileThemeIcon) {
        // Find existing icons and switch their visibility
        const sun = mobileThemeIcon.querySelector('.fa-sun');
        const moon = mobileThemeIcon.querySelector('.fa-moon');
        if (sun && moon) {
            // Toggle visibility to show the icon of the *current* theme
            if (isDark) {
                sun.style.display = 'none';
                moon.style.display = 'inline-block';
            } else {
                sun.style.display = 'inline-block';
                moon.style.display = 'none';
            }
        }
    }
}


// Language system initialization
let currentLang = 'en'; // Default language
if (localStorage.getItem('lang')) {
    currentLang = localStorage.getItem('lang');
}
updateContentLanguage(currentLang);

// Desktop Language Toggle
const langToggleDesktop = document.getElementById('langToggle');
if (langToggleDesktop) {
    langToggleDesktop.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'fa' : 'en';
        localStorage.setItem('lang', currentLang);
        updateContentLanguage(currentLang);
    });
}

// Mobile Language Toggle (inside Settings Menu)
const langToggleMobile = document.getElementById('langToggleMobile');
if (langToggleMobile) {
    langToggleMobile.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'fa' : 'en';
        localStorage.setItem('lang', currentLang);
        updateContentLanguage(currentLang);
    });
}

// Theme system initialization
let currentTheme = 'dark'; // Default theme
if (localStorage.getItem('theme')) {
    currentTheme = localStorage.getItem('theme');
}
document.body.setAttribute('data-theme', currentTheme);
updateThemeDisplay(currentTheme);

// Desktop Theme Toggle
const themeToggleDesktop = document.getElementById('themeToggle');
if (themeToggleDesktop) {
    themeToggleDesktop.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeDisplay(currentTheme);
    });
}

// Mobile Theme Toggle (inside Settings Menu)
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeDisplay(currentTheme);
    });
}

// Mobile Settings Menu Toggle
const mobileSettingsToggle = document.getElementById('mobileSettingsToggle');
const mobileSettingsMenu = document.getElementById('mobileSettingsMenu');
const closeSettingsMenu = document.getElementById('closeSettingsMenu');

function toggleMobileSettingsMenu() {
    mobileSettingsMenu.classList.toggle('visible');
}

if (mobileSettingsToggle) {
    mobileSettingsToggle.addEventListener('click', toggleMobileSettingsMenu);
}
if (closeSettingsMenu) {
    closeSettingsMenu.addEventListener('click', toggleMobileSettingsMenu);
}
// Close menu if a settings option is clicked (for better UX)
document.querySelectorAll('#mobileSettingsMenu .menu-item').forEach(item => {
    item.addEventListener('click', () => {
        // Timeout ensures the theme/lang change has visual effect before closing
        setTimeout(toggleMobileSettingsMenu, 200); 
    });
});


// Floating Back to Top button visibility (Language toggle removed)
const backToTop = document.getElementById('backToTop');
const floatingControls = document.querySelector('.floating-controls');

window.addEventListener('scroll', () => {
    // Check if floatingControls exists before trying to access classList
    if (floatingControls) {
        if (window.pageYOffset > 500) {
            floatingControls.classList.add('visible');
        } else {
            floatingControls.classList.remove('visible');
        }
    }
});

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth scrolling for both desktop and mobile navigation links
document.querySelectorAll('a[href^="#"], .mobile-nav-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Remove active class from all mobile nav links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Add active class to the clicked link
            // Note: IntersectionObserver will handle active state dynamically, but this adds it immediately on click
            this.classList.add('active');
        }
    });
});

// Highlight active mobile nav link based on scroll position
const sections = document.querySelectorAll('section');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            mobileNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-target-section') === entry.target.id) {
                    link.classList.add('active');
                }
            });
        }
    });
}, {
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
});

sections.forEach(section => {
    sectionObserver.observe(section);
});

// Navbar scroll effect (Desktop Only)
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar && window.getComputedStyle(navbar).display !== 'none') { // Check if navbar exists and is visible (desktop)
        if (window.pageYOffset > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Intersection Observer for animations (existing animations)
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const contentObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            contentObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.section-title, .about-content, .contact-card, .timeline-item').forEach(el => {
    contentObserver.observe(el);
});

// Stagger animation for contact cards
const contactCards = document.querySelectorAll('.contact-card');
contactCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.2}s`;
});

// Initial active state for mobile nav link (Home by default)
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active state for Home link in mobile nav
    const homeNavLink = document.querySelector('.mobile-nav-link[data-target-section="home"]');
    if (homeNavLink) {
        // Ensure only 'Home' is active on load before scroll observers take over
        document.querySelectorAll('.mobile-nav-link').forEach(link => link.classList.remove('active'));
        homeNavLink.classList.add('active');
    }

    // Initialize CV sections visibility
    document.getElementById('education-section').classList.add('active');
    // Ensure the hidden section starts in the correct off-screen position based on initial direction
    document.getElementById('workhistory-section').style.transform = `translateX(${document.body.getAttribute('dir') === 'rtl' ? '-' : ''}100%)`;
});

// Skill Description Toggle Data
const skillDescriptions = {
    python: {
        en: "Proficient in Python for data manipulation, analysis, and building backend applications. Experienced with libraries like Pandas, NumPy, Scikit-learn, and FastAPI.",
        fa: "مسلط به پایتون برای دستکاری، تحلیل داده و ساخت برنامه‌های بک‌اند. تجربه کار با کتابخانه‌هایی مانند Pandas، NumPy، Scikit-learn و FastAPI."
    },
    django: {
        en: "Skilled in Django framework for rapid development of robust web applications and APIs, with a focus on database integration and scalable architecture.",
        fa: "ماهر در فریم‌ورک جنگو برای توسعه سریع برنامه‌های وب قوی و APIها، با تمرکز بر ادغام پایگاه داده و معماری مقیاس‌پذیر."
    },
    sql: {
        en: "Expert in SQL for database querying, management, and optimization. Experienced with various relational database systems like PostgreSQL, MySQL, and SQL Server.",
        fa: "متخصص در SQL برای کوئری‌نویسی، مدیریت و بهینه‌سازی پایگاه داده. تجربه کار با سیستم‌های مختلف پایگاه داده رابطه‌ای مانند PostgreSQL، MySQL و SQL Server."
    },
    excel: {
        en: "Advanced Excel user for complex data modeling, reporting, and visualization, including Power Query, Power Pivot, and VBA for automation.",
        fa: "کاربر پیشرفته اکسل برای مدل‌سازی پیچیده داده، گزارش‌دهی و تجسم، شامل Power Query، Power Pivot و VBA برای اتوماسیون."
    },
    powerbi: {
        en: "Experienced in creating interactive dashboards and reports with Power BI, transforming raw data into meaningful and actionable business insights.",
        fa: "تجربه در ایجاد داشبوردها و گزارش‌های تعاملی با Power BI، تبدیل داده‌های خام به بینش‌های کسب‌وکاری معنادار و عملی."
    },
    dataengineering: {
        en: "Building and maintaining scalable data pipelines, ETL processes, and data warehousing solutions to ensure data availability, reliability, and quality.",
        fa: "ساخت و نگهداری خطوط لوله داده مقیاس‌پذیر، فرآیندهای ETL و راه‌حل‌های انبار داده برای اطمینان از دسترسی، قابلیت اطمینان و کیفیت داده."
    },
    machinelearning: {
        en: "Fundamental understanding of machine learning algorithms and their application in predictive modeling, classification, and clustering tasks.",
        fa: "درک اساسی از الگوریتم‌های یادگیری ماشین و کاربرد آن‌ها در مدل‌سازی پیش‌بینی، طبقه‌بندی و خوشه‌بندی."
    },
    datavisualization: {
        en: "Designing compelling and informative data visualizations using various tools and techniques to communicate complex data stories effectively.",
        fa: "طراحی تجسم‌های داده‌ای جذاب و آموزنده با استفاده از ابزارها و تکنیک‌های مختلف برای انتقال موثر داستان‌های داده پیچیده."
    }
};

const skillTags = document.querySelectorAll('.skill-tag');
const skillDescriptionDiv = document.getElementById('skillDescription');
let activeSkill = null;

skillTags.forEach(tag => {
    tag.addEventListener('click', () => {
        const skill = tag.getAttribute('data-skill');
        const isRTL = document.body.getAttribute('dir') === 'rtl';

        // Toggle active class on skill tags
        if (tag.classList.contains('active')) {
            tag.classList.remove('active');
            skillDescriptionDiv.classList.remove('active');
            activeSkill = null;
        } else {
            skillTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            activeSkill = skill;

            // Update description content and show
            skillDescriptionDiv.textContent = skillDescriptions[skill][currentLang];
            skillDescriptionDiv.classList.add('active');
        }
    });
});

// Update skill description when language changes
document.addEventListener('languageChange', () => {
    if (activeSkill) {
        skillDescriptionDiv.textContent = skillDescriptions[activeSkill][currentLang];
    }
});


// CV Section Toggle (Education vs Work History)
const cvToggleButtons = document.querySelectorAll('.cv-toggle-btn');
const educationSection = document.getElementById('education-section');
const workHistorySection = document.getElementById('workhistory-section');
const cvSectionsWrapper = document.querySelector('.cv-sections-wrapper');

cvToggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const target = button.getAttribute('data-target');
        const isRTL = document.body.getAttribute('dir') === 'rtl';

        // Update active button state
        cvToggleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        if (target === 'education') {
            // Animate work history out (to the right in LTR, to the left in RTL), then animate education in
            workHistorySection.style.transform = `translateX(${isRTL ? '100%' : '-100%'})`;
            workHistorySection.style.opacity = '0';

            // Use a small delay to ensure the outgoing animation starts before the incoming one
            setTimeout(() => {
                educationSection.style.transform = `translateX(0)`;
                educationSection.style.opacity = '1';
                educationSection.classList.add('active');
                workHistorySection.classList.remove('active');
            }, 500); // Should match transition duration

        } else { // target === 'workhistory'
            // Animate education out (to the left in LTR, to the right in RTL), then animate work history in
            educationSection.style.transform = `translateX(${isRTL ? '-100%' : '100%'})`;
            educationSection.style.opacity = '0';

            setTimeout(() => {
                workHistorySection.style.transform = `translateX(0)`;
                workHistorySection.style.opacity = '1';
                workHistorySection.classList.add('active');
                educationSection.classList.remove('active');
            }, 500);
        }
    });
});

// Get modal elements
const profileModal = document.getElementById('profileModal');
const profilePictureThumbnail = document.getElementById('profilePictureThumbnail');
const profileModalName = document.getElementById('profileModalName');

// Function to open the modal
function openProfileModal() {
    // Update name based on current language before opening
    const lang = currentLang;
    if (profileModalName) {
        profileModalName.textContent = profileModalName.getAttribute(`data-${lang}`);
    }
    
    // Open modal
    if (profileModal) {
        profileModal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
        profileModal.style.display = 'flex'; // Make it visible for transition
    }
}

// Function to close the modal
function closeProfileModal() {
    if (profileModal) {
        profileModal.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
        // Use a timeout to fully hide after transition
        setTimeout(() => {
            profileModal.style.display = 'none';
        }, 300); 
    }
}

// Event listener to open modal on thumbnail click
if (profilePictureThumbnail) {
    profilePictureThumbnail.addEventListener('click', openProfileModal);
}

// Event listener to close modal when clicking outside the modal-content (on the overlay)
if (profileModal) {
    profileModal.addEventListener('click', (e) => {
        // Only close if the click is directly on the modal container itself (the overlay)
        if (e.target.id === 'profileModal') {
            closeProfileModal();
        }
    });
}

// Update modal name on language change (hook into existing logic - find the languageChange event listener)
document.addEventListener('languageChange', () => {
    // ... existing language update logic for other elements ...
    
    // NEW: Update profile modal name on language change
    if (profileModalName) {
        const lang = currentLang;
        profileModalName.textContent = profileModalName.getAttribute(`data-${lang}`);
    }
});

// Email Link Security (Anti-Spam Bot) Logic
const emailContactLink = document.getElementById('emailContactLink');

if (emailContactLink) {
    emailContactLink.addEventListener('click', function(event) {
        event.preventDefault();

        const part1 = 'salehabedinezhad'; 
        const part2 = 'gmail';
        const part3 = 'com';
        const email = part1 + '@' + part2 + '.' + part3;

        window.location.href = 'mailto:' + email;
    });
}