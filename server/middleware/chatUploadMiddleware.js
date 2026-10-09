const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'chat');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  // Documents
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'application/zip',
  'application/x-zip-compressed'
];

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.txt', '.docx', '.doc', '.xlsx', '.xls', '.zip'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate safe unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedOriginal).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Strictly reject executable or script extensions
  const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.js', '.mjs', '.php', '.py', '.html', '.htm', '.svg'];
  if (dangerousExts.includes(ext)) {
    return cb(new Error('Executable or script files are strictly prohibited.'), false);
  }

  if (ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type (${ext}). Allowed: PNG, JPG, JPEG, WEBP, PDF, TXT, DOCX, XLSX, ZIP.`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
