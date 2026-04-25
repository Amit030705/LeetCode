const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utils/validator");
const { sendAuthNotificationEmail, sendPasswordResetEmail } = require("../utils/loginMailer");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
};

const getPublicUser = (user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    emailId: user.emailId,
    profileImage: user.profileImage,
    authProvider: user.authProvider,
    _id: user._id,
    role: user.role,
});

const setAuthCookie = (res, user) => {
    const token = jwt.sign(
        { _id: user._id, emailId: user.emailId, role: user.role },
        process.env.JWT_KEY,
        { expiresIn: 60 * 60 }
    );

    res.cookie("token", token, cookieOptions);
};

const sendActivityEmail = ({ user, eventType, req }) => {
    sendAuthNotificationEmail({
        user,
        eventType,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
    }).catch((mailError) => {
        console.error(`${eventType} email failed:`, mailError.message);
    });
};

const normalizeFirstName = (name, email) => {
    const fallback = email?.split("@")[0] || "Google User";
    const cleanName = (name || fallback).trim();
    return cleanName.length >= 3 ? cleanName.slice(0, 20) : "Google User";
};

const hashResetToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const register = async (req, res) => {
    try {
        validate(req.body);

        const { firstName, lastName, emailId, password } = req.body;
        const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });

        if (existingUser) {
            return res.status(409).json({ message: "Account already exists" });
        }

        const user = await User.create({
            firstName,
            lastName,
            emailId,
            password: await bcrypt.hash(password, 10),
            role: "user",
            authProvider: "local",
        });

        setAuthCookie(res, user);
        sendActivityEmail({ user, eventType: "Email Registration", req });

        res.status(201).json({
            user: getPublicUser(user),
            message: "Registered successfully",
        });
    } catch (err) {
        res.status(400).json({ message: err.message || "Registration failed" });
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            throw new Error("Invalid Credentials");
        }

        const user = await User.findOne({ emailId: emailId.toLowerCase() });

        if (!user || !user.password) {
            throw new Error("Invalid Credentials");
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new Error("Invalid Credentials");
        }

        setAuthCookie(res, user);
        sendActivityEmail({ user, eventType: "Email Login", req });

        res.status(200).json({
            user: getPublicUser(user),
            message: "Logged in successfully",
        });
    } catch (err) {
        res.status(401).json({ message: err.message || "Login failed" });
    }
};

const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: "Google OAuth is not configured" });
        }

        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload?.email || !payload.email_verified) {
            return res.status(401).json({ message: "Google email is not verified" });
        }

        const emailId = payload.email.toLowerCase();
        let user = await User.findOne({
            $or: [{ googleId: payload.sub }, { emailId }],
        });
        const isNewUser = !user;

        if (!user) {
            user = await User.create({
                firstName: normalizeFirstName(payload.given_name || payload.name, emailId),
                emailId,
                googleId: payload.sub,
                profileImage: payload.picture || "",
                authProvider: "google",
                role: "user",
            });
        } else {
            user.googleId = user.googleId || payload.sub;
            user.profileImage = payload.picture || user.profileImage;
            user.authProvider = user.password ? "local_google" : "google";
            await user.save();
        }

        setAuthCookie(res, user);
        sendActivityEmail({
            user,
            eventType: isNewUser ? "Google Registration" : "Google Login",
            req,
        });

        res.status(200).json({
            user: getPublicUser(user),
            message: isNewUser ? "Google account created successfully" : "Logged in with Google",
        });
    } catch (err) {
        res.status(401).json({ message: err.message || "Google authentication failed" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { emailId } = req.body;

        if (!emailId) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ emailId: emailId.toLowerCase() });
        const responseMessage = "If an account exists, a password reset link has been sent.";

        if (!user) {
            return res.status(200).json({ message: responseMessage });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = hashResetToken(resetToken);
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        await sendPasswordResetEmail({ user, resetUrl });

        res.status(200).json({ message: responseMessage });
    } catch (err) {
        res.status(500).json({ message: err.message || "Could not send reset email" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password || password.length < 8) {
            return res.status(400).json({ message: "A valid token and strong password are required" });
        }

        const user = await User.findOne({
            resetPasswordToken: hashResetToken(token),
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Reset link is invalid or expired" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.authProvider = user.googleId ? "local_google" : "local";
        await user.save();

        res.status(200).json({ message: "Password reset successfully. You can now sign in." });
    } catch (err) {
        res.status(500).json({ message: err.message || "Password reset failed" });
    }
};

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (token) {
            const payload = jwt.decode(token);
            if (payload?.exp) {
                await redisClient.set(`token:${token}`, "Blocked");
                await redisClient.expireAt(`token:${token}`, payload.exp);
            }
        }

        res.cookie("token", "", { ...cookieOptions, maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(503).json({ message: err.message || "Logout failed" });
    }
};

const adminRegister = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, lastName, emailId, password, role } = req.body;

        const user = await User.create({
            firstName,
            lastName,
            emailId,
            role: role || "admin",
            password: await bcrypt.hash(password, 10),
            authProvider: "local",
        });

        setAuthCookie(res, user);
        res.status(201).json({
            user: getPublicUser(user),
            message: "Admin registered successfully",
        });
    } catch (err) {
        res.status(400).json({ message: err.message || "Admin registration failed" });
    }
};

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    register,
    login,
    googleAuth,
    forgotPassword,
    resetPassword,
    logout,
    adminRegister,
    deleteProfile,
};
