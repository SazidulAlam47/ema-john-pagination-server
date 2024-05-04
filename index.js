const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xyqwep0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db('emaJohnDB').collection('products');
    const cartCollection = client.db('emaJohnDB').collection('cart');

    app.get('/products', async (req, res) => {
      const page = parseInt(req.query?.page);
      const size = parseInt(req.query?.size);
      const sortType = req.query?.sort;
      const searchTerm = req.query?.search;

      const query = {
        // price: {
        //   $lt: 50
        // }
        name: {
          $regex: searchTerm || '',
          $options: 'i'
        }
      };
      const options = {
        sort: {
          price: sortType === 'acc' ? 1 : -1,
        }
      };

      const result = await productCollection.find(query, options)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    })

    app.post("/products", async (req, res) => {
      const ids = req.body;
      const idsWithObjectId = ids.map(id => new ObjectId(id));
      const query = {
        _id: {
          $in: idsWithObjectId
        }
      }
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/productsCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });

    app.get("/cart", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await cartCollection.insertOne(product);
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/cart", async (req, res) => {
      const query = {};
      const result = await cartCollection.deleteMany(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('john is busy shopping')
})

app.listen(port, () => {
  console.log(`ema john server is running on port: ${port}`);
})
