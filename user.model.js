const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            minlength: [2, "Name must be at least 2 characters long"],
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Company ID is required"],
            ref: "company",
        },
        email: {
            type: String,
            required: [true, "Name is required"],
            unique: [true, "Email already registered"],
            lowercase: true,
            match: [
                /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim,
                "Invalid email!",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
        },
        profilepic: {
            type: String,
            default:
                "https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg?semt=ais_hybrid&w=740&q=80",
        },
        allowed: {
            type: Boolean,
            default: true,
        },
        isManager: {
            type: Boolean,
            default: false,
        },
        paymentStatus: {
            type: String,
            default: "pending",
            enum: ["paid", "pending", "failed"],
        },
    },
    { timestamps: true, strict: true },
);
const userModel = mongoose.model("user", UserSchema);
module.exports = userModel;
