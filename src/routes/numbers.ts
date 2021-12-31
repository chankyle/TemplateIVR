import { Request, Response } from 'express';
import twilio from 'twilio';

const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

export const numbers = async (req: Request, res: Response): Promise<void> => {
    const { state } = req.body;

    const phoneNumberSearch = await client.availablePhoneNumbers('US').local.list({ inRegion: state, limit: 4 });
    res.json({
        phoneNumberSearch,
    });
};

export { numbers as default };
