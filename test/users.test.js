import { expect } from "chai"
import supertest from "supertest"
import { describe, it } from "mocha"
import mongoose from "mongoose"
import { config } from "../src/config/config.dotenv.js"
import bcrypt from "bcrypt"


await mongoose.connect(config.MONGO_URL, { dbName: config.DBNAME })

const requester = supertest("http://localhost:8080")

describe("Javi's ecommerce users testing", async function () {

    this.timeout(5000)

    describe("Testing users module", async function () {

        after(async () => {
            try {
                let user = await mongoose.connection.collection("users").findOne({ email: "test@example.com" });

                if (user) {
                    let userCartId = user.cartId;

                    if (mongoose.Types.ObjectId.isValid(userCartId)) {
                        let cartObjectId = new mongoose.Types.ObjectId(userCartId);
                        await mongoose.connection.collection("users").deleteMany({ email: "test@example.com" });
                        await mongoose.connection.collection("carts").deleteOne({ _id: cartObjectId });
                    } else {
                        console.log("Invalid cart ID format.");
                    }
                } else {
                    console.log("User not found.");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        })

        let cookie

        it("Testing /api/sessions to create user", async () => {

            let user = {
                first_name: "Testing",
                last_name: "Testing",
                email: "test@example.com",
                age: 22,
                password: "1234",
            }

            let testing = await requester.post("/api/sessions/register").send(user)
            let userDB = await mongoose.connection.collection("users").findOne({ email: "test@example.com" });

            expect(testing.statusCode).to.be.equal(302)
            expect(testing.text).to.exist.and.to.be.equal("Found. Redirecting to /login?message=User%20test@example.com%20created%20successfully!")
            expect(userDB).exist
            expect(userDB.email).to.be.equal("test@example.com")
            expect(userDB.cartId).exist
            expect(bcrypt.compareSync(user.password, userDB.password)).to.be.true;

        })

        it("Testing /api/sessions email duplicate error", async () => {

            let user = {
                first_name: "Testing",
                last_name: "Testing",
                email: "test@example.com",
                age: 22,
                password: "12345",
            }

            let testing = await requester.post("/api/sessions/register").send(user)
            let userDB = await mongoose.connection.collection("users").findOne({ email: "test@example.com" });

            expect(testing.statusCode).to.be.equal(302)
            expect(testing.text).to.exist.and.to.be.equal("Found. Redirecting to /register?error=User%20with%20that%20email%20already%20exists")
            expect(userDB).exist
            expect(bcrypt.compareSync(user.password, userDB.password)).to.be.false;

        })

        it("Testing /api/sessions missing fields", async () => {

            let user = {
                email: "test2@example.com",
                age: 22,
                password: "1234",
            }

            let testing = await requester.post("/api/sessions/register").send(user)
            let userDB = await mongoose.connection.collection("users").findOne({ email: "test2@example.com" });

            expect(testing.statusCode).to.be.equal(302)
            expect(testing.text).to.exist.and.to.be.equal("Found. Redirecting to /register?error=All%20fields%20are%20required")
            expect(userDB).to.not.exist

        })

        it("Testing /api/sessions to login user", async () => {

            let user = {
                email: "test@example.com",
                password: "1234",
            }

            let testing = await requester.post("/api/sessions/login").send(user)

            cookie = testing.headers["set-cookie"][0]
            let data = testing.headers["set-cookie"][0].split("=")
            let cookieName = data[0]

            expect(testing.statusCode).to.be.equal(302)
            expect(testing.text).to.exist.and.to.be.equal("Found. Redirecting to /products?message=You%20logged%20in%20correctly")
            expect(cookieName).to.be.equal("ecommerceJaviCookie")

        })



        it("Testing /api/sessions DTO and current", async function () {
            let testing = await requester.get("/api/sessions/current")
                .set("Cookie", cookie)
            expect(testing.body.user).to.exist
            expect(testing.body.user.email).to.exist.and.to.be.equal("te**@example.com")
            expect(testing.body.user.cartId).to.exist.and.to.be.equal("*****")

        })
    })


})