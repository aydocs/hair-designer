import { renderHeader, initMobileMenu } from '../components/Header';
import { renderFooter } from '../components/Footer';
import { API_BASE_URL } from '../config';

export const renderAllReviewsPage = async (app: HTMLElement, router: any) => {
    app.innerHTML = `
        <div class="min-h-screen flex flex-col bg-brand-black">
            ${renderHeader()}
            <main class="flex-grow pt-10 pb-20">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-12">
                         <h1 class="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Müşteri Yorumları</h1>
                         <p class="text-brand-gray-400 max-w-2xl mx-auto">Tüm değerli müşterilerimizin deneyimleri ve değerlendirmeleri.</p>
                    </div>

                    <div id="all-reviews-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div class="col-span-full text-center text-brand-gray-500 py-10">Yükleniyor...</div>
                    </div>
                </div>
            </main>
            ${renderFooter()}
        </div>
    `;

    initMobileMenu();

    try {
        const res = await fetch(`https://hair-designer.onrender.com/api/reviews`);
        const reviews = await res.json();

        const container = app.querySelector('#all-reviews-list');
        if (container) {
            if (reviews.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center text-brand-gray-500">Henüz yorum bulunmamaktadır.</div>';
            } else {
                container.innerHTML = reviews.map((r: any) => `
                    <div class="bg-brand-gray-900 p-8 rounded-2xl border border-brand-gray-800 shadow-xl hover:shadow-2xl hover:border-brand-gray-700 transition-all duration-300">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex text-yellow-500 text-sm">
                                ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                            </div>
                            <span class="text-brand-gray-600 text-xs">${r.date}</span>
                        </div>
                        <p class="text-brand-gray-300 mb-6 italic leading-relaxed">"${r.comment}"</p>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-brand-gray-800 flex items-center justify-center text-white font-bold">
                                ${r.customerName.charAt(0).toUpperCase()}
                            </div>
                            <h5 class="text-white font-bold text-sm">${r.customerName}</h5>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.error('Failed to load reviews', e);
        const container = app.querySelector('#all-reviews-list');
        if (container) container.innerHTML = '<div class="col-span-full text-center text-red-500">Yorumlar yüklenemedi.</div>';
    }
};
