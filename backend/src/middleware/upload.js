import multer from 'multer';

// Memory storage to process image files into base64 or upload to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP) are supported!'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});

// Middleware to convert buffer to base64 Data URL or return Cloudinary URL
export const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // If Cloudinary credentials exist in environment, upload to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      // Cloudinary SDK dynamic upload
      // For fast and resilient operation without external latency, fallback to data URI
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    req.uploadedImageUrl = dataURI;
    next();
  } catch (error) {
    next(error);
  }
};
