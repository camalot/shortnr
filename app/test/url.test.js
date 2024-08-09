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


// const app = require('../config/express');
// const base58 = require('../api/helpers/base58');
// const Url = require('../api/models/Url');

// describe('Url', () => {

//   describe('POST /api/shorten', () => {
//     it('It should short the url: https://medium.com/@xoor/jwt-authentication-service-44658409e12c', (done) => {
//       request(app)
//         .post('/api/shorten')
//         .send({
//           url: 'https://medium.com/@xoor/jwt-authentication-service-44658409e12c',
//         })
//         .expect(201)
//         .then((res) => {
//           assert.equal(res.body.shortUrl.split('/').slice(-1)[0], base58.encode(1));
//           done();
//         });
//     });
//   });

//   describe('GET /:encodedId', () => {
//     it('It should retrieve the shorten version of the url: https://medium.com/@xoor/jwt-authentication-service-44658409e12c', (done) => {
//       request(app)
//         .get(`/${base58.encode(1)}`)
//         .expect(302, done);
//     });
//   });
// });
