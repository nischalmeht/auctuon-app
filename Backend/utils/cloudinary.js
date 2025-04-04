// require("dotenv").config();
const cloudinary= require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  
const uploadMediaToCloudinary=(file)=>{
    console.log(file,'filefilefilefile')
    return new Promise((resolve,reject)=>{
      const uploadStream = cloudinary.uploader.upload_stream({resource_type: 'auto'}, (error, result) => {
        if (result) {
          resolve(result)
        } else {
            console.log('Error in uploading media', error)
          reject(error)
        }        
      })
      uploadStream.end(file.buffer)
    })
}
const deleteMediaFromCloudinary = async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.log("Error deleting media from cloudinary", error);
      throw error;
    }
  
}
module.exports = {uploadMediaToCloudinary,deleteMediaFromCloudinary}