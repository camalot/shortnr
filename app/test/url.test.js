process.env.NODE_ENV = 'test';
const app = require('./express');

const request = require('supertest-as-promised');
const { assert } = require('chai');

describe('Url', (done) => {
  describe('WHEN UI ENABLED', (done) => {
    // before(async () => {
    //   process.env.NUS_UI_ENABLED = "true";
    // });
    describe('GET /', (done) => {
      it('It should return 200', (done) => {
        request(app)
          .get('/')
          .expect(200, done);
      });
    });
  });

  describe('WHEN UI DISABLED', (done) => {
    // before(async () => {
    //   process.env.NUS_UI_ENABLED = "false";

    //   console.log(process.env.NUS_UI_ENABLED);
    //   return;
    // });
    describe('GET /', (done) => {
      it('It should return 404', (done) => {
        request(app)
          .get('/')
          .expect(404, done);
      });
    });
  });

  // describe('POST /api/shorten', () => {

  // });

});
