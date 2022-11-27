const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//module scaffolding
const app = express();
const port = process.env.PORT || 5000;

//applying middleware
app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASS}@cluster0.a52onzy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollections = client.db('GadgetsB').collection('Products');

        //read multiple
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.selectedPage);
            const productCount = parseInt(req.query.product);
            const query = {};

            const cursor = productCollections.find(query);
            let products;
            if (page || productCount) {
                products = await cursor.skip(page * productCount).limit(productCount).toArray();
            } else {
                products = await cursor.toArray();
            }
            res.send(products);
        })

        //read one
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const product = await productCollections.findOne(query);
            res.send(product);
        })

        //count products
        app.get('/productCount', async (req, res) => {
            const productCount = await productCollections.estimatedDocumentCount();
            res.send({ productCount });
        })

    } finally { }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
