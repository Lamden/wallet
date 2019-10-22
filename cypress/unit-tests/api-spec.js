import {  checkAPI,
          getSwapInfo,
          getTokenInfo,
          getApproveTokenTxDetails,
          makeBalancesPost,
          getSecret,

       } from '../../src/js/api.js';

describe('Unit Test API functions', function () {
    context('api.js', function () {

      it('is live', function () {
        cy.wrap( checkAPI() ).then( (result) => {
          expect( result ).to.eq( 'ok' )
        })
      })

      it('calls the audit-contract endpoint returns contract information', function () {
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

      it('calls the token-details endpoint returns the correct token information', function () {
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

      it('calls the approve-token endpoint returns the correct transaction information', function () {
        cy.fixture('unit-tests/api.json').then(( f_api ) => {
          const fData = f_api.getApproveTokenTxDetails.data
          const fResult = f_api.getApproveTokenTxDetails.result 

          cy.wrap( getApproveTokenTxDetails( fData.network_symbol,
                                             fData.value,
                                             fData.senderVk,
                                             fData.token_address))
            .then(( result ) => {
            Object.keys( result ).map(function( key ) {
              cy.wrap(fResult).should('contain', key)
            });
          })
        })
      })
      
      it('calls the secret endpoint returns the correct secret', function () {
        cy.fixture('unit-tests/api.json').then(( f_api ) => {
          const fData = f_api.getSecret.data
          const fResult = f_api.getSecret.result 

          cy.wrap( getSecret( fData.network_symbol,
                              fData.contract_address))
            .then(( result ) => {
            Object.keys( fResult ).map(function( key ) {
              expect( result[key] ).to.eq( fResult[key] )
            });
          })
        })
      })

      it('makes the POST object for the get-balances endpoint', function () {
        cy.fixture('unit-tests/api.json').then(( f_api ) => {
          const fData = f_api.makeBalancesPost.data
          const fResult = f_api.makeBalancesPost.result 

          cy.wrap( makeBalancesPost( fData ))
            .then(( result ) => {
              result.address_list.map( (m, i) => {
                expect( m ).to.deep.equal( fResult.address_list[i] )
              })
          })
        })
      })

    })
})