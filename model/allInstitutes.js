const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    instituteName : {
        type:String,
        // required:true
    },
    headName : {
        type:String,
        // required:true
    },
    primaryemail : {
        type:String,
        // required:true
    },
    primaryContactNumber : {
        type:String,
        required:true
    },
    secondaryEmail : {
        type:String,
        // required:true
    },
    secondaryContactNumber : {
        type:String,
        // required:true
    },
    batchYears: [
        {
        batchYear: {
            type: String,
          },
        batchName: [
            {
                enterBatch: {
                type: String,
            },        
    }],
        }],
    cityName : {
        type:String,
        // required:true
    },
    instituteCode : {
        type:String,
        // required:true
    },
    instituteType : {
        type:String,
        // required:true
    },
    selectAccessPlans: {
      type: String,
    //   required:true

    },
    password: {
        type: String,
        // required:true
    }
})


const allinstitutes = mongoose.model("allinstitutes_new", productSchema);
module.exports = allinstitutes;