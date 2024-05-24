const mongoose = require('mongoose');

let itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: [true, "All items need a name"]
    },
    description: {
        type: String,
        required: [true, "All items need a description"]
    },
    stock: {
        type: Number,
        min: [0, "There can't be less than 0 stock"]
    },
    price: {
        type: Number,
        min: [0, "The price cannot be lower than 0"]
    },
    category: {
        type: String,
        required: [true, "All items need a category"]
    },
    id: {
        type: String,
        required: [true, "All items need an id"],
        index: true,
        unique: [true, "id needs to be unique"]
    }

},{
    collection: 'items'
});

module.exports = mongoose.model('items', itemSchema);