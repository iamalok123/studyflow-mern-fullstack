import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username.'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long.'],
        maxlength: [50, 'Username cannot be more than 50 characters.']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email.'],
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email.']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long.'],
        select: false,
        // Password is only required for local auth, not Google OAuth
        required: function () {
            return this.authProvider === 'local';
        }
    },
    profileImage: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values (only local users won't have this)
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
}, { timestamps: true });

// Hash password before saving (skip for Google OAuth users)
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;