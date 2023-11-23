const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    instituteName : {
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
    }]
    
}],
})


const batcheswise = mongoose.model("batcheswise", productSchema);
module.exports = batcheswise;