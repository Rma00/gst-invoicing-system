const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { calculateGST } = require('./calculateGst');

admin.initializeApp();

const db = admin.firestore();

exports.processBooking = functions.firestore
    .document('bookings/{bookingId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (newValue.status === 'finished' && previousValue.status !== 'finished') {
            const { name, totalBookingAmount } = newValue;

            // Calculate GST
            const { gstAmount, CGST, SGST, IGST } = calculateGST(totalBookingAmount);

            // Add invoice data to Firestore
            const invoiceData = {
                bookingId: context.params.bookingId,
                name,
                totalBookingAmount,
                gstAmount,
                CGST,
                SGST,
                IGST,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await db.collection('invoices').add(invoiceData);
            console.log('Invoice added to Firestore:', invoiceData);

            // File GST using external API
            const response = await fileGST({ name, totalBookingAmount, gstAmount, CGST, SGST, IGST });

            if (response.success) {
                console.log('GST Filed Successfully:', response);
            } else {
                console.error('GST Filing Failed:', response);
            }
        }

    });

// Function to take payload and store in Firestore collection 'bookings'
const generateInvoice = async (payload) => {
    try {
        const { name, totalBookingAmount, status } = payload;

        if (!name || !totalBookingAmount || !status) {
            return res.status(400).send('Missing required fields');
        }

        const bookingId = db.collection('bookings').doc().id;
        const bookingData = {
            bookingId,
            name,
            totalBookingAmount,
            status,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('bookings').add(bookingData);

        res.status(201).send(`Booking created with ID: ${docRef.id}`);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.generateInvoice = generateInvoice;