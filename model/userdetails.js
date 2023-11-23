const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
            instituteName : {
                type : String
            },
            employeeType : {
                type:String,
                required:true
            },
            batchYear : {
                type : String
            },
            enterBatch : {
                type : String
            },
          firstName: {
            type: String,
          },
          lastName: {
            type: String,
          },
          email: {
            type: String,
        },
        regdId : {
            type : String
        },
        mobileNumber : {
            type : String
        },
        password : {
            type : String
        },
        selectAccessPlans : {
            type : String
        },
        expiredDate : {
            type : String
        },
    
    })

    const usersDetails = mongoose.model("usersDetails", productSchema);
    module.exports = usersDetails;