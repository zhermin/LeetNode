require("dotenv").config();

// Require the cloudinary library
const cloudinary = require('cloudinary').v2;

// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true
});

console.log(cloudinary.config());

cloudinary.uploader
    .upload("Extra Practice Questions on NVA Method.pdf", {
        //resource_type: ,
        public_id:"LeetNode/Sample_assets/Extra Practice Questions on NVA Method"
    })
    .then((result)=>{
        console.log("success", JSON.stringify(result,null,2));
    })
    .catch((error)=>{
        console.log("error",JSON.stringify(error,null,2));
    })