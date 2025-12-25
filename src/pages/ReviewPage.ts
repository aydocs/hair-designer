import { renderHeader, initMobileMenu } from '../components/Header';
import { renderFooter } from '../components/Footer';
import { API_BASE_URL } from '../config';
import Swal from 'sweetalert2';

export const renderReviewPage = async (app: HTMLElement, router: any) => {
    if (!app) {
        console.error('Render container is null');
        return;
    }

    try {
        // Parse code from URL (Hash Router support)
        const urlParams = new URLSearchParams(window.location.search);
        let reservationCode = urlParams.get('code');

        if (!reservationCode) {
            const hash = window.location.hash; // #/review?code=...
            if (hash.includes('?')) {
                const hashParams = new URLSearchParams(hash.split('?')[1]);
                reservationCode = hashParams.get('code');
            }
        }

        app.innerHTML = `
        <div class="h-full min-h-screen flex flex-col bg-brand-gray-900 text-white overflow-y-auto">
            ${renderHeader()}
            <main class="flex-grow pt-10 pb-40">
                <div class="container mx-auto px-4 max-w-2xl">
                    <div class="text-center mb-10">
                        <div class="w-20 h-20 bg-brand-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-brand-gray-700">
                            <i class="fas fa-star text-4xl text-yellow-500"></i>
                        </div>
                        <h1 class="text-3xl md:text-4xl font-serif font-bold text-white mb-2">Deneyiminizi Değerlendirin</h1>
                        <p class="text-brand-gray-400">Görüşleriniz hizmet kalitemizi artırmamız için çok değerli.</p>
                    </div>

                    <div class="bg-brand-black p-8 rounded-3xl border border-brand-gray-800 shadow-2xl mb-10">
                        <form id="review-form" class="space-y-6">
                            <!-- Rating -->
                            <div class="flex flex-col items-center mb-6">
                                <label class="text-brand-gray-400 mb-3 text-sm tracking-widest uppercase">Puanınız</label>
                                <div class="flex gap-2" id="star-rating">
                                    ${[1, 2, 3, 4, 5].map(i => `
                                        <button type="button" data-value="${i}" class="star-btn text-3xl text-brand-gray-700 hover:text-yellow-500 transition-colors focus:outline-none">
                                            <i class="fas fa-star"></i>
                                        </button>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="rating" name="rating" required>
                            </div>

                            <!-- Comment -->
                            <div class="bg-brand-gray-900 rounded-xl p-1 relative group focus-within:ring-2 focus-within:ring-brand-gold transition-all duration-300">
                                <textarea id="comment" name="comment" rows="4" 
                                    class="w-full bg-transparent text-white p-4 outline-none placeholder-brand-gray-600 resize-none"
                                    placeholder="Deneyiminizi bizimle paylaşın..." required></textarea>
                            </div>

                            <!-- Name (Optional/Auto-filled) -->
                            <div class="bg-brand-gray-900 rounded-xl p-1 relative group focus-within:ring-2 focus-within:ring-brand-gold transition-all duration-300">
                                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-600">
                                    <i class="fas fa-user"></i>
                                </div>
                                <input type="text" id="name" name="name" 
                                    class="w-full bg-transparent text-white pl-12 pr-4 py-4 outline-none placeholder-brand-gray-600"
                                    placeholder="Adınız Soyadınız (İsteğe Bağlı)">
                            </div>

                            <!-- Code (Auto-filled) -->
                            <div class="bg-brand-gray-900 rounded-xl p-1 relative group focus-within:ring-2 focus-within:ring-brand-gold transition-all duration-300 opacity-50 cursor-not-allowed">
                                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-600">
                                    <i class="fas fa-hashtag"></i>
                                </div>
                                <input type="text" id="code" name="code" value="${reservationCode || ''}"
                                    class="w-full bg-transparent text-gray-500 pl-12 pr-4 py-4 outline-none cursor-not-allowed"
                                    placeholder="Rezervasyon Kodu" readonly>
                            </div>

                            <button type="submit" 
                                class="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-gray-200 hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 flex items-center justify-center gap-3 text-lg border-2 border-transparent hover:border-gray-300 mt-8 mb-20 shadow-white/10">
                                <span>YORUMU GÖNDER</span>
                                <i class="fas fa-paper-plane text-xl"></i>
                            </button>
                        </form>
                    </div>
                    <!-- Extra spacer for mobile scrolling -->
                    <div class="h-32"></div> 
                </div>
            </main>
            
            ${renderFooter()}
        </div>
    `;

        // Initialize Mobile Menu
        initMobileMenu();

        // Auto-fill Name if Code Exists (Must be AFTER rendering HTML)
        if (reservationCode) {
            fetch(`https://hair-designer.onrender.com/api/appointment-details/${reservationCode}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.customerName) {
                        const nameInput = document.getElementById('name') as HTMLInputElement;
                        if (nameInput) nameInput.value = data.customerName;
                    }
                })
                .catch(err => console.error('Auto-fill failed:', err));
        }

        // Star Rating Logic
        const starBtns = app.querySelectorAll('.star-btn');
        const ratingInput = app.querySelector('#rating') as HTMLInputElement;

        starBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseInt(btn.getAttribute('data-value') || '0');
                ratingInput.value = value.toString();

                // Update UI
                starBtns.forEach(b => {
                    const v = parseInt(b.getAttribute('data-value') || '0');
                    if (v <= value) {
                        b.classList.remove('text-brand-gray-700');
                        b.classList.add('text-yellow-500');
                    } else {
                        b.classList.add('text-brand-gray-700');
                        b.classList.remove('text-yellow-500');
                    }
                });
            });
        });

        // Form Submit
        const form = app.querySelector('#review-form') as HTMLFormElement;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = {
                rating: formData.get('rating'),
                comment: formData.get('comment'),
                name: formData.get('name') || 'Anonim',
                code: formData.get('code')
            };

            if (!data.rating) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Puan Verin',
                    text: 'Lütfen yıldızlara tıklayarak puan verin.',
                    confirmButtonColor: '#D4AF37'
                });
                return;
            }

            try {
                const res = await fetch(`https://hair-designer.onrender.com/api/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if (result.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Teşekkürler!',
                        text: 'Yorumunuz başarıyla alındı.',
                        confirmButtonColor: '#D4AF37'
                    }).then(() => {
                        router.navigate('/');
                    });
                } else {
                    throw new Error(result.error);
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Hata',
                    text: 'Yorum gönderilemedi. Lütfen tekrar deneyin.',
                    confirmButtonColor: '#D4AF37'
                });
            }
        });

    } catch (err) {
        console.error('Review Page Error:', err);
        app.innerHTML = `
            <div class="text-white text-center pt-20">
                <h2 class="text-2xl font-bold mb-4">Bir hata oluştu</h2>
                <p class="text-gray-400">Sayfa yüklenirken bir sorun yaşandı.</p>
                <p class="mt-4 text-gray-400">Lütfen bu hatayı geliştiriciye bildirin.</p>
            </div>`;
    }
};
