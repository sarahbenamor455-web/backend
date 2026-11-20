const multer = require('multer')

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true)
        else cb(new Error('Only images are allowed'))
    }
})

const uploadProfilePic = (req, res, next) => {
    upload.single('profilepic')(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image too large (max 2MB)' : err.message
            return res.status(400).json({ message })
        }
        next()
    })
}

module.exports = { uploadProfilePic }