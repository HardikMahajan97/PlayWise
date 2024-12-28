import dotenv from 'dotenv';
dotenv.config();

import twilio from "twilio";

const acc_sid = process.env.TWILIO_AC_SID;
const acc_auth_token = process.env.TWILIO_AC_AUTH_TOKEN;
const client = twilio(acc_sid, acc_auth_token);

export default client;