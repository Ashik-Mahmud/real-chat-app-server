/* create chat */
const createChat = async(req, res) =>{
    res.status(202).send({
        success: true,
        message: `Create chat route`
    })
}

//import 
module.exports = {createChat}