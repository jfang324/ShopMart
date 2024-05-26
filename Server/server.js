const dotenv = require('dotenv');
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const items = require('./models/item.js');
const {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

dotenv.config();

const app = express();
const upload = multer({});
const PORT = process.env.PORT || '3000';

const bucketName = process.env.BUCKET_NAME;                                 
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
});

mongoose.connect(process.env.CONNECTION_URL);
let conn = mongoose.connection;

app.set('views', __dirname + '/views');                           
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/dist'));
app.use(express.json());

app.get('/items', async function(req, res){
    /**
     * Handles GET requests to /items
     * 
     * Status Code:
     *  - 200 if items were retrieved successfully
     *  - 500 if there was an error
     * 
     * Response:
     *  returns all items in the database if retrieved successfully and
     *  an error if there was an issue
     */

    try{
        let results = await items.find({}).catch((err) => {
            throw err;
        });

        res.status(200).json(results);
    }catch(err){
        console.log(err);
        res.status(500).json({error: err});
    }
});

app.get('/items/:id', async function(req, res){
    /**
     * Handle GET requests to /items/:id
     * 
     * Status Code:
     *  - 200 if the item was retrieved successfully
     *  - 404 if the item couldn't be found
     *  - 500 if there was an error
     * 
     * Response:
     *  returns a pre-rendered product page if html was requested, an S3
     *  image link if json was requested and an error if there was an issue
     */

    try{
        if(bucketName == undefined){
            throw "S3 bucket wasn't provided in .env file"
        }

        let params = {
            Bucket: bucketName,
            Key: req.params.id
        };
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3, command, {expiresIn: 3600});
        
        res.format({
            'application/json' : () => {
                res.status(200).json(url);
                return
            },
    
            'text/html' : async () => {
                try{
                    let result = await items.findOne({id: req.params.id}).catch((err) => {
                        throw err;
                    });

                    if(result === null){
                        throw "ItemID could not be found";
                    }else{
                        res.status(200).render("itemPage", 
                        {
                            itemName: result.itemName,
                            description: result.description,
                            stock: result.stock,
                            price: result.price,
                            imageURL: url
                        });
                    }
                }catch(err){
                    console.log(err)
                    if(err == "ItemID could not be found"){
                        res.status(404).setHeader('content-type','application/json').json({error: err});
                    }else{
                        res.status(500).setHeader('content-type','application/json').json({error: err});
                    }
                }
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).json({error: err});
    }
});

app.post('/items', upload.single('file'), async function(req, res){
    /**
     * Handles POST requests to /items
     * 
     * Status Code:
     *  - 200 if item was created successfully
     *  - 400 if the input was invalid
     *  - 500 if there was an error
     * 
     * Response:
     *  returns all items in the database after adding the item to the database
     *  and S3
     */

    try{
        let newItem = {
            itemName: req.body.itemName,
            description: req.body.description,
            stock: req.body.stock,
            price: req.body.price,
            category: req.body.category, 
            id: crypto.randomBytes(32).toString('hex')
        }

        for(let key of Object.keys(newItem)){
            if(newItem[key] == ""|| newItem[key] == undefined){
                throw "Fields were missing"
            }
        }
        
        await items.create(newItem).catch((err) => {
            throw err; 
        });
        
        const params = {
            Bucket: bucketName,
            Key: newItem.id,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }
        
        await s3.send(new PutObjectCommand(params));
        
        let results = await items.find({}).catch((err) => {
            throw err;
        });

        res.status(200).json(results);
    }catch(err){
        console.log(err);
        if(err == "Fields were missing"){
            res.status(400).json({error: err});
        }else{
            res.status(500).json({error: err});
        }
    }
});

app.delete('/items/:id', async (req, res) => {
    /**
     * Handle DELETE requests to /items/:id
     * 
     * Status Code:
     *  - 200 if the items was deleted successfully
     *  - 500 if there was an error
     * 
     * Response:
     *  return all items in the database after deleting the item
     *  from the database and S3
     */
    
    try{
        await items.deleteOne({id: req.params.id}).catch((err) => {
            throw err;
        });

        const params = {
            Bucket: bucketName,
            Key: req.params.id
        }

        await s3.send(new DeleteObjectCommand(params));

        let results = await items.find({}).catch((err) => {
            throw err;
        });

        res.status(200).json(results);
    }catch(err){
        console.log(err);
        res.status(500).json({error: err});
    }
});

app.put('/items', async function(req, res){
    /**
     * Handles PUT requests to /items
     * 
     * Status Code:
     *  - 200 if the items were updated successfully 
     *  - 400 if the input was invalid
     *  - 500 if there was an error
     * 
     * Response:
     *  returns all items in the database after subtracting the appropriate amount
     *  of stock from all items in the cart
     */

    try{
        let existingItems = await items.find({}).catch((err) => {
            throw err;
        });
        let cart = req.body;
        let keys = Object.keys(cart);

        for(let item of existingItems){
            if(keys.includes(item.id)){
                if(item.stock < cart[item.id][0]){
                    throw "Not enough stock"
                }else{
                    cart[item.id].push(item.stock - cart[item.id][0]);
                }
            }
        }

        for(let key of keys){
            await items.updateOne({
                id: key
            },{
                stock: cart[key][3]
            }).catch((err) => {
                throw err;
            });
        }

        let results = await items.find({}).catch((err) => {
            throw err;
        });

        res.status(200).json(results);
    }catch(err){
        console.log(err);
        if(err == "Not enough stock"){
            res.status(400).json({error: err});
        }else{
            res.status(500).json({error: err});
        }
    }
});

app.put('/items/:id', upload.single('file'), async (req, res) => {
    /**
     * Handles PUT requests to /items/:id
     * 
     * Status Code:
     *  - 200 if the item was updated successfully
     *  - 400 if the input was invalid
     *  - 500 if there was an error
     * 
     * Response:
     *  returns all items in the database after updating the request on
     *  in the database and potentially S3
     */
    
    try{
        for(let key of Object.keys(req.body)){
            if(req.body[key] == ""){
                throw "Invalid fields"
            }
        }

        let updatedItem = {
            itemName: req.body.itemName,
            description: req.body.description,
            stock: req.body.stock,
            price: req.body.price,
            category: req.body.category,
            id: req.params.id
        };

        await items.findOneAndUpdate({
            id: updatedItem.id
        },{
            itemName: updatedItem.itemName,
            description: updatedItem.description,
            stock: updatedItem.stock,
            price: updatedItem.price,
            category: updatedItem.category
        },{
            runValidators: true
        }).catch((err) => {
            throw err;
        });

        if(req.file != undefined){
            const params = {
                Bucket: bucketName,
                Key: updatedItem.id,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            }
        
            await s3.send(new PutObjectCommand(params));
        }

        let results = await items.find({}).catch((err) => {
            throw err;
        });

        res.status(200).json(results);
    }catch(err){
        console.log(err);
        if(err == "Invalid fields"){
            res.status(400).json({error: err});
        }else{
            res.status(500).json({error: err});
        }
    }
});

//notify user if there was an error as well as when the connection to the database opens
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
    console.log("Connected to database...");
});

//shut down server with ctrl + c
process.on('SIGINT', function(){
    mongoose.connection.close().then(
        () => {
            console.log("Mongoose disconnected through app termination");
            process.exit(0);
        }
    );
    process.exit(0);
});

//notify user the server started
console.log("server started on port: ", PORT);
let server = app.listen(PORT);

app.closeServer = () => {
    mongoose.connection.close();
    server.close();
};

module.exports = app;