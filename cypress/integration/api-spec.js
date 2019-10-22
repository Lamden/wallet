import { checkAPI } from '../../src/js/api.js';

describe('Unit Test API functions', function () {
    context('api.js', function () {
      it('is live', function () {
        checkAPI().then((str) => {
          expect( str ).to.eq( 'ok' )
        })
      })

      it('is live', function () {
        checkAPI().then((str) => {
          expect( str ).to.eq( 'ok' )
        })
        
      })

    })
})