import { renderHeader, initMobileMenu } from '../components/Header';
import QRCode from 'qrcode';

export const renderAdminQRPage = (app: HTMLElement, router: any) => {
    app.innerHTML = `
        <div class="min-h-screen flex flex-col bg-black text-white">
            ${renderHeader()}
            <main class="flex-grow flex items-center justify-center p-4">
                <div class="bg-brand-gray-900 p-8 rounded-2xl border border-brand-gray-800 shadow-2xl max-w-md w-full text-center">
                    <h1 class="text-2xl font-bold mb-6 text-white font-serif">WhatsApp Bağlantısı</h1>
                    
                    <div id="auth-section">
                        <p class="text-brand-gray-400 mb-4 text-sm">Yönetici şifresini giriniz:</p>
                        <input type="password" id="admin-password" class="w-full bg-black border border-brand-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:border-brand-gold focus:outline-none transition-colors" placeholder="Şifre">
                        <button id="check-qr-btn" class="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-brand-gray-200 transition-colors">
                            KONTROL ET
                        </button>
                    </div>

                    <div id="qr-display-section" class="hidden mt-6">
                        <div class="bg-white p-4 rounded-xl inline-block mb-4">
                            <canvas id="qr-canvas"></canvas>
                        </div>
                        <p class="text-green-500 font-bold animate-pulse text-sm">QR Kod Hazır! Okutunuz.</p>
                        <p class="text-xs text-brand-gray-500 mt-2">Bu kod her 20 saniyede bir değişebilir.<br>Sayfayı yenileyin.</p>
                    </div>

                    <div id="status-message" class="mt-4 text-sm text-brand-gray-400 h-6"></div>
                </div>
            </main>
        </div>
    `;

    initMobileMenu();

    const checkBtn = document.getElementById('check-qr-btn');
    const passwordInput = document.getElementById('admin-password') as HTMLInputElement;
    const qrSection = document.getElementById('qr-display-section');
    const authSection = document.getElementById('auth-section');
    const statusMsg = document.getElementById('status-message');
    const canvas = document.getElementById('qr-canvas');

    if (checkBtn && passwordInput) {
        checkBtn.addEventListener('click', async () => {
            const password = passwordInput.value;
            if (!password) return;

            checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            if (statusMsg) statusMsg.textContent = 'Bağlanılıyor...';

            try {
                const res = await fetch(`http://localhost:3000/api/admin/qr?password=${password}`);

                if (res.status === 403) {
                    if (statusMsg) {
                        statusMsg.textContent = 'Hatalı şifre!';
                        statusMsg.className = 'mt-4 text-sm text-red-500 font-bold';
                    }
                    checkBtn.innerHTML = 'KONTROL ET';
                    return;
                }

                const data = await res.json();

                if (data.success) {
                    if (data.qr) {
                        // Show QR
                        if (authSection) authSection.classList.add('hidden');
                        if (qrSection) qrSection.classList.remove('hidden');
                        if (statusMsg) statusMsg.textContent = '';

                        QRCode.toCanvas(canvas, data.qr, { width: 256, margin: 2 }, function (error: any) {
                            if (error) console.error(error);
                        });
                    } else if (data.connected) {
                        if (statusMsg) {
                            statusMsg.textContent = 'WhatsApp zaten bağlı! ✅';
                            statusMsg.className = 'mt-4 text-sm text-green-500 font-bold text-lg';
                        }
                        checkBtn.innerHTML = 'BAĞLI';
                    } else {
                        if (statusMsg) statusMsg.textContent = 'QR kod henüz oluşmadı, 5sn sonra tekrar deneyin.';
                        checkBtn.innerHTML = 'TEKRAR DENE';
                    }
                }
            } catch (err) {
                console.error(err);
                if (statusMsg) statusMsg.textContent = 'Sunucu hatası.';
                checkBtn.innerHTML = 'KONTROL ET';
            }
        });
    }
};
