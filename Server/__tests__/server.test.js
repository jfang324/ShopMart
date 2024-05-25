const request = require('supertest');
const app = require('../server.js');
const items = require('../models/item.js');
const mongoose = require('mongoose');
const {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path')

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

const s3 = new S3Client({
    credentials: {
        accessKeyId: 'mockKey',
        secretAccessKey: 'mockSecretKey',
    },
    region: 'mockBucket'
});

afterAll(() => {
    app.closeServer();
});


describe("GET /items", () => {
    beforeAll(() => {
        items.find.
        mockReturnValueOnce(Promise.resolve(mockItems)).
        mockReturnValueOnce(new Error("Database Error"));
    });

    test("should respond with 200 status code and items (everything goes right)", async () => {
        const response = await request(app).get('/items');

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body).not.toBeUndefined();
    });


    test("should respond with 500 status code and error (error retrieving from DB)", async () => {
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

    test("should respond with 200 status code and a link (everything goes right)", async () => {
        const response = await request(app).get('/items/:id').set('Accept', 'application/json');

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body).not.toBeUndefined();
    });
    
    test("should respond with 404 status code and error (item doesn't exist)", async () => {
        const response = await request(app).get('/items/:id').set('Accept', 'text/html');

        expect(response.statusCode).toBe(404);
        expect(response.headers['content-type']).toContain('application/json');
        expect(Object.keys(response.body)).toContain('error');
    });

    test("should respond with 500 status code and error (error retrieving from DB)", async () => {
        const response = await request(app).get('/items/:id').set('Accept', 'text/html');

        expect(response.statusCode).toBe(500);
        expect(response.headers['content-type']).toContain('application/json');
        expect(Object.keys(response.body)).toContain('error');
    });
});


describe("POST /items", () => {
    beforeAll(() => {
        items.create.
        mockReturnValueOnce(Promise.resolve(mockItems[0])).
        mockReturnValueOnce(new Error("Database Error")).
        mockReturnValueOnce(Promise.resolve(mockItems[0]));

        PutObjectCommand.mockReturnValueOnce({});
        s3.send.mockReturnValue(Promise.resolve({}));

        items.find.mockReturnValueOnce(Promise.resolve(mockItems)).
        mockReturnValueOnce(new Error("Database Error"));
    });

    test("should respond with 200 status code and items (everything went right)", async () => {
        const response = await request(app).post('/items').
        set('Content-Type', 'multipart/form-data').
        field("itemName", "mockItemName").
        field("description", "mockDescription").
        field("stock", 1).
        field("price", 11).
        field("category", "mockCategory").
        attach('file', path.resolve(__dirname, 'dummy.jpg'));

        console.log(response.statusCode, response.headers, response.body);
        expect(response.statusCode).toBe(200);
    });

    test("should respond with 500 status code and err (error creating item)", async () => {
        const response = await request(app).post('/items').
        set('Content-Type', 'multipart/form-data').
        field("itemName", "mockItemName").
        field("description", "mockDescription").
        field("stock", 1).
        field("price", 11).
        field("category", "mockCategory").
        attach('file', path.resolve(__dirname, 'dummy.jpg'));

        expect(response.statusCode).toBe(500);
    });

    test("should respond with 500 status code and err (error retrieving items)", async () => {
        const response = await request(app).post('/items').
        set('Content-Type', 'multipart/form-data').
        field("itemName", "mockItemName").
        field("description", "mockDescription").
        field("stock", 1).
        field("price", 11).
        field("category", "mockCategory").
        attach('file', path.resolve(__dirname, 'dummy.jpg'));

        expect(response.statusCode).toBe(500);
    });
    
    test("should respond with 400 status code and error (a field is undefined)", async () => {
        const response = await request(app).post('/items').
        set('Content-Type', 'multipart/form-data').
        field("description", "mockDescription").
        field("stock", 1).
        field("price", 11).
        field("category", "mockCategory").
        attach('file', path.resolve(__dirname, 'dummy.jpg'));

        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toContain('application/json');
        expect(Object.keys(response.body)).toContain('error');
    });

    test("should respond with 400 status code and error (a field is empty)", async () => {
        const response = await request(app).post('/items').
        set('Content-Type', 'multipart/form-data').
        field("itemName", "").
        field("description", "mockDescription").
        field("stock", 1).
        field("price", 11).
        field("category", "mockCategory").
        attach('file', path.resolve(__dirname, 'dummy.jpg'));

        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toContain('application/json');
        expect(Object.keys(response.body)).toContain('error');
    });
});