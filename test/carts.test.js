import { expect } from "chai"
import supertest from "supertest"
import { describe, it } from "mocha"
import mongoose from "mongoose"
import { config } from "../src/config/config.dotenv.js"


await mongoose.connect(config.MONGO_URL, { dbName: config.DBNAME })

let cookie;
let objectCartId;
let productToTest = await mongoose.connection.collection("products").findOne({ title: "Yerba" });
let productId = productToTest._id;

const requester = supertest("http://localhost:8080")

describe("Javi's ecommerce carts testing", async function () {

    this.timeout(5000)

    describe("Testing carts module", async function () {

        before(async () => {
            let user = {
                email: "tes2t@test.com",
                password: "333",
            }

            let login = await requester.post("/api/sessions/login").send(user)
            cookie = login.headers["set-cookie"][0]

        })

        after(async () => {
            let response = await mongoose.connection.collection("carts").deleteOne({ _id: objectCartId });
            console.log(response)
        })

        it("Testing /api/carts to get carts", async () => {


            let testing = await requester.get("/api/carts")

            expect(testing.statusCode).to.be.equal(200)
            expect(testing.body).exist
            expect(testing.body).to.be.an('array').that.is.not.empty;

        })

        it("Testing /api/carts to create cart", async function () {
            let testing = await requester.post("/api/carts")
                .set("Cookie", cookie)
            let cartId = testing.body.cartId
            objectCartId = new mongoose.Types.ObjectId(cartId);
            let createdCart = await mongoose.connection.collection("carts").findOne({ _id: objectCartId });

            expect(testing.statusCode).to.be.equal(201)
            expect(testing.body.message).to.exist.and.to.be.equal("Cart created")
            expect(createdCart).exist
            expect(createdCart._id).to.deep.equal(objectCartId)

        })

        it("Testing /api/carts to add product to cart", async function () {
            let testing = await requester.post(`/api/carts/${objectCartId}/product/${productId}`)
                .set("Cookie", cookie)
            let cart = await mongoose.connection.collection("carts").findOne({ _id: objectCartId });

            expect(testing.statusCode).to.be.equal(200)
            expect(testing.body.message).to.exist.and.to.be.equal("Product added to Cart correctly.")
            expect(cart.products).exist
            expect(cart.products[0]).exist
            expect(cart.products[0]._id).to.deep.equal(productId)

        })

        it("Testing /api/carts to delete product from cart", async function () {
            let testing = await requester.delete(`/api/carts/${objectCartId}/products/${productId}`)
                .set("Cookie", cookie)
            let cart = await mongoose.connection.collection("carts").findOne({ _id: objectCartId });

            expect(testing.statusCode).to.be.equal(200)
            expect(testing.body.message).to.exist.and.to.be.equal("Product removed from cart successfully.")
            expect(cart.products[0]).to.not.exist

        })

    })


})