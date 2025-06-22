// Clear aws environment variables
for (const key of Object.keys(process.env)) {
  if (key.startsWith("AWS_")) {
    delete process.env[key];
  }
}

// Optionally, set default values for testing
process.env.NODE_ENV = "test";
