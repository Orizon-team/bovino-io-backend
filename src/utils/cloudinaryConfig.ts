import { Request } from 'express';
import type { File as MulterFile } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
// Use require to avoid runtime default-import interop problems with multer in some Node environments
const multer = require('multer');

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: MulterFile) => {
    // Default folder is 'cows' for cow images; fallback to uploads/general
    let folder = 'uploads/general';
    if (file.fieldname === 'imagen' || file.fieldname === 'image' || file.fieldname === 'cow_image') {
      folder = 'cows';
    }

    // Try to determine an entity id from common fields (body or params)
    const bodyAny: any = req.body || {};
    const entityId = bodyAny.id || bodyAny.id_cow || bodyAny.id_usuario || req.params?.id || 'unknown';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    const publicId = `cow_${entityId}_${timestamp}_${randomSuffix}`;

    return {
      folder,
      resource_type: 'image',
      public_id: publicId,
      // Use fetch_format and quality in transformation to let Cloudinary choose best format
      transformation: [
        { width: 800, height: 600, crop: 'limit', fetch_format: 'auto', quality: 'auto' },
      ],
    } as any;
  },
});

const upload = (multer as any)({ storage });

export { cloudinary, storage, upload };

export default upload;
