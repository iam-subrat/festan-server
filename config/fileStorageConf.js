const {GridFsStorage} = require('multer-gridfs-storage');

const storage = new GridFsStorage({
    url: process.env.DB_PATH,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ["image/png", "image/jpeg"];
        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}`;
            return filename;
        }
        return {
            bucketName: 'uploads',
            filename: `${Date.now()}`
        };
    }
});

module.exports = storage