import crypto from 'crypto';
import db from '../firebase.js';

export const handlePaymentNotification = async (req, res, next) => {
    try {
        const payload = req.body;
        const payvesselSignature = req.headers['HTTP_PAYVESSEL_HTTP_SIGNATURE'];
        const secret = 'PVSECRET-BE0WQ36L5D4B79G0IMSKCLGHX704PTI9F3C5FBH2PBIXENA3TNC7USWSW0WICNLK';

        const hash = crypto.createHmac('sha512', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (payvesselSignature === hash) {
            const { transaction, order, customer } = payload;
            const { reference, date } = transaction;
            const { amount, settlement_amount: settlementAmount, fee, description } = order;
            const { email, phone } = customer;

            // Log the details for debugging
            console.log('Reference:', reference);
            console.log('Date:', date);
            console.log('Amount:', amount);
            console.log('Settlement Amount:', settlementAmount);
            console.log('Fee:', fee);
            console.log('Description:', description);
            console.log('Customer Email:', email);
            console.log('Customer Phone:', phone);

            // Check if transaction already exists
            const transactionRef = db.collection('Transactions').doc(reference);
            const transactionDoc = await transactionRef.get();

            if (transactionDoc.exists) {
                return res.status(200).json({ message: 'Transaction already exists' });
            }

            // Find user by email
            const userQuerySnapshot = await db.collection('Users').where('email', '==', email).get();
            if (userQuerySnapshot.empty) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userDoc = userQuerySnapshot.docs[0];
            const userRef = userDoc.ref;
            const userData = userDoc.data();

            // Update user's balance
            const newBalance = (userData.balance || 0) + settlementAmount;
            await userRef.update({ balance: newBalance });

            // Create a new transaction record
            await transactionRef.set({
                reference,
                date,
                amount,
                settlementAmount,
                fee,
                description,
                customerEmail: email,
                customerPhone: phone,
                virtualAccountNumber: payload.virtualAccount.virtualAccountNumber,
                virtualBank: payload.virtualAccount.virtualBank,
                senderAccountNumber: payload.sender.senderAccountNumber,
                senderBankCode: payload.sender.SenderBankCode,
                senderBankName: payload.sender.senderBankName,
                senderName: payload.sender.senderName,
                message: payload.message,
                code: payload.code
            });
              
            res.status(200).json({ message: 'success' });
        } else {
            res.status(400).json({ message: 'Permission denied, invalid hash.' });
        }
    } catch (error) {
        next(error);
    }
};
