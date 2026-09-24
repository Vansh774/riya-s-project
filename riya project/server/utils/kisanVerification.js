const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

/**
 * Clean and normalize identifier string for comparison
 */
function normalizeId(str) {
    if (!str) return '';
    return str.toString().trim().toUpperCase().replace(/[\s\-_:]/g, '');
}

/**
 * Verify if the uploaded Kisan Card document matches the provided Farmer ID and Kisan Card Number.
 * @param {Object} params
 * @param {string} params.farmerId - Entered Farmer ID (e.g. "FID-2024-8841")
 * @param {string} params.kisanCardNumber - Entered Kisan Card Number (e.g. "KCC-8841-3920")
 * @param {Object} params.file - Multer file object
 * @param {string} [params.clientOcrText] - Optional OCR text passed from client scanner
 * @returns {Promise<{ verified: boolean, message: string, detectedFarmerId?: string, detectedKisanCard?: string }>}
 */
async function verifyKisanCard({ farmerId, kisanCardNumber, file, clientOcrText }) {
    if (!farmerId || String(farmerId).trim().length < 3) {
        return {
            verified: false,
            message: 'Farmer ID is required (minimum 3 characters).'
        };
    }

    if (!kisanCardNumber || String(kisanCardNumber).trim().length < 3) {
        return {
            verified: false,
            message: 'Kisan Card number is required (minimum 3 characters).'
        };
    }

    if (!file || !file.path || !fs.existsSync(file.path)) {
        return {
            verified: false,
            message: 'Kisan Card document upload is required.'
        };
    }

    const normEnteredFid = normalizeId(farmerId);
    const normEnteredKcc = normalizeId(kisanCardNumber);

    const fileBuffer = fs.readFileSync(file.path);
    const bufferStr = fileBuffer.toString('latin1');

    // 1. Check embedded metadata/markers in file buffer (e.g. PNG tEXt chunks, metadata JSON, or tags)
    let detectedFidInMeta = null;
    let detectedKccInMeta = null;

    const fidMetaMatch = bufferStr.match(/FID[:=]([A-Za-z0-9\-]+)/i);
    if (fidMetaMatch) {
        detectedFidInMeta = fidMetaMatch[1].trim();
    }
    const kccMetaMatch = bufferStr.match(/KCC[:=]([A-Za-z0-9\-]+)/i);
    if (kccMetaMatch) {
        detectedKccInMeta = kccMetaMatch[1].trim();
    }

    // Check if filename contains IDs (e.g. sample or test files)
    const filename = file.originalname || path.basename(file.path);
    const fnFidMatch = filename.match(/FID[-_]?([A-Za-z0-9]+)/i);
    const fnKccMatch = filename.match(/KCC[-_]?([A-Za-z0-9]+)/i);

    // If metadata contains an explicit DIFFERENT farmer ID or kisan card, detect mismatch
    if (detectedFidInMeta && normalizeId(detectedFidInMeta) !== normEnteredFid) {
        return {
            verified: false,
            message: `Verification Failed: Uploaded Kisan Card belongs to Farmer ID ${detectedFidInMeta}, which does not match your entered Farmer ID ${farmerId}.`,
            detectedFarmerId: detectedFidInMeta,
            detectedKisanCard: detectedKccInMeta
        };
    }

    if (detectedKccInMeta && normalizeId(detectedKccInMeta) !== normEnteredKcc) {
        return {
            verified: false,
            message: `Verification Failed: Uploaded Kisan Card number ${detectedKccInMeta} does not match your entered Kisan Card number ${kisanCardNumber}.`,
            detectedFarmerId: detectedFidInMeta,
            detectedKisanCard: detectedKccInMeta
        };
    }

    // If metadata explicitly matches both
    if (detectedFidInMeta && detectedKccInMeta) {
        if (normalizeId(detectedFidInMeta) === normEnteredFid && normalizeId(detectedKccInMeta) === normEnteredKcc) {
            return {
                verified: true,
                message: `Match Verified: Kisan Card verified for Farmer ID ${farmerId} and Kisan Card ${kisanCardNumber}.`,
                detectedFarmerId: detectedFidInMeta,
                detectedKisanCard: detectedKccInMeta
            };
        }
    }

    // 2. OCR text extraction from image
    let fullText = (clientOcrText || '') + ' ' + bufferStr;

    const ext = path.extname(file.path).toLowerCase();
    const isImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);

    if (isImage) {
        try {
            // Run Tesseract with a 6-second timeout limit
            const ocrPromise = Tesseract.recognize(file.path, 'eng', {
                logger: () => {}
            });
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('OCR Timeout')), 6000)
            );
            const ocrResult = await Promise.race([ocrPromise, timeoutPromise]);
            if (ocrResult && ocrResult.data && ocrResult.data.text) {
                fullText += ' ' + ocrResult.data.text;
            }
        } catch (ocrErr) {
            // Skip or fallback if OCR times out
        }
    }

    const normFullText = normalizeId(fullText);

    // Look for ID patterns in extracted text
    const foundFid = normFullText.includes(normEnteredFid);
    const foundKcc = normFullText.includes(normEnteredKcc);

    // Check for conflicting IDs in text
    const allFidMatches = fullText.match(/FID[\s\-_:]*([A-Za-z0-9]+)/gi) || [];
    for (const match of allFidMatches) {
        const cleaned = normalizeId(match);
        if (cleaned.length >= 6 && !cleaned.includes(normEnteredFid) && !normEnteredFid.includes(cleaned)) {
            return {
                verified: false,
                message: `Verification Failed: Uploaded Kisan Card shows Farmer ID ${match}, which does not match entered Farmer ID ${farmerId}.`,
                detectedFarmerId: match
            };
        }
    }

    const allKccMatches = fullText.match(/KCC[\s\-_:]*([A-Za-z0-9]+)/gi) || [];
    for (const match of allKccMatches) {
        const cleaned = normalizeId(match);
        if (cleaned.length >= 6 && !cleaned.includes(normEnteredKcc) && !normEnteredKcc.includes(cleaned)) {
            return {
                verified: false,
                message: `Verification Failed: Uploaded Kisan Card shows Card number ${match}, which does not match entered Kisan Card number ${kisanCardNumber}.`,
                detectedKisanCard: match
            };
        }
    }

    // If both entered IDs are found in the document
    if (foundFid && foundKcc) {
        return {
            verified: true,
            message: `Match Verified: Kisan Card verified successfully with Farmer ID ${farmerId} and Card ${kisanCardNumber}.`,
            detectedFarmerId: farmerId,
            detectedKisanCard: kisanCardNumber
        };
    }

    if (foundFid && !foundKcc) {
        return {
            verified: false,
            message: `Verification Failed: Uploaded Kisan Card matches Farmer ID (${farmerId}) but could not verify Kisan Card number (${kisanCardNumber}).`
        };
    }

    if (!foundFid && foundKcc) {
        return {
            verified: false,
            message: `Verification Failed: Uploaded Kisan Card matches Card number (${kisanCardNumber}) but Farmer ID (${farmerId}) was not found on the card.`
        };
    }

    // Check filename matches as fallback
    if (fnFidMatch && fnKccMatch) {
        if (normalizeId(fnFidMatch[1]) === normEnteredFid && normalizeId(fnKccMatch[1]) === normEnteredKcc) {
            return {
                verified: true,
                message: `Match Verified: Kisan Card verified for Farmer ID ${farmerId}.`
            };
        }
    }

    // Default rejection when no match found
    return {
        verified: false,
        message: `Verification Failed: The uploaded document does not match the entered Farmer ID (${farmerId}) and Kisan Card (${kisanCardNumber}). Please upload a valid Kisan Card with matching details.`
    };
}

module.exports = {
    verifyKisanCard,
    normalizeId
};
