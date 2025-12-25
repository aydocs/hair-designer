const ADMIN_PHONE = '5551234567'; // Demo kullanıcı
const SESSION_KEY = 'admin_session';

export function login(phone: string): boolean {
    // Basit doğrulama: Numara kontrolü
    // Gerçekte OTP SMS doğrulaması gerekir.
    if (phone === ADMIN_PHONE || phone.length >= 10) {
        // Demo için 10 hane üstü her numarayı kabul edelim ama 
        // gerçek hayatta belli numaralar defined edilmeli.
        localStorage.setItem(SESSION_KEY, 'true');
        return true;
    }
    return false;
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
    return localStorage.getItem(SESSION_KEY) === 'true';
}
