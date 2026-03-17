import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

const allowedOriginSet = new Set<string>();

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean).forEach(o => allowedOriginSet.add(o));
}
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOriginSet.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}
if (process.env.REPLIT_DOMAINS) {
  process.env.REPLIT_DOMAINS.split(',').map(d => d.trim()).filter(Boolean).forEach(d => {
    allowedOriginSet.add(`https://${d}`);
  });
}

app.use(cors({
  origin: allowedOriginSet.size > 0
    ? (origin, callback) => {
        if (!origin || allowedOriginSet.has(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS: origin not allowed'));
        }
      }
    : true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
