/**
 * Cloudinary configuration — optional cloud image storage.
 *
 * To enable:
 *   1. npm install cloudinary
 *   2. Uncomment the block below and set the three env variables in .env
 */

/*
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
*/

// Until Cloudinary is configured, local disk storage (middleware/upload.js) is used.
module.exports = null;
