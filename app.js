const express =  require('express');

const parser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const uuid = require('uuid/v4');
const fs = require('fs');
const rimraf = require('rimraf');
var zipper = require('zip-local');

const app = express();

app.use(helmet());
app.use(parser.json());
app.use(cors());

const uploadFolder = 'temporal';
const temporal = multer({ dest: uploadFolder });

app.get('/', (request, response) => {
  response.json({
    message : 'Welcome to image converter service.',
    status : {
      general: true,
    },
  });
});

app.post('/resize', temporal.single('originalImage'), (request, response) => {

    const filePath = request.file.path;

    const requestId = uuid();

    const outputName = request.body.name;
    const outputHeight = parseInt(request.body.height);
    const outputWidth = parseInt(request.body.width);
    
    outputDirectory = 'generated/' + requestId;

    fs.mkdirSync(outputDirectory);

    const outputPath =  outputDirectory + '/' + outputName + '.png';

    sharp(filePath)
    .resize(outputHeight, outputWidth, { fit: 'fill' })
    .toFile(outputPath)
    .then( () => {

        fs.unlinkSync(filePath);
        
        const zipPath = outputDirectory + "/pack.zip"

        zipper.sync.zip(outputDirectory).compress().save(zipPath);

        response.download(zipPath, error => {
            
            if( error ) {
                response.json({message: 'error on download'})
            }
            
            // rimraf.sync(outputDirectory);
        });
    })
    .catch( error => {
        response.json({
            error: error
            })
    })
});



module.exports = app;