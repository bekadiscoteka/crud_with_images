const express = require("express");
const path = require("path");
const { collection, Item } = require("./config");
const bcrypt = require('bcrypt');
const axios = require('axios');
const router = express.Router();
const UNSPLASH_URL = 'https://api.unsplash.com/photos/random';
const UNSPLASH_API_KEY = 'OVPSqDb5lqsxgiGkvJRhQUur1mIc_yBBRscceKti584';
const app = express();
const nodemailer = require('nodemailer');

// Create a transporter for nodemailer
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yermanbekzat@gmail.com',
    pass: 'wcwj xpca nhly tjgv'
  }
});

// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Register User
app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password,
        email: req.body.email,
        age: req.body.age,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    }

    // Check if the username already exists in the database
    const existingUser = await collection.findOne({ name: data.name });
    const existingEmail = await collection.findOne({email: data.email});

    if (existingUser || existingEmail) {
        res.send('User already exists. Please choose a different username.');
    } else {
        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; // Replace the original password with the hashed one

        const userdata = await collection.insertMany(data);
        console.log(userdata);
        res.render('login');
    }

});

// Login user 
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("User name cannot found")
        }
        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.send("wrong Password");
        }
        else {
            if (req.body.username == "admin") {
                res.render("admin");
            }
            else {
                const items = await Item.find();
                console.log(items);
                const response = await axios.get('https://api.quotable.io/random');
                const quote = response.data;
                const reposResponse = await axios.get('https://api.github.com/users/bekadiscoteka/repos', {
            headers: {
                Authorization: `token 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`
            }
        });
        const repos = reposResponse.data;
                res.render("home", { items, quote, repos});
            }
        }
    }
    catch {
        res.send("wrong Details");
    }
});

app.post('/items', async (req, res) => {

    // Filter out any null values in case of request failures
    const { title, description, images } = req.body;
    let arr = images.trim().split(",");
    console.log(images);
    console.log(arr);
    const item = new Item({
      title,
      description,
      images: arr
    });
    try {
      const savedItem = await item.save();
      res.status(201).send(savedItem);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Read (all items)
  app.get('/items', async (req, res) => {
    try {
      const items = await Item.find();
      res.status(200).send(items);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Read (single item)
  app.get('/items/:id', async (req, res) => {
    try {
      const item = await Item.findById(req.body.id);
      if (!item) {
        return res.status(404).send();
      }
      res.status(200).send(item);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Update
  app.patch('/items/:id', async (req, res) => {
    try {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedItem) {
        return res.status(404).send();
      }
      res.status(200).send(updatedItem);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.patch('/items/random', async (req, res) => {
    try {
      const updatedItem = await Item.findByIdAndUpdate('65df837a00ac615d5fecaa46', req.body, { new: true });
      if (!updatedItem) {
        return res.status(404).send();
      }
      res.status(200).send(updatedItem);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  
  // Delete
  app.post('/items/delete', async (req, res) => { // Change the route as needed
    try {
      const deletedItem = await Item.findOneAndDelete({_id: req.body.id}); // Make sure to use _id for MongoDB documents
      if (!deletedItem) {
        return res.status(404).send();
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
});
  
// Update item images with random pictures from Unsplash
app.post('/update-item-images', async (req, res) => {
  try {
    // Fetch 3 random images from Unsplash
    const imageResponses = await Promise.all([
      axios.get(`${UNSPLASH_URL}?client_id=${UNSPLASH_API_KEY}&count=3`),
    ]);


    const images = imageResponses[0].data.map(img => img.urls.small);


    // Update the item in the database
    const updatedItem = await Item.findByIdAndUpdate(
      '65df837a00ac615d5fecaa46',
      { $set: { images: images } },
      { new: true }
    );

    if (!updatedItem || !updatedDog) {
      return res.status(404).send('Item not found.');
    }

    res.status(200).send(updatedItem);
  } catch (error) {
    console.error('Error updating item images:', error);
    res.status(500).send(error);
  }
});



app.post('/subscribe', (req, res) => {
  const { firstname, email } = req.body; // Extract the name and email from the request body

  // Setup email options
  const mailOptions = {
    from: 'yermanbekzat@gmail.com', // Sender address
    to: email, // List of receivers
    subject: 'Subscription Confirmation', // Subject line
    text: `Hello ${firstname},\n\nThank you for subscribing to our newsletter!` // Plain text body
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Subscription successful');
    }
  });
});


// Define Port for Application
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

