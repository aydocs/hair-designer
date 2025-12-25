const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Helper: Wrap Text with Max Height Truncation
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const startY = y;

    if (ctx.measureText(text).width <= maxWidth) {
        ctx.fillText(text, x, y);
        return currentY + lineHeight;
    }

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            // Check max height before printing new line
            if (maxHeight && (currentY - startY + lineHeight) > maxHeight) {
                const lastLine = line.trim() + '...';
                ctx.fillText(lastLine, x, currentY);
                return currentY + lineHeight;
            }

            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    // Print last line
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
}

// Helper: Draw Rounded Rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Helper: Draw Gold Badge / Circle
function drawGoldBadge(ctx, x, y, radius, text, subtext) {
    // Outer Glow
    const gradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.2);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Circle Body
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Gold Border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';

    if (subtext) {
        ctx.font = 'bold 24px Arial';
        ctx.fillText(text, x, y - 10);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 40px Courier New';
        ctx.fillText(subtext, x, y + 35);
    } else {
        ctx.font = 'bold 36px Arial';
        ctx.fillText(text, x, y + 10);
    }
}

// Helper: Draw Premium Header
function drawPremiumHeader(ctx, width, title, subtitle) {
    // Dark Header Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, 250);

    // Gold separator line
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 245, width, 5);

    // Title
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 60px "Times New Roman"';
    ctx.fillText(title, width / 2, 120);

    if (subtitle) {
        ctx.fillStyle = '#BBB';
        ctx.font = 'italic 30px Arial';
        ctx.fillText(subtitle, width / 2, 180);
    }
}

// ---------------------------------------------------------
// 1. ADMIN CARD (Premium Dark Dashboard)
// ---------------------------------------------------------
function createAdminCard(appointment, serviceName) {
    const width = 800;
    const height = 1200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background: Deep Rich Black
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1a1a1a');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    drawPremiumHeader(ctx, width, 'YENİ RANDEVU', 'Yönetici Paneli Bildirimi');

    // Content Box
    const boxY = 300;
    const boxH = 800;
    const padding = 50;

    // Glass effect box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = '#333';
    drawRoundedRect(ctx, padding, boxY, width - 100, boxH, 30);

    let textY = boxY + 100;
    const labelX = padding + 50;
    const valueX = padding + 50;

    ctx.textAlign = 'left';

    // 1. Customer
    ctx.fillStyle = '#888'; ctx.font = '24px Arial'; ctx.fillText('MÜŞTERİ', labelX, textY);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 45px Arial'; ctx.fillText(appointment.customerName, valueX, textY + 50);

    textY += 140;

    // 2. Phone
    ctx.fillStyle = '#888'; ctx.font = '24px Arial'; ctx.fillText('TELEFON', labelX, textY);
    ctx.fillStyle = '#FFD700'; ctx.font = 'bold 45px Monospace'; ctx.fillText(appointment.customerPhone, valueX, textY + 50);

    textY += 140;

    // 3. Date & Time
    ctx.fillStyle = '#888'; ctx.font = '24px Arial'; ctx.fillText('TARİH VE SAAT', labelX, textY);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 40px Arial';
    ctx.fillText(`${appointment.date}  |  ${appointment.time}`, valueX, textY + 50);

    textY += 140;

    // 4. Services
    ctx.fillStyle = '#888'; ctx.font = '24px Arial'; ctx.fillText('HİZMETLER', labelX, textY);
    ctx.fillStyle = '#EEE'; ctx.font = '30px Arial';
    wrapText(ctx, serviceName, valueX, textY + 50, width - 150, 40, 200);

    // Reservation Code Badge
    drawGoldBadge(ctx, width - 120, 360, 80, 'KOD', appointment.reservationCode);

    return canvas.toBuffer('image/png');
}

// ---------------------------------------------------------
// 2. CUSTOMER CARD (Existing Premium Design - Kept as Reference)
// ---------------------------------------------------------
function createCustomerCard(appointment, serviceName) {
    const width = 800;
    const height = 1200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background: White/Light Grey Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(1, '#F0F0F0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Top Hero Image / Brand Area
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, 400);

    // Brand Name
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 60px "Times New Roman"';
    ctx.fillText('YUSUF TANIK', width / 2, 150);
    ctx.font = 'italic 28px "Times New Roman"';
    ctx.fillStyle = '#AAA';
    ctx.fillText('HAIR DESIGNER & ARTIST', width / 2, 200);

    // Reservation Code (Circle Badge)
    const badgeY = 400;
    drawGoldBadge(ctx, width / 2, badgeY, 100, 'KOD', appointment.reservationCode);

    // ---------------- DETAILS SECTION ----------------
    const startY = 600;
    ctx.textAlign = 'center';

    // Welcome
    ctx.fillStyle = '#333';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`Sayın ${appointment.customerName},`, width / 2, startY);
    ctx.font = '28px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Randevunuz hazırlanmıştır.', width / 2, startY + 40);

    // Time Box
    const timeBoxY = startY + 100;
    ctx.fillStyle = '#000';
    drawRoundedRect(ctx, 100, timeBoxY, width - 200, 180, 20);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 90px Arial';
    ctx.fillText(appointment.time, width / 2, timeBoxY + 90);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(appointment.date, width / 2, timeBoxY + 145);

    // Service list (Wrapping)
    const serviceY = timeBoxY + 230;
    ctx.fillStyle = '#000';
    ctx.font = 'bold 32px Arial';

    wrapText(ctx, serviceName.toUpperCase(), width / 2, serviceY, width - 100, 50);

    // Footer
    ctx.fillStyle = '#888';
    ctx.font = '24px Arial';
    ctx.fillText('Serdivan, Sakarya', width / 2, height - 50);

    return canvas.toBuffer('image/png');
}

// ---------------------------------------------------------
// 3. CANCELLATION CARD (Premium Dark Red)
// ---------------------------------------------------------
function createCancellationCard(appointment, serviceName) {
    const width = 800;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background: Dark Red Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#2b0000');
    grad.addColorStop(1, '#111111');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#800000';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, width, height);

    drawPremiumHeader(ctx, width, 'RANDEVU İPTALİ', 'Yusuf Tanık Hair Designer');

    // Large X Icon inside Circle
    const iconY = 400;
    ctx.beginPath();
    ctx.arc(width / 2, iconY, 80, 0, Math.PI * 2);
    ctx.fillStyle = '#800000';
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 30, iconY - 30); ctx.lineTo(width / 2 + 30, iconY + 30);
    ctx.moveTo(width / 2 + 30, iconY - 30); ctx.lineTo(width / 2 - 30, iconY + 30);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';

    ctx.font = 'bold 45px Arial';
    ctx.fillText('RANDEVUNUZ İPTAL EDİLDİ', width / 2, 580);

    ctx.fillStyle = '#CCC';
    ctx.font = '30px Arial';
    ctx.fillText(`Sayın ${appointment.customerName}`, width / 2, 650);

    const infoY = 750;
    ctx.fillStyle = '#666';
    ctx.font = '26px Arial';
    ctx.fillText('Tarih ve Saat:', width / 2, infoY);
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(`${appointment.date} - ${appointment.time}`, width / 2, infoY + 50);

    return canvas.toBuffer('image/png');
}

// ---------------------------------------------------------
// 4. REVIEW CARD (Gold Standard)
// ---------------------------------------------------------
function createReviewCard(appointment) {
    const width = 800;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background: Elegant Dark Blue/Black
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0F172A'); // Slate 900
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    drawPremiumHeader(ctx, width, 'DEĞERLENDİRME', 'Hizmet Kalitemizi Puanlayın');

    // Stars Visual
    const starY = 400;
    const starTotal = 5;
    const gap = 110;
    const startX = (width - ((starTotal - 1) * gap)) / 2;

    for (let i = 0; i < 5; i++) {
        drawStar(ctx, startX + (i * gap), starY, 5, 40, 20, '#FFD700');
    }

    // Main Text
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px Arial';
    ctx.fillText('Nasıl Buldunuz?', width / 2, 550);

    ctx.fillStyle = '#AAA';
    ctx.font = '28px Arial';
    ctx.fillText('Deneyiminizi bizimle paylaşın', width / 2, 600);

    // Code Box
    const boxY = 720;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 150, boxY, width - 300, 150, 20);

    ctx.fillStyle = '#FFD700';
    ctx.font = '24px Arial';
    ctx.fillText('ONAY KODUNUZ', width / 2, boxY + 50);
    ctx.font = 'bold 60px Courier New';
    ctx.fillText(appointment.reservationCode, width / 2, boxY + 110);

    return canvas.toBuffer('image/png');
}

// ---------------------------------------------------------
// 5. REVIEW RESULT CARD (Feedback Showcase)
// ---------------------------------------------------------
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function createReviewResultCard(reviewData) {
    const width = 800;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Background: Premium Black
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#111111');
    grad.addColorStop(1, '#222222');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    drawPremiumHeader(ctx, width, 'YENİ YORUM', 'Müşteri Geri Bildirimi');

    // 3. Stars 
    const starTotal = 5;
    const starScore = reviewData.rating;
    const starSize = 40;
    const gap = 100;
    const startX = (width - (gap * (starTotal - 1))) / 2;

    const starsY = 320;
    for (let i = 0; i < starTotal; i++) {
        const color = i < starScore ? '#FFD700' : '#444444';
        drawStar(ctx, startX + (i * gap), starsY, 5, starSize, starSize / 2, color);
    }

    // 4. Comment Box
    const boxY = 420;
    const boxH = 400;

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    drawRoundedRect(ctx, 50, boxY, width - 100, boxH, 30);
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, boxY, width - 100, boxH);

    // 5. Comment Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 36px "Times New Roman"';
    ctx.textAlign = 'center';
    wrapText(ctx, `"${reviewData.comment}"`, width / 2, boxY + 100, width - 160, 50, 300);

    // 6. Author
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(reviewData.customerName, width / 2, boxY + boxH + 60);

    return canvas.toBuffer('image/png');
}

module.exports = {
    createAdminCard,
    createCustomerCard,
    createCancellationCard,
    createReviewCard,
    createReviewResultCard
};
