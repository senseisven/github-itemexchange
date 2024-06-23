const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

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
    email: String,
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

app.post('/upload', async (req, res) => {
    const { 'item-name': itemName, description, category, 'desired-item': desiredItem, email } = req.body;
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
    const userPosts = await Item.find({ email: userEmail });
    res.json(userPosts);
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
    const userEmail = req.query.email; // Fetch user email from request (modify as needed)
    const userItems = await Item.find({ email: userEmail });
    res.json(userItems);
});

app.post('/exchange-request', async (req, res) => {
    const { selectedItem, message, itemId } = req.body;
    // Implement logic to handle exchange request (e.g., save request to database, notify item owner)
    // For demonstration, we'll simply log the details
    console.log('Exchange Request:', { selectedItem, message, itemId });
    res.json({ success: true, message: 'Exchange request sent successfully!' });
});

app.post('/register', async (req, res) => {
    const { email, password, username } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).send('User already exists');
    }
    const user = new User({ email, password, username });
    await user.save();
    res.json({ message: 'User registered successfully', token: 'loggedIn' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        res.json({ message: 'Login successful', token: 'loggedIn', username: user.username });
    } else {
        res.status(400).send('Invalid credentials');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
