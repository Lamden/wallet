describe('Unit Test of app utility functions', function () {
    context('utils.js', function () {
        it('should pass but is failing', function () {
            function returningValue(){
                let returningValue;
                try{
                    returningValue = "thisValue";
                }catch{
                    throw new Error()
                }
                return returningValue;
            }
            expect( returningValue() ).to.eq( "thisValue" )
        })

    })
})