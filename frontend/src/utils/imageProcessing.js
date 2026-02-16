/**
 * Pro Camera Image Processing Utility
 */

/**
 * Calculates the variance of the Laplacian to detect blur.
 * @param {ImageData} imageData 
 * @returns {number} Blur score (higher is sharper)
 */
export const calculateBlurScore = (imageData) => {
    const { data, width, height } = imageData;
    const laplacian = new Float32Array(width * height);

    // Laplacian Kernel
    // 0  1  0
    // 1 -4  1
    // 0  1  0

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const center = data[idx];
            const up = data[((y - 1) * width + x) * 4];
            const down = data[((y + 1) * width + x) * 4];
            const left = data[(y * width + (x - 1)) * 4];
            const right = data[(y * width + (x + 1)) * 4];

            laplacian[y * width + x] = up + down + left + right - 4 * center;
        }
    }

    // Calculate Variance
    let sum = 0;
    for (let i = 0; i < laplacian.length; i++) sum += laplacian[i];
    const mean = sum / laplacian.length;

    let variance = 0;
    for (let i = 0; i < laplacian.length; i++) {
        variance += Math.pow(laplacian[i] - mean, 2);
    }

    return variance / laplacian.length;
};

/**
 * Analyzes brightness level of an image.
 * @param {ImageData} imageData 
 * @returns {number} Average brightness (0-255)
 */
export const calculateBrightness = (imageData) => {
    const data = imageData.data;
    let r, g, b, avg;
    let colorSum = 0;

    for (let x = 0, len = data.length; x < len; x += 4) {
        r = data[x];
        g = data[x + 1];
        b = data[x + 2];
        avg = Math.floor((r + g + b) / 3);
        colorSum += avg;
    }

    return colorSum / (imageData.width * imageData.height);
};

/**
 * Applies sharpening and contrast enhancement to a canvas context.
 */
export const applyPostProcessing = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 1. Digital Darkroom pass (Contrast & Saturation)
    ctx.filter = 'contrast(1.08) saturate(1.05) brightness(1.02)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';

    // 2. Simple White Balance (Gray World Assumption)
    let rSum = 0, gSum = 0, bSum = 0;
    const count = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
    }
    const rAvg = rSum / count, gAvg = gSum / count, bAvg = bSum / count; // Corrected bAvg calculation
    const avg = (rAvg + gAvg + bAvg) / 3;
    const rScale = avg / rAvg, gScale = avg / gAvg, bScale = avg / bAvg;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * rScale);
        data[i + 1] = Math.min(255, data[i + 1] * gScale);
        data[i + 2] = Math.min(255, data[i + 2] * bScale);
    }
    ctx.putImageData(imageData, 0, 0);

    // 3. Sharpening via Canvas Filter (if supported) or just stay with contrast
    // Note: Most modern browsers support 'contrast' and 'brightness' well.
};
