import { readFileSync } from 'fs';
process.env.APP_ID = "1871"
process.env.PRIVATE_KEY = readFileSync(__dirname + "/../fixtures/mock-cert.pem", "utf-8")