import Navigo from 'navigo';
import { renderHeader } from '../components/Header';
import { renderFooter } from '../components/Footer';

let qrPollInterval: number | null = null;

export function renderAdminQRPage(router: Navigo) {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        ${renderHeader(router)}
        <main class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-16">
            <div class="container mx-auto px-4">
                <div class="max-w-2xl mx-auto">
                    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                        <h1 class="text-3xl font-bold text-white mb-2 text-center">
                            <i class="fab fa-whatsapp text-green-500 mr-3"></i>
                            WhatsApp QR Kod
                        </h1>
                        <p class="text-gray-400 text-center mb-8">Sistem yöneticisi için</p>

                        <!-- Password Input -->
                        <div id="passwordSection" class="mb-6">
                            <label class="block text-gray-300 mb-2 font-medium">Yönetici Şifresi</label>
                            <div class="flex gap-3">
                                <input 
                                    type="password" 
                                    id="adminPassword" 
                                    placeholder="Şifre giriniz"
                                    class="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all"
                                />
                                <button 
                                    id="verifyBtn"
                                    class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                                >
                                    Giriş
                                </button>
                            </div>
                            <p id="errorMsg" class="text-red-400 text-sm mt-2 hidden"></p>
                        </div>

                        <!-- QR Code Section (Initially Hidden) -->
                        <div id="qrSection" class="hidden">
                            <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                                <!-- Connection Status -->
                                <div id="connectionStatus" class="mb-6 text-center">
                                    <div class="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        <span>Bağlantı durumu kontrol ediliyor...</span>
                                    </div>
                                </div>

                                <!-- QR Code Display -->
                                <div id="qrCodeContainer" class="text-center">
                                    <div class="bg-white p-6 rounded-xl inline-block mb-4">
                                        <div id="qrCode" class="min-h-[256px] flex items-center justify-center">
                                            <div class="text-gray-400">
                                                <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
                                                <p>QR Kod yükleniyor...</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="text-gray-400 text-sm">
                                        WhatsApp uygulamanızdan bu QR kodu okutun
                                    </p>
                                </div>

                                <!-- Instructions -->
                                <div class="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                                    <h3 class="text-white font-medium mb-3 flex items-center gap-2">
                                        <i class="fas fa-info-circle text-blue-400"></i>
                                        Nasıl Bağlanır?
                                    </h3>
                                    <ol class="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                                        <li>WhatsApp uygulamasını açın</li>
                                        <li>Ayarlar → Bağlı Cihazlar'a gidin</li>
                                        <li>"Cihaz Bağla" butonuna tıklayın</li>
                                        <li>Yukarıdaki QR kodu okutun</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        ${renderFooter()}
    `;

    // Elements
    const passwordInput = document.getElementById('adminPassword') as HTMLInputElement;
    const verifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;
    const errorMsg = document.getElementById('errorMsg') as HTMLParagraphElement;
    const passwordSection = document.getElementById('passwordSection') as HTMLDivElement;
    const qrSection = document.getElementById('qrSection') as HTMLDivElement;
    const qrCode = document.getElementById('qrCode') as HTMLDivElement;
    const connectionStatus = document.getElementById('connectionStatus') as HTMLDivElement;
    const qrCodeContainer = document.getElementById('qrCodeContainer') as HTMLDivElement;

    // Password verification
    verifyBtn.addEventListener('click', async () => {
        const password = passwordInput.value;
        if (!password) {
            errorMsg.textContent = 'Lütfen şifre giriniz';
            errorMsg.classList.remove('hidden');
            return;
        }

        try {
            const res = await fetch(`https://hair-designer.onrender.com/api/admin/qr?password=${password}`);

            if (res.ok) {
                passwordSection.classList.add('hidden');
                qrSection.classList.remove('hidden');
                errorMsg.classList.add('hidden');

                // Start polling for QR code
                startQRPolling();
            } else {
                errorMsg.textContent = 'Hatalı şifre!';
                errorMsg.classList.remove('hidden');
            }
        } catch (err) {
            errorMsg.textContent = 'Bağlantı hatası!';
            errorMsg.classList.remove('hidden');
        }
    });

    // Enter key support
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyBtn.click();
        }
    });

    async function fetchQRCode() {
        try {
            const res = await fetch('https://hair-designer.onrender.com/api/admin/qr?password=yusufhair');
            const data = await res.json();

            if (data.connected) {
                // WhatsApp is connected
                connectionStatus.innerHTML = `
                    <div class="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg">
                        <i class="fas fa-check-circle"></i>
                        <span>WhatsApp Bağlı!</span>
                    </div>
                `;
                qrCodeContainer.classList.add('hidden');

                // Stop polling when connected
                if (qrPollInterval) {
                    clearInterval(qrPollInterval);
                    qrPollInterval = null;
                }
            } else if (data.qr) {
                // QR code is available
                connectionStatus.innerHTML = `
                    <div class="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg">
                        <i class="fas fa-qrcode"></i>
                        <span>QR Kodu Hazır - Lütfen Okutun</span>
                    </div>
                `;
                qrCodeContainer.classList.remove('hidden');

                // Display QR code using qrcode library
                qrCode.innerHTML = '';
                const QRCode = (window as any).QRCode;
                new QRCode(qrCode, {
                    text: data.qr,
                    width: 256,
                    height: 256,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
            } else {
                // Waiting for QR code
                connectionStatus.innerHTML = `
                    <div class="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>QR Kod oluşturuluyor...</span>
                    </div>
                `;
                qrCodeContainer.classList.remove('hidden');
                qrCode.innerHTML = `
                    <div class="text-gray-400">
                        <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
                        <p>Bekleyiniz...</p>
                    </div>
                `;
            }
        } catch (err) {
            console.error('QR fetch error:', err);
            connectionStatus.innerHTML = `
                <div class="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Bağlantı Hatası</span>
                </div>
            `;
        }
    }

    function startQRPolling() {
        // Fetch immediately
        fetchQRCode();

        // Then poll every 3 seconds
        qrPollInterval = window.setInterval(fetchQRCode, 3000);
    }

    // Cleanup on page leave
    window.addEventListener('beforeunload', () => {
        if (qrPollInterval) {
            clearInterval(qrPollInterval);
        }
    });
}
