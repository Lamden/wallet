export const queryStateController = (utils) => {

    const getCurrentStamps = async (callback) => {
        try{
            let network = utils.networks.getCurrent()

            let res = await network.blockservice.getCurrentKeyValue('stamp_cost', 'S', 'value')
            let value = utils.getValueFromReturn(res.value)

            if (callback) callback(value)
        }catch(e){
            console.log(e)
            if (callback) callback(null)
        }
    }

    return{
        getCurrentStamps
    }

}