export const renderHeader = (): string => {
    return `
        <header class="bg-black/95 backdrop-blur-sm text-white sticky top-0 z-[100] border-b border-brand-gray-800">
            <div class="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
                <!-- Logo -->
                <a href="/" class="text-xl md:text-3xl font-serif font-bold tracking-[0.1em] md:tracking-[0.2em] hover:text-brand-gray-300 transition-colors uppercase truncate" data-navigo>
                    Yusuf Tanık
                    <span class="block text-[0.6rem] md:text-xs font-sans font-light tracking-[0.3em] md:tracking-[0.5em] text-brand-gray-400 mt-1">Hair Designer</span>
                </a>

                <!-- Desktop Nav -->
                <nav class="hidden md:flex items-center space-x-8">
                    <a href="/" data-navigo class="text-white font-bold hover:text-brand-gold transition text-xs tracking-widest uppercase">Ana Sayfa</a>
                    <a href="/services" data-navigo class="text-white font-bold hover:text-brand-gold transition text-xs tracking-widest uppercase">Hizmetler</a>
                    <a href="/reviews" data-navigo class="text-white font-bold hover:text-brand-gold transition text-xs tracking-widest uppercase">Yorumlar</a>
                    <a href="/contact" data-navigo class="text-white font-bold hover:text-brand-gold transition text-xs tracking-widest uppercase">İletişim</a>
                    <a href="/booking" data-navigo class="bg-white text-black px-6 py-2 rounded-full font-bold shadow-lg text-xs tracking-widest uppercase flex items-center gap-2">
                        <i class="fas fa-calendar-alt"></i>
                        Randevu Al
                    </a>
                </nav>

                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden text-white text-2xl z-[102] relative focus:outline-none p-2">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </header>

        <!-- Mobile Menu Overlay (Moved Outside Header) -->
        <div id="mobile-menu" class="fixed inset-0 bg-black z-[101] transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col items-center justify-center overflow-hidden">
             <!-- Close Button (for UX) -->
             <div class="absolute top-6 right-4 z-[103] md:hidden">
                <!-- The hamburger in header controls this -->
             </div>

            <nav class="flex flex-col items-center gap-8 text-center p-6 w-full max-w-sm">
                <div class="flex flex-col gap-6 w-full">
                    <a href="/" data-navigo class="mobile-link text-2xl font-serif text-white hover:text-brand-gold transition-colors duration-300">Ana Sayfa</a>
                    <a href="/services" data-navigo class="mobile-link text-2xl font-serif text-white hover:text-brand-gold transition-colors duration-300">Hizmetler</a>
                    <a href="/reviews" data-navigo class="mobile-link text-2xl font-serif text-white hover:text-brand-gold transition-colors duration-300">Yorumlar</a>
                    <a href="/contact" data-navigo class="mobile-link text-2xl font-serif text-white hover:text-brand-gold transition-colors duration-300">İletişim</a>
                </div>
                
                <div class="w-full border-t border-brand-gray-800 pt-8 mt-4">
                    <a href="/booking" data-navigo class="mobile-link w-full block bg-white text-black px-6 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3">
                        <i class="fas fa-calendar-check"></i>
                        RANDEVU AL
                    </a>
                </div>
            </nav>
        </div>
    `;
};

export const initMobileMenu = () => {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.mobile-link');
    let isOpen = false;

    if (btn && menu) {
        const toggleMenu = () => {
            isOpen = !isOpen;
            const icon = btn.querySelector('i');

            if (isOpen) {
                // Open
                menu.classList.remove('translate-x-full');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                if (icon) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            } else {
                // Close
                menu.classList.add('translate-x-full');
                document.body.style.overflow = ''; // Restore scrolling
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        };

        btn.addEventListener('click', toggleMenu);

        // Close menu when a link is clicked
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (isOpen) toggleMenu();
            });
        });
    }
};
