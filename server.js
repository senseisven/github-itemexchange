const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const app = express();
const port = 3000;

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  },
}).array("itemImages", 10); // 10 images maximum

mongoose.connect("mongodb://localhost/itemexchange", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemSchema = new mongoose.Schema({
  itemName: String,
  description: String,
  category: String,
  desiredItem: String,
  images: [String], // Array of image URLs
  email: String,
});

const Item = mongoose.model("Item", itemSchema);

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost/itemexchange" }),
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/category.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "category.html"));
});

app.get("/upload", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "public", "upload.html"));
});

app.get("/my-posts.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "my-posts.html"));
});

app.get("/item-details.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "item-details.html"));
});

app.post("/upload", upload, async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(403).send("Not authenticated");
    }

    const {
      "item-name": itemName,
      description,
      category,
      "desired-item": desiredItem,
    } = req.body;
    const email = req.session.user.email;
    const images = req.files.map((file) => `/uploads/${file.filename}`);

    if (
      !itemName ||
      !description ||
      !category ||
      !desiredItem ||
      images.length === 0
    ) {
      return res.status(400).send("All fields are required.");
    }

    const item = new Item({
      itemName,
      description,
      category,
      desiredItem,
      images,
      email,
    });

    await item.save();
    res.redirect("/");
  } catch (error) {
    console.error("Error during item upload:", error);
    res.status(500).send("Failed to upload item. Please try again.");
  }
});

app.get("/items", async (req, res) => {
  const category = req.query.category;
  const items = await Item.find({ category });
  res.json(items);
});

app.get("/user-posts", async (req, res) => {
  if (!req.session.user) {
    return res.status(403).json({ error: "Not authenticated" });
  }
  const userEmail = req.session.user.email;
  try {
    const userPosts = await Item.find({ email: userEmail });
    res.json(userPosts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
});

app.get("/item/:id", async (req, res) => {
  const itemId = req.params.id;
  try {
    const item = await Item.findById(itemId);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item details" });
  }
});

app.get("/user-items", async (req, res) => {
  const userEmail = req.query.email;
  try {
    const userItems = await Item.find({ email: userEmail });
    res.json(userItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user items" });
  }
});

app.post("/exchange-request", async (req, res) => {
  const { selectedItem, message, itemId } = req.body;
  res.json({ success: true, message: "Exchange request sent successfully!" });
});

app.post("/register", async (req, res) => {
  const { email, password, username } = req.body;
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).send("User already exists with this email address");
  }
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return res.status(400).send("User already exists with this username");
  }
  const user = new User({ email, password, username });
  await user.save();
  res.json({ message: "User registered successfully", token: "loggedIn" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    req.session.user = { email: user.email, username: user.username };
    res.json({
      message: "Login successful",
      token: "loggedIn",
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(400).send("Invalid credentials");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to logout");
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
