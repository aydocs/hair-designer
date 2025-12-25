import { renderHeader, initMobileMenu } from '../components/Header';
import { renderHero } from '../components/Hero';
import { renderFooter } from '../components/Footer';
import { API_BASE_URL } from '../config';

export const renderHome = async (app: HTMLElement, router: any) => {
    app.innerHTML = `
        <div class="min-h-screen flex flex-col bg-black overflow-x-hidden">
            ${renderHeader()}
            <main class="flex-grow">
                ${renderHero()}
                
                <!-- Intro / Quick Links Section -->
                <section class="py-20 bg-brand-black border-t border-brand-gray-800 text-center">
                    <div class="container mx-auto px-4">
                        <h2 class="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Tarzınızı Yansıtan Dokunuşlar</h2>
                        <p class="text-brand-gray-400 max-w-2xl mx-auto mb-12 text-lg">
                            Modern kesimler, profesyonel bakım ve size özel tasarımlar için doğru adrestesiniz.
                        </p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <a href="/services" class="group block bg-brand-gray-900 p-8 rounded-2xl border border-brand-gray-800 hover:border-white transition-all duration-300 transform hover:-translate-y-2" data-navigo>
                                <div class="w-16 h-16 bg-brand-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                                    <i class="fas fa-cut text-2xl"></i>
                                </div>
                                <h3 class="text-xl font-bold text-white mb-2">Hizmetlerimiz</h3>
                                <p class="text-brand-gray-500 text-sm">Geniş hizmet yelpazemizi inceleyin.</p>
                            </a>

                            <a href="/booking" class="group block bg-white p-8 rounded-2xl border border-white hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-2 text-black" data-navigo>
                                <div class="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 text-white transition-colors">
                                    <i class="far fa-calendar-alt text-2xl"></i>
                                </div>
                                <h3 class="text-xl font-bold mb-2">Randevu Al</h3>
                                <p class="text-gray-600 text-sm">Size uygun saati hemen ayırtın.</p>
                            </a>

                            <a href="/contact" class="group block bg-brand-gray-900 p-8 rounded-2xl border border-brand-gray-800 hover:border-white transition-all duration-300 transform hover:-translate-y-2" data-navigo>
                                <div class="w-16 h-16 bg-brand-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                                    <i class="fas fa-map-marker-alt text-2xl"></i>
                                </div>
                                <h3 class="text-xl font-bold text-white mb-2">İletişim</h3>
                                <p class="text-brand-gray-500 text-sm">Adres ve iletişim bilgilerimiz.</p>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Customer Reviews Section -->
                <section class="py-20 bg-brand-black border-t border-brand-gray-800 text-center">
                    <div class="container mx-auto px-4">
                        <h2 class="text-3xl md:text-4xl font-serif font-bold text-white mb-12">Müşteri Yorumları</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center" id="reviews-container">
                            <div class="col-span-full text-brand-gray-500 py-10">Yorumlar yükleniyor...</div>
                        </div>
                        
                        <div class="mt-12">
                            <a href="/reviews" data-navigo class="inline-block border border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-300 font-bold tracking-wide">
                                TÜM YORUMLARI GÖR
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            
            ${renderFooter()}
        </div>
    `;

    // Initialize Mobile Menu
    initMobileMenu();

    // Fetch and Render Reviews
    try {
        const res = await fetch(`https://hair-designer.onrender.com/api/reviews`);
        const reviews = await res.json();

        const container = app.querySelector('#reviews-container');
        if (container) {
            if (reviews.length === 0) {
                container.innerHTML = '<div class="col-span-full text-brand-gray-500 italic">Henüz yorum yapılmamış. İlk yorumu siz yapın!</div>';
            } else {
                container.innerHTML = reviews.slice(0, 3).map((r: any) => `
                    <div class="bg-brand-gray-900 p-8 rounded-2xl border border-brand-gray-800 relative hover:border-yellow-500/30 transition-colors">
                        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-brand-black border border-brand-gray-700 rounded-full flex items-center justify-center text-yellow-500 shadow-lg">
                            <i class="fas fa-quote-left"></i>
                        </div>
                        <div class="mb-4 text-yellow-500 text-sm tracking-widest">
                            ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                        </div>
                        <p class="text-brand-gray-300 italic mb-6 leading-relaxed">"${r.comment}"</p>
                        <h5 class="text-white font-bold font-serif">${r.customerName}</h5>
                        <span class="text-brand-gray-600 text-xs uppercase tracking-wider">${r.date}</span>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.error('Failed to load reviews', e);
        const container = app.querySelector('#reviews-container');
        if (container) container.innerHTML = '<div class="col-span-full text-red-500">Yorumlar yüklenemedi.</div>';
    }
};
