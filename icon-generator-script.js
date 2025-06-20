// Simple script to generate professional icons
const sizes = [16, 32, 180, 192, 512];

function createIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Professional blue gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
    
    // Rounded rectangle
    const radius = size * 0.17;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add text for larger icons
    if (size >= 32) {
        ctx.fillStyle = 'white';
        ctx.font = `bold ${size * 0.4}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('JH', size / 2, size / 2);
    }
    
    return canvas.toDataURL('image/png');
}

// Generate base64 for all sizes
const icons = {};
sizes.forEach(size => {
    icons[`icon-${size}`] = createIcon(size);
});

console.log(icons);