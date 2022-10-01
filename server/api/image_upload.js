const AWS = require('aws-sdk');
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

const Project = require("../db/models/project.model");
const Page = require("../db/models/page.model");
const Assets = require("../db/models/assets.model");

const express = require('express');
const router = express.Router();

const S3ID = 'DO00REGH3AEMTDAK96AP'
const S3KEY = 'RpQMGhMBKMwpIfiujf97alnTBS/nIo4+zQOEtql879o'

AWS.config.update({
  accessKeyId: process.env.S3ID || S3ID,
  secretAccessKey: process.env.S3KEY || S3KEY,
});

let s3 = new S3Client({
  region: 'ca-central-1',
  endpoint: new AWS.Endpoint('sgp1.digitaloceanspaces.com/'),
  credentials: {
    accessKeyId: S3ID,
    secretAccessKey: S3KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const uploadToBucket = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'devonian-apps',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      // console.log('metadat >>>>>>>>>>>>>>\n', file)
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      // use file extension from the file mimetype

      // console.log(file)
      cb(null, `simplewebsitenow/${Date.now().toString()  }.${  file.mimetype.split('/')[1].split('+')[0]}`)
    }
  }),
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    
    // file filters 
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|svg/;
        const mimetype = filetypes.test(file.mimetype);
        console.log({uploadedFileMimeType: mimetype})
        if (mimetype) {
            return cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).single('image')


router.post('/api/asset', async (req, res) => {

  // console.log(req.body)
  let page = await Page.findOne({where : {id: req.body.pid}})
  let project = await Project.findOne({ where: { id: page?.projectID, ownerID: req.user.id} })

  if(!req.body.pid || !req.body.asset?.src || !Number(req.body.pid) || !page || !project){
    res.error('Unauthorized!')
    return
  }

  let asset = await Assets.create({
    projectID: project.id,
    src: req.body.asset.src
  })
  await asset.get()
  res.success('done', asset)
})


// Delete an asset from the DB
router.delete('/api/asset', async (req, res) => {

  // console.log(req.body)
  let asset = await Assets.findOne({where : {id: req.body.aid}})
  let project = await Project.findOne({ where: { id: asset?.projectID, ownerID: req.user.id} })

  if(!req.body.aid || !Number(req.body.aid) || !asset || !project){
    res.error('Unauthorized!')
    return
  }

  await asset.destroy()
  res.success('done', asset)
})


router.post('/api/image/upload'/* , uploadToBucket.single('image') */, async (req, res) => {

  uploadToBucket(req, res, err => {
  
    if (err) {
      console.log(err);
      return res.status(400).json({ errors: err });
    }

    return res.success('Uploaded!', [{src: req.file.location, type: 'image'}]);
  });

  // console.log({files: req.files, file: req.file })
  // res.json('done')
})

module.exports = router;