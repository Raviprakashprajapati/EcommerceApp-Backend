import { v2 as cloudionary } from "cloudinary"
import fs from "fs"

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (localFilePath)=>{
    try {

        if(!localFilePath) return null;

        //upload the file on cloudinary
         const response =  await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        //file has been uploaded succesfulyy
        // console.log("file is uploaded on cloudinary ",response.url);
        fs.unlinkSync(localFilePath);
        return response.url;
        
    } catch (error) {

        fs.unlinkSync(localFilePath) //remove the locally save temporary file as the upload operation got failed
        return null;
        
        
    }
}


// Function to delete an image by its URL
const deleteCloudinaryImageUrl = async (imageUrl) => {
    try {
      // Extract the public ID from the image URL
      const publicId = cloudinary.url(imageUrl, { secure: true }).split('/').pop().replace(/\..+$/, '');
  
      // Delete the image by its public ID
      const result = await cloudinary.uploader.destroy(publicId);
  
    } 
    catch (error) {
      console.error('Error:', error.message);
    }
  };
  



export {uploadOnCloudinary,deleteCloudinaryImageUrl};




