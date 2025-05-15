import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import validateInput from '../middleware/validateInput.js';

export const signup = async (req, res) => {
    const { email, password, userType, firstName, lastName, location, licenseNumber, companyName, serviceType } = req.body;

    console.log(req.body);
    try {
        // Validate required fields
        if (!email || !password || !userType) {
            return res.status(400).json({ message: 'Email, password, and userType are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ email, password: hashedPassword, userType });
        await newUser.save();

        if (userType === 'provider') {
            if (!firstName || !lastName || !location || !licenseNumber || !companyName || !serviceType) {
                await User.findByIdAndDelete(newUser._id);
                return res.status(400).json({ message: 'All provider fields are required' });
            }

            const newProvider = new Provider({ 
                firstName, 
                lastName, 
                location, 
                licenseNumber, 
                companyName, 
                serviceType, 
                userId: newUser._id 
            });
            await newProvider.save();
        }

        res.status(201).json({ message: '✅ User created successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        console.log(email)
        console.log(user)

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server error: Missing JWT_SECRET in .env' });
        }

        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: '✅ Login successful', token, userType: user.userType, userId: user._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}