require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('./models/UserModel');

const app = express();
app.use(cors({
  origin: 'http://localhost:8081', // or wherever your Expo web runs
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/signup', async (req, res) => {
    console.log("Received signup request:", req.body); 
    const { name, email, password } = req.body;
    try {
        // Check if email or name already exists in the database
        const existingUser = await User.findOne({ $or: [{ email }, { name }] });
        if (existingUser) {
            // Check specifically for email conflict
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            // Check specifically for username conflict
            if (existingUser.name === name) {
                return res.status(400).json({ message: 'Username already in use' });
            }
        }

        // Proceed with creating a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        // Create verification token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });

        console.log(process.env.BASE_URL);
        const verifyLink = `${process.env.BASE_URL}/verify-email?token=${token}`;

        // Send verification email
        await transporter.sendMail({
            from: `"SafeStreet" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Hi ${name},</p><p>Click the link below to verify your email:</p><a href="${verifyLink}">Verify Email</a>`
        });

        // Send success response
        res.status(201).json({ success: true, message: 'Signup successful. Check your email to verify your account.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// ======================= VERIFY EMAIL =======================
app.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { isEmailVerified: true });

        // Styled success message with HTML
        const successMessage = `
            <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background-color: #f7f7f7;
                            color: #333;
                            padding: 20px;
                        }
                        .container {
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            text-align: center;
                        }
                        .title {
                            font-size: 24px;
                            font-weight: bold;
                            color: #4CAF50;
                        }
                        .message {
                            font-size: 18px;
                            color: #555;
                            margin-top: 10px;
                        }
                        .button {
                            display: inline-block;
                            background-color: #4CAF50;
                            color: #fff;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                        .button:hover {
                            background-color: #45a049;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="title">Email Verified Successfully!</div>
                        <div class="message">
                            Your email has been successfully verified. You can now Login
                        </div>
    
                    </div>
                </body>
            </html>
        `;

        res.send(successMessage);
    } catch (err) {
        res.status(400).send('Invalid or expired verification link.');
    }
});


// ========================== LOGIN ==========================
app.post('/login', async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or username
    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { name: identifier }] });
        if (!user) return res.status(400).json({ message: 'Invalid email/username or password' });

        if (!user.isEmailVerified) {
            return res.status(401).json({ message: 'Please verify your email first.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email/username or password' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { name: user.name, email: user.email } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
