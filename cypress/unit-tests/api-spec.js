import {  checkAPI,
          getSwapInfo,
          getTokenInfo
       } from '../../src/js/api.js';

describe('Unit Test API functions', function () {
    context('api.js', function () {

      it('is live', function () {
        cy.wrap( checkAPI() ).then( (result) => {
          expect( result ).to.eq( 'ok' )
        })
      })

      it('audit-contract endpoint returns contract information', function () {
        cy.fixture('unit-tests/api.json').then(( f_api ) => {
          const fData = f_api.getSwapInfo.data
          const fResult = f_api.getSwapInfo.result

          cy.wrap( getSwapInfo( fData.network_symbol,
                                fData.contract,
                                fData.transaction_address))
            .then((result) => {
            Object.keys( fResult).map(function( key ) {
              expect( result[key] ).to.eq( fResult[key] )
            });
          })
        })
      })

      it('token-details endpoint returns the correct token information', function () {
        cy.fixture('unit-tests/api.json').then(( f_api ) => {
          const fData = f_api.getTokenInfo.data
          const fResult = f_api.getTokenInfo.result 

          cy.wrap( getTokenInfo( fData.network_symbol,
                                 fData.token_address))
            .then(( result ) => {
            Object.keys( fResult ).map(function( key ) {
              expect( result[key] ).to.eq( fResult[key] )
            });
          })
        })
      })

    })
})