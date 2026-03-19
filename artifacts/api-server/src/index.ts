import app from "./app";

if (process.env.NODE_ENV === 'production' && !process.env.DELEGATION_AUTH_SECRET?.trim()) {
  throw new Error('DELEGATION_AUTH_SECRET is required in production. Server cannot start without it.');
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
