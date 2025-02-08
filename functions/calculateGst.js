const GST_RATE = 0.18; // Example GST rate

function calculateGST(totalBookingAmount) {
    const gstAmount = totalBookingAmount * GST_RATE;
    const CGST = gstAmount / 2;
    const SGST = gstAmount / 2;
    const IGST = gstAmount;

    return { gstAmount, CGST, SGST, IGST };
}

module.exports = { calculateGST };