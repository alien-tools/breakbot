import { readFileSync } from 'fs';
import path from 'path';

process.env.APP_ID = "119017"
process.env.PRIVATE_KEY = readFileSync(path.join(__dirname, "../fixtures/mock-cert.pem"), "utf-8")
process.env.MARACAS_URL = "http://maracas-server.org"
process.env.WEBHOOK_PROXY_URL = "http://webhook-server.org"
