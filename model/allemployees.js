const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    employeeName : {
        type:String,
        required:true
    },
    employeeId : {
        type:String,
        required:true
    },
    email : {
        type:String,
        required:true
    },
    password : {
        type:String,
        required:true
    },
    employeeType : {
        type:String,
        required:true
    },
    phoneNumber : {
        type:String,
        required:true
    }

})



const employesData = mongoose.model("allemployees", productSchema);
module.exports = employesData;