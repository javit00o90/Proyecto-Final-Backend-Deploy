import mongoose from "mongoose";

const usersSchema = new mongoose.Schema(
    {
        first_name: String,
        last_name: String,
        email: {
            type: String, unique: true
        },
        age: Number,
        password: String,
        role: {
            type: String,
            default: "user",
        },
        cartId: String,
        last_conection: Date,
        documents: [
            {
                name: String,
                reference: String
            }
        ],
        status: {
            type: Boolean,
            default: true,
        },
    },
    
    {
        timestamps: {
            updatedAt: "LastModDate", createdAt: "CreationDate"
        },
        strict: false
    }
)

export const usersModel = mongoose.model("users", usersSchema)