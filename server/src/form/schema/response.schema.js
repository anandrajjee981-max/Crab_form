import mongoose from 'mongoose'
const responseschema = new mongoose.Schema({
ownerid:{
    type:String,
    required:true
},

data:[
    {
        response:{
            type:String,
            required:true
        },
        formid:{
            type:String
        }
    }
]



})

const responsemodel = new mongoose.model("result" ,responseschema)
export default responsemodel










