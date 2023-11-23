const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const employesData = require("./model/allemployees");
const allinstituteData = require("./model/allInstitutes");
const usersDetails = require("./model/userdetails");
const allLearningPaths = require("./model/allLearningPaths");
const batcheswise = require("./model/batcheswise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const middleware = require("./middleware/jwtAuth");
const app = express();
app.use(express.json());
app.use(cors());
const { ObjectId } = require('mongodb');
const allinstitutes = require("./model/allInstitutes");
const port = 2115;

mongoose
  .connect(   
  "mongodb+srv://saiprakash2115:m1Yb7ZlsB0nVVGbY@cluster0.r19eo2o.mongodb.net/skillhubproject?retryWrites=true&w=majority"
  )
  .then((res) => console.log("DB Connected"))
  .catch((err) => console.log(err.message));

//login api
  app.post("/login", async (req, res) => {
  try {
    const { regdId, password } = req.body;
    const exist = await usersDetails.findOne({ regdId });
    if (!exist) {
      return res.status(400).send("User Not Found");
    }

    const isPasswordMatched = await bcrypt.compare(password,exist.password)

    if(exist.password === password || isPasswordMatched){
         // other than admin - ADMIN id : SH1001
    if (req.body.regdId === "SH1001" ) {
        const empType = exist.employeeType;
        const currentTime = new Date();
        console.log("admin login successfull");
        let payload = {
          user: {
            regdId: exist.regdId
          },
        };  
        jwt.sign(
          payload,
          "jwtPassword",
          { expiresIn: '10hr' },
          (err, token) => {
            if (err) throw err;
            return res.json({ token, empType, currentTime });
          }
        );
      } else if (
        req.body.regdId !== "SH1001" &&
        exist.employeeType === "User" 
      ) {
        const empType = exist.employeeType;
        const currentTime = new Date();
        console.log("User login successfull");
        let payload = {
          user: {
            regdId: exist.regdId,
          },
        };
  
        jwt.sign(
          payload,
          "jwtPassword",
          { expiresIn: '10hr' },
          (err, token) => {
            if (err) throw err;
            return res.json({ token, empType, currentTime });
          }
        );      
      }
    }else{
        return res.status(400).json({message: "Invalid Password"})
    }    
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ data: "Server Error" });
  }
});
//get admin details
app.get("/individualEmployee/", middleware,  async (req, res) => {
    const regdId = req.employeeId.regdId;
    console.log(req.employeeId.regdId,"sai")
    const user = await usersDetails.findOne({regdId:regdId})
    console.log(user,"prakash")
    if (user) {
    return  res.status(200).send(user)
    }
    res.status(400).json("user not found");
})
// addinstitute details
app.post("/addInstitute", middleware, async (req, res) => {
  try {
    const institute = await allinstituteData.findOne({
       instituteName: req.body.instituteName,
    });
    console.log(req.body)
    if (!institute) {
        // const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newInstitute = {
        instituteName: req.body.instituteName,
        headName: req.body.headName,
        primaryemail: req.body.primaryemail,
        password: req.body.password,
        primaryContactNumber: req.body.primaryContactNumber,
        secondaryEmail: req.body.secondaryEmail,
        secondaryContactNumber: req.body.secondaryContactNumber,
        enterBatch: req.body.enterBatch,
        batchYear: req.body.batchYear,
        cityName: req.body.cityName,
        instituteCode:req.body.instituteCode,
        instituteType: req.body.instituteType,
        selectAccessPlans: req.body.selectAccessPlans,
      };
      const instituteDetails = await allinstituteData.create(newInstitute);
      res.status(200).send("Institute created successfully");
    } else {
      res.status(402).json("Institute already registered");
    }
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

//get AllInstitutes
app.get("/getAllInstitutes", middleware, async (req, res) => {
  const allInstitutes = await allinstituteData.find();
  res.status(200).send(allInstitutes);
});

//update password in institute
app.put("/updatepassword", middleware, async (req, res) => {
  try {
    const { _id, newPassword } = req.body;
    const result = await allinstituteData.findByIdAndUpdate(_id, { password: newPassword }, { new: true })  
    if (result) {
    res.status(200).json("password updated successfully");
    }else{
     res.status(404).json("updatedpassword not found");
    }
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json("An error occurred while updating password");
  }
}); 
//update password in User
app.put("/updatepasswordUser", middleware, async (req, res) => {
  try {
    const { _id, newPassword } = req.body;
    const result = await usersDetails.findByIdAndUpdate(_id, { password: newPassword }, { new: true })  
    if (result) {
    res.status(200).json("password updated successfully");
    }else{
     res.status(404).json("updatedpassword not found");
    }
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json("An error occurred while updating password");
  }
}); 
//selected Delete
app.delete("/onselectedDelete/:_id",async(req,res)=>{
  const _id = req.params;
  const deletedUser = await allinstituteData.findByIdAndDelete(_id, req.body);
  console.log(deletedUser)
  if(!deletedUser){
     return res.status(404).json("Not Found!")
  }
  return res.status(200).json("User Deleted Successfully")
})

//EditInstitute form 
app.post("/editInstitute", middleware, async (req, res) => {
  console.log(req.body.userData,"sai")
  const id = req.body._id
  const updatedfields =req.body.nonemptyuserData
  const newData = {...updatedfields,} 
  try {
    const result = await allinstituteData.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      {$set:newData},
      { new: true }
    );
    if (result) {
      res.status(200).send("Institute Updated successfully");
      console.log('Document updated:', result);
    } else {
      console.log('Document not found');
    }
  } catch (error) {
    console.error('Error updating document:', error);
  }
});
//edit User api
app.post("/editUser", middleware, async (req, res) => {
  console.log(req.body._id,"sai")
  const id = req.body._id
  const updatedfields =req.body.nonemptyuserData
  const newData = {...updatedfields,} 
  try {
    const result = await usersDetails.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      {$set:newData},
      { new: true }
    );
    if (result) {
      res.status(200).send("User Updated successfully");
      console.log('Document updated:', result);
    } else {
      console.log('Document not found');
    }
  } catch (error) {
    console.error('Error updating document:', error);
  }
});
//addusers api
app.post("/addUsers", middleware, async (req, res) => {
  try {
        console.log(req.body.userData)
        const newUser = {
        instituteName: req.body.userData.instituteName,
        batchYear: req.body.userData.batchYear,
        enterBatch: req.body.userData.enterBatch,
        firstName: req.body.userData.firstName,
        lastName: req.body.userData.lastName,
        email: req.body.userData.email,
        regdId: req.body.userData.regdId,
        mobileNumber: req.body.userData.mobileNumber,
        password: req.body.userData.password,
        expiredDate: req.body.userData.expiredDate,
        selectAccessPlans: req.body.userData.selectAccessPlans,
      };
      const instituteDetails = await usersDetails.create(newUser);
      res.status(200).send("Institute created successfully");
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});
//get allUsersData
app.get("/getAllUsersDetails", middleware, async (req, res) => {
  const allUsersDetails = await usersDetails.find();
  res.status(200).send(allUsersDetails);
});
//get IndividualUsersData
app.get("/induserDetails/:id", middleware, async (req, res) => {
  const {id} = req.params
  const indUsersDetails = await usersDetails.findById(id);
  res.status(200).send(indUsersDetails);
});
//add Multipleusers
app.post("/addMultipleUsers", middleware, async (req, res) => {
  // const {excelData} = req.body
  try {
      console.log(req.body,"sai")        
      const instituteDetails = await usersDetails.create(req.body);
      return res.status(200).send("users created successfully");
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

//addlearningpath
app.post("/addlearningpath", middleware, async (req, res) =>{
  console.log(req.body,"sai")
  try{
  const {learningPathTitle,relevantSkillTags,coverLetter,difficultyLevel,subscription,price,discount,authorName,hours,minutes,learningimg,fileName,requirements} = req.body
  const isLearningPathExist = await allLearningPaths.findOne({ learningPathTitle: learningPathTitle }); 
     if (isLearningPathExist){
        return res.send({msg:"Path Already Registered",status:"failed"})
     }
         let newLearningPath = new allLearningPaths({
          learningPathTitle,
          relevantSkillTags,
          coverLetter,
          difficultyLevel,
          subscription, 
          price,   
          discount, 
          authorName, 
          hours,
          minutes,
          learningimg,
          fileName,
          requirements,
            }) 
      newLearningPath.save();//saving mongodb collection
      return res.send({msg:"Path Created Successfully",status:"success"});
    } catch (e) {
      console.error(e.message);
      res.status(500).send("Internal Server Error");
   }
 })
//updatelearningpath
app.put("/updatelearningpath/:learningPathId", middleware, async (req, res) => {
  try {
    const learningPathId = req.params.learningPathId;
    const {
      learningPathTitle,
      relevantSkillTags,
      coverLetter,
      difficultyLevel,
      subscription,
      price,
      discount,
      authorName,
      hours,
      minutes,
      learningimg,
      fileName,
      requirements,
    } = req.body;

    // Find the existing learning path by ID
    const existingLearningPath = await allLearningPaths.findById(learningPathId);

    if (!existingLearningPath) {
      return res.status(404).json({ msg: "Learning path not found", status: "failed" });
    }

    // Update the properties of the existing learning path
    existingLearningPath.learningPathTitle = learningPathTitle;
    existingLearningPath.relevantSkillTags = relevantSkillTags;
    existingLearningPath.coverLetter = coverLetter;
    existingLearningPath.difficultyLevel = difficultyLevel;
    existingLearningPath.subscription = subscription;
    existingLearningPath.price = price;
    existingLearningPath.discount = discount;
    existingLearningPath.authorName = authorName;
    existingLearningPath.hours = hours;
    existingLearningPath.minutes = minutes;
    existingLearningPath.learningimg = learningimg;
    existingLearningPath.fileName = fileName;
    existingLearningPath.requirements = requirements;

    // Save the updated learning path document
    await existingLearningPath.save();

    return res.json({ msg: "Learning path updated successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//addTopicsinLearningPath
// app.put("/addTopicsinlearningpath", middleware, async (req, res) => {
//   try {
//     const _id  = req.body._id;
//     const topicName = req.body.topicName
//     const description = req.body.description
//     const publish = req.body.publish
//     console.log(_id,req.body,topicName,description,publish);
//     const topics = req.body;
//     const filter = {_id:_id,"topics": { $elemMatch:{"topicName":topicName}}};
//     const update ={
//       $set:{ 
//         ["topics.$.topicName"]:topicName,
//         ["topics.$.description"]:description,
//         ["topics.$.publish"]:publish,

//     }
//   }
//   const sameTopic = await allLearningPaths.findOne(filter)
//     if (sameTopic){
//       const updateTopic = await allLearningPaths.findOneAndUpdate(filter,update);
//       return res.status(200).send(updateTopic)
//   }
//   const setnewTopic= await allLearningPaths.updateOne({_id:_id},{$push: {[`topics`]: topics}})
//   if (!setnewTopic) {
// 		return res.status(400).json("topic not found");
// 	  }
//     res.status(200).json("Topic details updated successfully");
//   } catch (error) {
//     console.error("Error updating Topic:", error);
//     res.status(500).json("An error occurred while updating Topic");
// }
// });
app.post("/addTopic/:learningPathId", middleware, async (req, res) => {
  try {
    const learningPathId = req.params.learningPathId;
    const { topicName, description, publish } = req.body;

    // Find the existing learning path by ID
    const existingLearningPath = await allLearningPaths.findById(learningPathId);

    if (!existingLearningPath) {
      return res.status(404).json({ msg: "Learning path not found", status: "failed" });
    }

    // Check if the topic with the same name already exists
    const isTopicExist = existingLearningPath.topics.some(
      (topic) => topic.topicName === topicName
    );

    if (isTopicExist) {
      return res.status(400).json({ msg: "Topic with the same name already exists", status: "failed" });
    }

    // Create a new topic
    const newTopic = {
      topicName,
      description,
      publish
    };

    // Add the new topic to the "topics" array in the learning path
    existingLearningPath.topics.push(newTopic);

    // Save the updated learning path document
    await existingLearningPath.save();

    return res.json({ msg: "Topic added successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//updateTopicinlearningPath
app.put("/updateTopic/:learningPathId/:topicId", middleware, async (req, res) => {
  try {
    const learningPathId = req.params.learningPathId;
    const topicId = req.params.topicId;
    const { topicName, description, publish } = req.body;

    // Find the existing learning path by ID
    const existingLearningPath = await allLearningPaths.findById(learningPathId);

    if (!existingLearningPath) {
      return res.status(404).json({ msg: "Learning path not found", status: "failed" });
    }

    // Find the index of the topic within the "topics" array
    const topicIndex = existingLearningPath.topics.findIndex((t) => t._id.toString() === topicId);

    if (topicIndex === -1) {
      return res.status(404).json({ msg: "Topic not found", status: "failed" });
    }

    // Update the properties of the existing topic
    existingLearningPath.topics[topicIndex].topicName = topicName;
    existingLearningPath.topics[topicIndex].description = description;
    existingLearningPath.topics[topicIndex].publish = publish;

    // Save the updated learning path document
    await existingLearningPath.save();

    return res.json({ msg: "Topic updated successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});

//addContent in topic of Learningpath
// app.put("/addContentOfTopicsinlearningpath", middleware, async (req, res) => {
//   try {
//     const _id = req.body._id;
//     const topicName = req.body.topicName
//     const contentTitle = req.body.contentTitle
//     const contentdes = req.body.contentdes
//     const contentimg = req.body.contentimg
//     const publish = req.body.publish
//     console.log(_id,req.body,topicName);
//     const content = req.body;
//     const filter = {_id:_id,"topics": { $elemMatch:{"topicName":topicName}}};
//     const update ={
//       $set:{ 
//         ["topics.content.$.contentTitle"]:contentTitle,
//         ["topics.content.$.contentdes"]:contentdes,
//         ["topics.content.$.contentimg"]:contentimg,
//         ["topics.content.$.publish"]:publish,   
//     }
//   }
//   const sameContent = await allLearningPaths.findOne(filter)
//     if (sameContent){
//       const updateContent = await allLearningPaths.findOneAndUpdate(filter,update);
//       return res.status(200).send(updateContent)
//   }
//   const setnewContent= await allLearningPaths.updateOne({_id:_id},{$push: {[`topics.$.content`]: content}})
//   if (!setnewContent) {
// 		return res.status(400).json("content not found");
// 	  }
//     res.status(200).json("content details updated successfully");
//   } catch (error) {
//     console.error("Error updating content:", error);
//     res.status(500).json("An error occurred while updating content");
// }
// });
app.post("/addContentOfTopicsinlearningpath", middleware, async (req, res) => {
  try {
    const { _id,topicName,contentTitle, contentdes, contentimg, publish } = req.body;
    // const topicId = req.params.topicId;

    // Find the learning path by ID
    const learningPath = await allLearningPaths.findById(_id);

    if (!learningPath) {
      return res.status(404).json({ msg: "Learning path not found", status: "failed" });
    }

    // Find the topic within the learning path by ID
    const topic = learningPath.topics.find((t) => t.topicName.toString() === topicName);

    if (!topic) {
      return res.status(404).json({ msg: "Topic not found", status: "failed" });
    }

    // Add the new content to the "content" array in the topic
    topic.content.push({
      _id: req.body._id,
      contentTitle,
      contentdes,
      contentimg,
      publish,
    });

    // Save the updated learning path document
    await learningPath.save();

    return res.status(200).json({ msg: "Content added successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//updatecontentintopicoflearningpath
app.put("/updateContent/:learningPathId/:topicId/:contentId", middleware, async (req, res) => {
  try {
    const learningPathId = req.params.learningPathId;
    const topicId = req.params.topicId;
    const contentId = req.params.contentId;
    const { contentTitle, contentdes, contentimg, publish } = req.body;

    // Find the existing learning path by ID
    const existingLearningPath = await allLearningPaths.findById(learningPathId);

    if (!existingLearningPath) {
      return res.status(404).json({ msg: "Learning path not found", status: "failed" });
    }

    // Find the topic within the learning path by ID
    const topic = existingLearningPath.topics.find((t) => t._id.toString() === topicId);

    if (!topic) {
      return res.status(404).json({ msg: "Topic not found", status: "failed" });
    }

    // Find the index of the content item within the "content" array
    const contentIndex = topic.content.findIndex((c) => c._id.toString() === contentId);

    if (contentIndex === -1) {
      return res.status(404).json({ msg: "Content not found", status: "failed" });
    }

    // Update the properties of the existing content
    topic.content[contentIndex].contentTitle = contentTitle;
    topic.content[contentIndex].contentdes = contentdes;
    topic.content[contentIndex].contentimg = contentimg;
    topic.content[contentIndex].publish = publish;

    // Save the updated learning path document
    await existingLearningPath.save();

    return res.json({ msg: "Content updated successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//deleteLearningPath
app.delete("/onselectedLearningPath/:_id",async(req,res)=>{
  const _id = req.params;
  const deletedLearningPath = await allLearningPaths.findByIdAndDelete(_id, req.body);
  console.log(deletedLearningPath)
  if(!deletedLearningPath){
     return res.status(404).json("Not Found!")
  }
  return res.status(200).json("Deleted Successfully")
})
//deleteTopicinLearningPath
app.delete("/onselectedTopicinLearningPath/:learningPathId/:topicId",async(req,res)=>{
  try {
    const learningPathId = req.params.learningPathId;
    const topicId = req.params.topicId;

    // Find the learning path by ID
    const learningPath = await allLearningPaths.findById(learningPathId);

    if (!learningPath) {
      return res.status(404).json({ msg: "Learning path not found", status: "failed" });
    }

    // Find the index of the topic within the "topics" array
    const topicIndex = learningPath.topics.findIndex((t) => t._id.toString() === topicId);

    if (topicIndex === -1) {
      return res.status(404).json({ msg: "Topic not found", status: "failed" });
    }

    // Remove the topic and all its content from the "topics" array
    learningPath.topics.splice(topicIndex, 1);

    // Save the updated learning path document
    await learningPath.save();

    return res.status(200).json({ msg: "Topic and content deleted successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//deleteContentofTopicinLearningPath
app.delete("/onselectedContentinTopicinLearningPath/:learningPathId/:topicId/:contentId",async(req,res)=>{
  try {
    const learningPathId = req.params.learningPathId;
    const topicId = req.params.topicId;
    const contentId = req.params.contentId;

    // Find the learning path by ID
    const learningPath = await allLearningPaths.findById(learningPathId);

    if (!learningPath) {
      return res.status(404).json({ msg: "Learning path not found", status: "failed" });
    }

    // Find the topic within the learning path by ID
    const topic = learningPath.topics.find((t) => t._id.toString() === topicId);

    if (!topic) {
      return res.status(404).json({ msg: "Topic not found", status: "failed" });
    }

    // Find the index of the content item within the "content" array
    const contentIndex = topic.content.findIndex((c) => c._id.toString() === contentId);

    if (contentIndex === -1) {
      return res.status(404).json({ msg: "Content not found", status: "failed" });
    }

    // Remove the content item from the "content" array
    topic.content.splice(contentIndex, 1);

    // Save the updated learning path document
    await learningPath.save();

    return res.status(200).json({ msg: "Content deleted successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//getalllearningpaths
app.get("/alllearningpaths", middleware, async (req, res) => {
  try {
    // Fetch all learning paths from the database
    const allLearningPaths = await allLearningPaths.find();

    return res.json({ learningPaths: allLearningPaths, status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//addbatchYears
app.post("/addBatchYear/:instituteId", async (req, res) => {
  try {
    const instituteId = req.params.instituteId;
    console.log(req.params,req.body,"sai")

    // Find the institute by ID
    const institute = await allinstitutes.findById( instituteId );

    if (!institute) {
      return res.status(404).json({ msg: "Institute not found", status: "failed" });
    }

    const batchYear = req.body.batchYear;
    console.log(batchYear,"sss")
    // Check if the batch year already exists within the institute
    const existingBatchYear = institute.batchYears.find(
      (batch) => batch.batchYear === batchYear
    );

    if (existingBatchYear) {
      return res.status(400).json({
        msg: "Batch year with the same name already exists",
        status: "failed",
      });
    }

    // Create a new batch year with an empty batch name array
    const newBatchYear = {
      batchYear,
      batchName: [],
    };

    // Add the new batch year to the "batchYears" array in the institute
    institute.batchYears.push(newBatchYear);

    // Save the updated institute document
    await institute.save();

    return res.status(200).json({ msg: "Batch year added successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//updatebatchyear
app.put("/updateBatchYear/:instituteId/:batchYearId", async (req, res) => {
  try {
    const instituteId = req.params.instituteId;
    const batchYearId = req.params.batchYearId;
    console.log(instituteId,batchYearId,"sai")
    // Find the institute by ID
    const institute = await allinstituteData.findById(instituteId);

    if (!institute) {
      return res.status(404).json({ msg: "Institute not found", status: "failed" });
    }

    // Find the index of the batch year within the institute
    const batchYearIndex = institute.batchYears.findIndex(
      (batch) => batch._id.toString() === batchYearId
    );

    if (batchYearIndex === -1) {
      return res.status(404).json({ msg: "Batch year not found", status: "failed" });
    }

    const newBatchYear  = req.body.batchYear;
    console.log(newBatchYear)
    // Update the batch year with the new details
    institute.batchYears[batchYearIndex].batchYear = newBatchYear;

    // Save the updated institute document
    await institute.save();

    return res.json({ msg: "Batch year updated successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//deletebatchyear
app.delete("/deleteBatchYear/:instituteId/:batchYearId", async (req, res) => {
  console.log(req.params,"sai")
  try {
    const instituteId = req.params.instituteId;
    const batchYearId = req.params.batchYearId;

    // Find the institute by ID
    const institute = await allinstituteData.findById(instituteId);

    if (!institute) {
      return res.status(404).json({ msg: "Institute not found", status: "failed" });
    }

    // Find the index of the batch year within the institute
    const batchYearIndex = institute.batchYears.findIndex(
      (batch) => batch._id.toString() === batchYearId
    );

    if (batchYearIndex === -1) {
      return res.status(404).json({ msg: "Batch year not found", status: "failed" });
    }

    // Remove the batch year from the "batchYears" array
    institute.batchYears.splice(batchYearIndex, 1);

    // Save the updated institute document
    await institute.save();

    return res.json({ msg: "Batch year deleted successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//addBatches
app.post("/addBatch/:instituteId", async (req, res) => {
  console.log(req.params,req.body,"sai")
  try {
    const instituteId = req.params.instituteId;

    // Find the institute by ID
    const institute = await allinstituteData.findById(instituteId);

    if (!institute) {
      return res.status(404).json({ msg: "Institute not found", status: "failed" });
    }

    const { batchYear, enterBatch } = req.body;

    // Find the batch year within the institute
    const existingBatchYear = institute.batchYears.find(
      (batch) => batch.batchYear === batchYear
    );

    if (!existingBatchYear) {
      // If the batch year does not exist, create a new one
      institute.batchYears.push({
        batchYear,
        batchName: [{ enterBatch }],
      });
    } else {
      // If the batch year exists, add the batch name to it
      existingBatchYear.batchName.push({ enterBatch });
    }

    // Save the updated institute document
    await institute.save();

    return res.json({ msg: "Batch added successfully", status: "success" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ msg: "Internal Server Error", status: "failed" });
  }
});
//
app.listen(port, () => {
  console.log(`server running at ${port}`);
});