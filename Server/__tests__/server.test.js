const request = require('supertest');
const app = require('../server.js');
const items = require('../models/item.js');
const mongoose = require('mongoose');
const {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

jest.mock('../models/item.js');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

const mockItems = [{
    itemName: "item1",
    description: "description1",
    stock: 1,
    price: 11,
    category: "items",
    id: 1
},
{
    itemName: "item1",
    description: "description1",
    stock: 1,
    price: 11,
    category: "items",
    id: 1
},{
    itemName: "item1",
    description: "description1",
    stock: 1,
    price: 11,
    category: "items",
    id: 1
}];

afterAll(() => {
    app.closeServer();
});

describe("GET /items", () => {
    beforeAll(() => {
        //Set up mock values to be returned when the database is queried

        items.find.
        mockReturnValueOnce(Promise.resolve(mockItems)).
        mockReturnValueOnce(new Error("Database Error"));
    });

    test("should respond with 200 status code and items", async () => {
        const response = await request(app).get('/items');

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body).not.toBeUndefined();
    });


    test("should respond with 500 status code and error", async () => {
        const response = await request(app).get('/items');

        expect(response.statusCode).toEqual(500);
        expect(response.headers['content-type']).toContain('application/json');
        expect(Object.keys(response.body)).toContain('error');
    });
});

describe("GET /items/:id", () => {
    beforeAll(() => {
        GetObjectCommand.mockReturnValue('mockObjectCommand');
        getSignedUrl.mockReturnValue('mockSignedUrl');
        items.findOne.
        mockReturnValueOnce(Promise.resolve(null)).
        mockReturnValueOnce(new Error("Database Error"));
    });

    test("should respond with 200 status code and a link", async () => {
        const response = await request(app).get('/items/:id').set('Accept', 'application/json');

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body).not.toBeUndefined();
    });
    /*
    test("should respond with 200 status code and html", async () => {
        const response = await request(app).get('/items/:id').set('Accept', 'text/html');

        console.log(response.statusCode, response.headers, response.body)
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('text/html');
        expect(response.body).not.toBeUndefined();
    });
    */

    test("should respond with 404 status code and error", async () => {
        const response = await request(app).get('/items/:id').set('Accept', 'text/html');

        expect(response.statusCode).toBe(404);
        expect(response.headers['content-type']).toContain('application/json');
        expect(Object.keys(response.body)).toContain('error');
    });

    test("should respond with 500 status code and error", async () => {
        const response = await request(app).get('/items/:id').set('Accept', 'text/html');

        expect(response.statusCode).toBe(500);
        expect(response.headers['content-type']).toContain('application/json');
        expect(Object.keys(response.body)).toContain('error');
    });

});