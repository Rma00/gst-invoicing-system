const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { generateInvoice } = require('../functions/index');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Mock GST API Endpoint
app.post("/submit-gst", (req, res) => {
    const { name, totalBookingAmount, gstAmount, CGST, SGST, IGST } = req.body;

    if (!name || !totalBookingAmount || gstAmount === undefined) {
        return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    // Simulating GST filing process
    const response = {
        success: true,
        message: "GST filing successful",
        gstDetails: {
            name,
            totalBookingAmount,
            gstAmount,
            CGST,
            SGST,
            IGST,
            filingDate: new Date().toISOString()
        }
    };

    // Make a call to createBooking function in index.js to store the booking data in Firestore
    const bookingData = {
        name,
        totalBookingAmount,
        status: 'finished'
    };
    
    console.log("GST Filed Successfully:", response);
    // Assuming createBooking is a function exported from index.js
    generateInvoice(bookingData)
        .then(() => {
            console.log("Booking data stored successfully");
        })
        .catch((error) => {
            console.error("Error storing booking data:", error);
        });

    return res.status(200).json(response);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Mock GST API running at http://localhost:${PORT}`);
});
