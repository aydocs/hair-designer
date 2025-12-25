const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Helper: Wrap Text
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
                // Truncate
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
    // Print last line if within bounds (roughly)
    if (!maxHeight || (currentY - startY) <= maxHeight) {
        ctx.fillText(line, x, currentY);
    }
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

// ---------------------------------------------------------
// 1. ADMIN CARD (Mobile Dashboard Style)
// ---------------------------------------------------------
function createAdminCard(appointment, serviceName) {
    const width = 800;
    const height = 1200; // Vertical Mobile Format
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background: Dark Dashboard
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#121212');
    grad.addColorStop(1, '#1E1E1E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Header Pattern
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < height; i += 20) {
        ctx.fillRect(0, i, width, 1);
    }
    for (let i = 0; i < width; i += 20) {
        ctx.fillRect(i, 0, 1, height);
    }

    // Top Header
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.fillRect(0, 0, width, 100);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YENİ RANDEVU', width / 2, 65);

    // Reservation Code Badge (Floating)
    const codeY = 150;
    drawRoundedRect(ctx, width / 2 - 150, codeY, 300, 80, 40);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 50px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(appointment.reservationCode, width / 2, codeY + 55);

    // ---------------- INFO CARD ----------------
    const cardY = 280;
    const cardH = 750;
    const padding = 50;

    ctx.fillStyle = '#252525';
    ctx.strokeStyle = '#444';
    drawRoundedRect(ctx, padding, cardY, width - (padding * 2), cardH, 30);

    let textY = cardY + 80;
    const labelX = padding + 40;
    const valueX = padding + 220; // Indent for values

    ctx.textAlign = 'left';

    // Customer
    ctx.fillStyle = '#888'; ctx.font = '30px Arial'; ctx.fillText('Müşteri', labelX, textY);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 36px Arial';
    ctx.fillText(appointment.customerName.toUpperCase(), labelX, textY + 45);

    textY += 120;

    // Phone
    ctx.fillStyle = '#888'; ctx.font = '30px Arial'; ctx.fillText('Telefon', labelX, textY);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 36px Arial';
    ctx.fillText(appointment.customerPhone, labelX, textY + 45);

    textY += 120;

    // Date/Time
    ctx.fillStyle = '#888'; ctx.font = '30px Arial'; ctx.fillText('Tarih & Saat', labelX, textY);
    ctx.fillStyle = '#4CAF50'; ctx.font = 'bold 36px Arial';
    ctx.fillText(`${appointment.date}`, labelX, textY + 45);
    ctx.fillStyle = '#FFF';
    ctx.fillText(`${appointment.time}`, labelX + 250, textY + 45);

    textY += 120;

    // Services (Wrapping)
    ctx.fillStyle = '#888'; ctx.font = '30px Arial'; ctx.fillText('Hizmetler', labelX, textY);
    ctx.fillStyle = '#FFD700'; ctx.font = 'bold 32px Arial';

    // Wrap service text
    wrapText(ctx, serviceName, labelX, textY + 45, width - (labelX + padding + 20), 45);

    // Footer Help Text
    ctx.fillStyle = '#555';
    ctx.font = 'italic 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('İptal için mesaja "RED" yazarak cevaplayın.', width / 2, height - 50);

    return canvas.toBuffer('image/png');
}


// ---------------------------------------------------------
// 2. CUSTOMER CARD (Premium Mobile App Ticket)
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
    ctx.beginPath();
    ctx.arc(width / 2, badgeY, 100, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('KOD', width / 2, badgeY - 20);
    ctx.font = 'bold 60px Courier New';
    ctx.fillText(appointment.reservationCode, width / 2, badgeY + 35);

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

    // We expect serviceName to be potentially long
    const maxWidth = width - 100;

    // Custom wrapper for centered text
    const words = serviceName.split(' ');
    let line = '';
    let currentY = serviceY;
    const lineHeight = 50;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line.toUpperCase(), width / 2, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.toUpperCase(), width / 2, currentY);

    // Footer
    ctx.fillStyle = '#888';
    ctx.font = '24px Arial';
    ctx.fillText('Yusuf Tanık Hair Designer', width / 2, height - 60);
    ctx.font = '20px Arial';
    ctx.fillText('Adresiniz, Şehir', width / 2, height - 30);

    return canvas.toBuffer('image/png');
}

// ---------------------------------------------------------
// 3. CANCELLATION CARD
// ---------------------------------------------------------
function createCancellationCard(appointment, serviceName) {
    const width = 800;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#500000');
    grad.addColorStop(1, '#200000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, width, height);

    // Large X Icon
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(width / 2, 300, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 50, 250); ctx.lineTo(width / 2 + 50, 350);
    ctx.moveTo(width / 2 + 50, 250); ctx.lineTo(width / 2 - 50, 350);
    ctx.stroke();

    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px Arial';
    ctx.fillText('İPTAL EDİLDİ', width / 2, 500);

    ctx.fillStyle = '#CCC';
    ctx.font = '30px Arial';
    ctx.fillText(appointment.customerName, width / 2, 600);
    ctx.fillText(`${appointment.date} - ${appointment.time}`, width / 2, 650);

    // Service wrap
    ctx.font = 'italic 28px Arial';
    wrapText(ctx, serviceName, width / 2, 720, width - 100, 40);

    return canvas.toBuffer('image/png');
}

// ---------------------------------------------------------
// 4. REVIEW CARD
// ---------------------------------------------------------
function createReviewCard(appointment) {
    const width = 800;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0f2027');
    grad.addColorStop(1, '#2c5364');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Stars
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.font = 'bold 80px Arial';
    ctx.fillText('★★★★★', width / 2, 300);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 50px Arial';
    ctx.fillText('Memnun Kaldınız mı?', width / 2, 450);

    ctx.font = '30px Arial';
    ctx.fillText('Bize bir puan verin', width / 2, 520);

    // Code
    const boxY = 700;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(100, boxY, width - 200, 150);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(100, boxY, width - 200, 150);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 70px Courier New';
    ctx.fillText(appointment.reservationCode, width / 2, boxY + 100);

    return canvas.toBuffer('image/png');
}

// ---------------------------------------------------------
// 5. REVIEW RESULT CARD (For Owner - Feedback Summary)
// ---------------------------------------------------------
// Helper: Draw Star Shape
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

// ---------------------------------------------------------
// 5. REVIEW RESULT CARD (For Owner - Feedback Summary)
// ---------------------------------------------------------
function createReviewResultCard(reviewData) {
    const width = 800;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Background: Premium Black/Dark Gray
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#111111');
    grad.addColorStop(1, '#2c3e50'); // Dark slate gray
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Header
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 45px Arial'; // Increased size
    ctx.fillText('YENİ MÜŞTERİ YORUMU', width / 2, 100);

    // 3. Stars (Vector Drawing to avoid Font Issues)
    const starTotal = 5;
    const starScore = reviewData.rating;
    const starSize = 40; // Radius
    const gap = 100;
    const startX = (width - (gap * (starTotal - 1))) / 2;

    for (let i = 0; i < starTotal; i++) {
        const color = i < starScore ? '#FFFFFF' : '#444444'; // White filled, Gray empty
        drawStar(ctx, startX + (i * gap), 220, 5, starSize, starSize / 2, color);
    }

    // 4. Comment Box
    const boxY = 320;
    const boxH = 400;

    // Glassmorphism effect
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    drawRoundedRect(ctx, 50, boxY, width - 100, boxH, 30);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, boxY, width - 100, boxH);

    // 5. Comment Text
    ctx.fillStyle = '#E0E0E0';
    ctx.font = 'italic 32px Arial';
    ctx.textAlign = 'center';
    wrapText(ctx, `"${reviewData.comment}"`, width / 2, boxY + 100, width - 160, 50, 300);

    // 6. Author
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(reviewData.customerName, width / 2, boxY + boxH + 70);

    // 7. Footer / Date
    ctx.fillStyle = '#888888';
    ctx.font = '24px Arial';
    ctx.fillText(`Tarih: ${reviewData.date}`, width / 2, height - 60);

    return canvas.toBuffer('image/png');
}

module.exports = {
    createAdminCard,
    createCustomerCard,
    createCancellationCard,
    createReviewCard,
    createReviewResultCard
};
