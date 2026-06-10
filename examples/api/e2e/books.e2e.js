const request = require('supertest');
const { MongoClient } = require('mongodb');
const createApp = require('../src/app');
const { config } = require('../src/config');

const DB_NAME = config.dbName;
const MONGO_URI = config.dbUrl;

describe('test books endpoint', () => {
  let app = null;
  let server = null;
  let database = null;
  beforeAll(async () => {
    app = createApp();
    server = app.listen(3002);
    const client = new MongoClient(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    database = client.db(DB_NAME);
  });

  describe('test for GET /api/v1/books', () => {
    test('should return a list of books', async () => {
      // Arrange
      const seedData = await database.collection('books').insertMany([{
        name: 'Book 1',
        year: 1998,
        autor: 'Gaston',
      }, {
        name: 'Book 2',
        year: 2009,
        autor: 'Gaston',
      }]);
      console.log(seedData);
      // Act
      return request(app)
        .get('/api/v1/books')
        .expect(200)
        .then(({ body }) => {
          console.log(body);
          // Assert
          expect(body.length).toEqual(seedData.insertedCount);
        });
    });
  });

  afterAll(async () => {
    await server.close();
    await database.dropDatabase();
  });
});
