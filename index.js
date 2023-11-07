const express = require("express")
const cors = require("cors")
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express()
const port = process.env.PORT || 5000
app.use(cors({
    origin: [`http://localhost:5173`],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.get('/', async (req, res) => {
    res.send('Welcome to Server my Self')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://speed-of-creativity:v2eLmRPRXH2GgzF5@cluster0.oqk84kq.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token
    console.log("verfy token", token);
}

async function run() {
    try {

        const itemsDB = client.db('speed-creative').collection('assignments')
        const assignmentDB = client.db('speed-creative').collection('submit-assignments')

        await client.connect();

        // GET METHOD

        app.get('/items', async (req, res) => {
            const result = await itemsDB.find().toArray()
            res.send(result)
        })

        app.get(`/items/info/:title`, async (req, res) => {
            let id = req.params.title;
            const query = { title: id }
            // console.log(id);
            const result = await itemsDB.findOne(query)
            res.send(result)
        })
        app.get(`/items/update/:id`, async (req, res) => {
            let id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await itemsDB.findOne(query)
            res.send(result)
        })

        app.get(`/items/:id`, async(req,res)=>{
            const id = req.params.id
            const query = {_id : new ObjectId(id)}
            const result = await itemsDB.findOne(query)
            res.send(result)
        })

        app.get(`/submitted-assignment`, verifyToken, async(req,res)=>{
            const result = await assignmentDB.find().toArray()
            res.send(result)
        })
        app.get(`/submitted-assignment/:id`, verifyToken, async(req,res)=>{
            const id = req.params.id
            const query = {_id : new ObjectId(id)}
            const result = await assignmentDB.findOne(query)
            res.send(result)
        })

        



        //POST METHOD

        app.post('/items', async (req, res) => {
            const items = req.body
            console.log(items);
            const result = await itemsDB.insertOne(items)
            res.send(result)
        })

        app.post('/jwt', async (req, res) => {
            const email = req.body
            // console.log(email);
            const token = jwt.sign(email, "secret", { expiresIn: "2h" })
            // console.log(token);
            res
                .cookie("token", token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
                })
                .send(token)
        })

        app.post(`/submitted-assignment`, async(req,res)=>{
            const assignmentData=req.body
            console.log(assignmentData);
            const result = await assignmentDB.insertOne(assignmentData)
            res.send(result)
        })

        // app.post(`/submitted-assignment/:id`, async (req, res)=>{
        //     const id = req.params.id;
        //     const info = req.body
        //     // const {Givenmark, Comment, statuss} = info 
        //     const result = await 

        // })

        //PUT METHOD
        app.put(`/items/update/:id`, async (req, res) => {
            const item = req.body
            const { title, note, date, marks, image, level } = item
            const id = req.params.id
            // console.log(item);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }

            const updateDoc = {
                $set: {
                    title: title, note: note, date: date, marks: marks, image: image, level: level
                }
            }
            const result = await itemsDB.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        app.put(`/submitted-assignment/:id`, async (req, res) => {
            const item = req.body
            const { Givenmark, Comment, statuss } = item
            const id = req.params.id
            console.log(Givenmark,Comment, statuss);
            console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }

            const updateDoc = {
                $set: {
                    Givenmarks : Givenmark , Comments : Comment , status : statuss
                }
            }
            const result = await assignmentDB.updateOne(filter, updateDoc, options)
            res.send(result)
        })


        //DELETE METHOD
        app.delete('/items/:id', async (req,res)=>{
            const id = req.params.id
            const query = {_id : new ObjectId(id)}
            const result = await itemsDB.deleteOne(query)
            res.send(result)

        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is Running at ${port}`);
})