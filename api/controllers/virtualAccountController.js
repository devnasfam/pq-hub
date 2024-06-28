import fetch from 'node-fetch';

const apiKey = 'PVKEY-Z2PVCUAP8SI5HVDBO6QB96NAG7LJR56X';
const apiSecret = 'PVSECRET-BE0WQ36L5D4B79G0IMSKCLGHX704PTI9F3C5FBH2PBIXENA3TNC7USWSW0WICNLK';

export const createVirtualAccount = async (req, res, next) => {
    try {
        const { email, name, phoneNumber, bankcode, account_type, bvn } = req.body;

        const options = {
            method: "POST",
            body: JSON.stringify({
                email,
                name,
                phoneNumber,
                bankcode,
                account_type,
                businessid: '79D2982BD00342E897CBBB25DD0F57A5',
                bvn
            }),
            headers: {
                'api-key': apiKey,
                'api-secret': `Bearer ${apiSecret}`,
                'Content-Type': 'application/json'
            }
        };

        const apiResponse = await fetch('https://api.payvessel.com/api/external/request/customerReservedAccount/', options);

        if (!apiResponse.ok) {
            const errorText = await apiResponse.json();
            throw new Error(`Error: ${apiResponse.status} - ${errorText}`);
        }

        const data = await apiResponse.json();
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};
