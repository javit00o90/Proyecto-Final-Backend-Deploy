import { expect } from "chai"
import supertest from "supertest"
import { describe, it } from "mocha"
import mongoose from "mongoose"
import { config } from "../src/config/config.dotenv.js"


await mongoose.connect(config.MONGO_URL, { dbName: config.DBNAME })

let cookie;
const requester = supertest("http://localhost:8080")

describe("Javi's ecommerce products testing", async function () {

    this.timeout(5000)

    describe("Testing products module", async function () {

        before(async () => {
            let user = {
                email: "tes2t@test.com",
                password: "333",
            }

            let testing = await requester.post("/api/sessions/login").send(user)
            cookie = testing.headers["set-cookie"][0]
        })

        after(async () => {

            await mongoose.connection.collection("products").deleteOne({ code: "testCode123" });
        })

        it("Testing /api/products to get products", async () => {


            let testing = await requester.get("/api/products")

            expect(testing.statusCode).to.be.equal(200)
            expect(testing.body).exist
            expect(testing.body.status).to.exist.and.to.be.equal("success")
            expect(testing.body.payload).exist
            expect(testing.body.payload).to.be.an('array').that.is.not.empty;

        })

        it("Testing /api/products to create product", async function () {

            let product = {
                title: "test",
                description: "test",
                category: "test",
                price: 22,
                thumbnails: [],
                code: "testCode123",
                stock: 22,
            }

            let testing = await requester.post("/api/products").send(product)
                .set("Cookie", cookie)

            let productDB = await mongoose.connection.collection("products").findOne({ code: "testCode123" });

            expect(testing.statusCode).to.be.equal(201)
            expect(testing.body.messages).to.exist.and.to.deep.equal(['Product added successfully.'])
            expect(productDB).exist
            expect(productDB.code).to.be.equal("testCode123")

        })

        it("Testing /api/products missing fields", async function () {

            let product = {
                title: "test",
                price: 22,
                thumbnails: [],
                code: "testCode123",
                stock: 22,
            }

            let testing = await requester.post("/api/products").send(product)
                .set("Cookie", cookie)

            expect(testing.statusCode).to.be.equal(400)
            expect(testing.body.error).exist
            expect(testing.body.error).to.include("fields").and.to.include("missing");

        })

        it("Testing /api/products code duplicate error", async function () {

            let product = {
                title: "test",
                description: "test",
                category: "test",
                price: 22,
                thumbnails: [],
                code: "testCode123",
                stock: 22,
            }

            let testing = await requester.post("/api/products").send(product)
                .set("Cookie", cookie)

            expect(testing.statusCode).to.be.equal(400)
            expect(testing.body.messages).to.exist.and.to.deep.equal(['Product with that code already exist. Not added'])

        })

        it("Testing /api/products delete product", async function () {
            let productDB = await mongoose.connection.collection("products").findOne({ code: "testCode123" });
            const id = productDB._id.toString()
            let testing = await requester.delete(`/api/products/${id}`)
                .set("Cookie", cookie)
            let updatedProduct = await mongoose.connection.collection("products").findOne({ code: "testCode123" });

            expect(testing.statusCode).to.be.equal(200)
            expect(testing.body.message).to.exist.and.to.be.equal('Product removed correctly')
            expect(updatedProduct.status).to.be.false

        })
    })


})