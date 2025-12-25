export const renderFooter = () => `
<footer class="bg-black py-12 border-t border-brand-gray-800">
    <div class="container mx-auto px-4 flex flex-col items-center text-center">
        <!-- Branding -->
        <h2 class="text-3xl font-serif font-bold text-white mb-2 tracking-widest uppercase">YUSUF TANIK</h2>
        <p class="text-brand-gray-500 text-sm tracking-[0.3em] uppercase mb-8">Hair Designer & Artist</p>

        <!-- Social Media Links -->
        <div class="flex gap-6 mb-10">
            <a href="https://instagram.com" target="_blank" class="w-12 h-12 rounded-full bg-brand-gray-900 border border-brand-gray-800 flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
                <i class="fab fa-instagram text-xl group-hover:scale-110 transition-transform"></i>
            </a>
            <a href="https://tiktok.com" target="_blank" class="w-12 h-12 rounded-full bg-brand-gray-900 border border-brand-gray-800 flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
                <i class="fab fa-tiktok text-xl group-hover:scale-110 transition-transform"></i>
            </a>
            <a href="https://wa.me/905438401054" target="_blank" class="w-12 h-12 rounded-full bg-brand-gray-900 border border-brand-gray-800 flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
                <i class="fab fa-whatsapp text-xl group-hover:scale-110 transition-transform"></i>
            </a>
        </div>

        <!-- Copyright -->
        <div class="border-t border-brand-gray-900 w-full max-w-xs pt-8">
            <p class="text-brand-gray-600 text-xs">
                &copy; 2025 <a href="https://emadocs.com" target="_blank" class="text-[#9D00FF] font-bold hover:text-white transition-colors">EmaDocs</a>. Tüm hakları saklıdır.
            </p>
        </div>
    </div>
</footer>
`;
