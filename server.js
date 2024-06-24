const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const port = 3000;

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

mongoose.connect('mongodb://localhost/itemexchange', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const itemSchema = new mongoose.Schema({
    itemName: String,
    description: String,
    category: String,
    desiredItem: String,
    image: String,
    email: String,
});

const Item = mongoose.model('Item', itemSchema);

const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/category.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'category.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/my-posts.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'my-posts.html'));
});

app.get('/item-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'item-details.html'));
});

app.post('/upload', upload.single('item-image'), async (req, res) => {
    const { 'item-name': itemName, description, category, 'desired-item': desiredItem } = req.body;
    const email = req.body.email || req.user.email; // Assuming req.user contains the authenticated user's details
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const item = new Item({
        itemName,
        description,
        category,
        desiredItem,
        image,
        email
    });

    await item.save();
    res.redirect('/');
});

app.get('/items', async (req, res) => {
    const category = req.query.category;
    const items = await Item.find({ category });
    res.json(items);
});

app.get('/user-posts', async (req, res) => {
    const userEmail = req.query.email;
    try {
        console.log(`Fetching posts for email: ${userEmail}`);
        const userPosts = await Item.find({ email: userEmail });
        console.log(`Found posts: ${JSON.stringify(userPosts)}`);
        res.json(userPosts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Failed to fetch user posts' });
    }
});

app.get('/item/:id', async (req, res) => {
    const itemId = req.params.id;
    try {
        const item = await Item.findById(itemId);
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch item details' });
    }
});

app.get('/user-items', async (req, res) => {
    const userEmail = req.query.email;
    const userItems = await Item.find({ email: userEmail });
    res.json(userItems);
});

app.post('/exchange-request', async (req, res) => {
    const { selectedItem, message, itemId } = req.body;
    console.log('Exchange Request:', { selectedItem, message, itemId });
    res.json({ success: true, message: 'Exchange request sent successfully!' });
});

app.post('/register', async (req, res) => {
    const { email, password, username } = req.body;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return res.status(400).send('User already exists with this email address');
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        return res.status(400).send('User already exists with this username');
    }
    const user = new User({ email, password, username });
    await user.save();
    res.json({ message: 'User registered successfully', token: 'loggedIn' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        res.json({ message: 'Login successful', token: 'loggedIn', username: user.username, email: user.email });
    } else {
        res.status(400).send('Invalid credentials');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
