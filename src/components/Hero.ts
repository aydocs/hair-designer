export const renderHero = (): string => {
    return `
        <section class="relative h-[80vh] flex items-center justify-center bg-brand-gray-900 text-brand-white overflow-hidden">
            <!-- Background Image with Overlay -->
            <div class="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                     alt="Hair Salon" 
                     class="w-full h-full object-cover opacity-40 grayscale" />
                <div class="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent"></div>
            </div>

            <!-- Content -->
            <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h1 class="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
                    Tarzınızı <br/> <span class="text-brand-gray-300">Yeniden Keşfedin</span>
                </h1>
                <p class="text-lg md:text-xl text-brand-gray-300 mb-10 max-w-2xl mx-auto font-light">
                    Modern kesimler, profesyonel bakım ve size özel stil danışmanlığı.
                </p>
                <div class="flex flex-col md:flex-row items-center justify-center gap-4">
                    <a href="#booking" class="btn-primary min-w-[200px] shadow-lg shadow-brand-gray-900/50">
                        Hemen Randevu Al
                    </a>
                    <a href="#services" class="btn-secondary min-w-[200px] bg-transparent text-white border-white hover:bg-white hover:text-black">
                        Hizmetleri İncele
                    </a>
                </div>
            </div>
        </section>
    `;
};
