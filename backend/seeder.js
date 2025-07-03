

const jsonrecipes = require('./data/recipie.json');
const Recipe = require('./recipiemodel');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/securin', { 
    useNewUrlParser: true,   
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});





const recipes = Object.values(jsonrecipes); 

const seedRecipes = async () => {
    try {
     
        await Recipe.insertMany(recipes);

        console.log("no of files added: ", recipes.length);
        
        console.log('All Recipes added successfully!');
    } catch (error) {
        console.error('Error seeding recipes:', error.message);
    }
};

seedRecipes();