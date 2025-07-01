import path from 'path';
import fs from 'fs';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = './test_data/test_ndc_chatbot.db';
process.env.PORT = '3002';

// Clean up test database before and after tests
beforeAll(async () => {
  const testDbDir = path.dirname(process.env.DATABASE_PATH!);
  if (!fs.existsSync(testDbDir)) {
    fs.mkdirSync(testDbDir, { recursive: true });
  }
});

afterAll(async () => {
  // Clean up test database and directory
  try {
    const testDbDir = path.dirname(process.env.DATABASE_PATH!);
    if (fs.existsSync(testDbDir)) {
      // Remove all files in the directory
      const files = fs.readdirSync(testDbDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testDbDir, file));
      }
      // Remove the directory
      fs.rmdirSync(testDbDir);
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});

// Add a dummy test to prevent jest error
test('setup test', () => {
  expect(true).toBe(true);
});