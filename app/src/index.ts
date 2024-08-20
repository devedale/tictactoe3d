import app from './app';

/** The port number on which the server will listen. Defaults to 3000 if `process.env.API_PORT` is not defined. */
const PORT: number = parseInt(process.env.API_PORT || '3000');

/** Starts the Express server and listens on the specified port. Logs a message to the console indicating the server is running. */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
