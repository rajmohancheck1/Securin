const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();  
const Recipe = require('./recipiemodel');
const APIFeatures = require('./apiFeatures');
const mongoose = require('mongoose');


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/securin', {
  useNewUrlParser: true,   
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Securin API');
});

app.get('/recipes', async (req, res) => {
  try {
    const resPerPage = Number(req.query.limit) || 10;
    
    let buildQuery = () => {
      return new APIFeatures(Recipe.find(), req.query).filter()
    }
    
    const filteredrecipesCount = await buildQuery().query.countDocuments({})
    const totalrecipesCount = await Recipe.countDocuments({});
    let recipesCount = totalrecipesCount;

    if(filteredrecipesCount !== totalrecipesCount) {
      recipesCount = filteredrecipesCount;
    }
    
    const recipes = await buildQuery().paginate(resPerPage).query.sort({ title: -1 });

    res.status(200).json({
      success: true,
      page: Number(req.query.page || 1),
      currentitems:resPerPage,
      count: recipesCount,
      recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/recipes/search', async (req, res) => {
    try {
        const resPerPage = Number(req.query.limit) || 10;
        const query = {};

        // Handle title search
        if (req.query.title) {
            query.title = { $regex: req.query.title, $options: 'i' };
        }

        // Handle rating comparison
        if (req.query.rating) {
            const ratingValue = req.query.rating.match(/([><]=?|=)(.+)/); 
            if (ratingValue) {
                const [, operator, value] = ratingValue;
                query.rating = {
                    [operator === '>=' ? '$gte' : operator === '<=' ? '$lte' : 
                     operator === '>' ? '$gt' : operator === '<' ? '$lt' : '$eq']: Number(value)
                };
            }
        }

        // Handle calories comparison
        // if (req.query.calories) {
        //     const caloriesValue = req.query.calories.match(/([><]=?|=)(.+)/);
        //     if (caloriesValue) {
        //         const [, operator, value] = caloriesValue;
        //         query['nutrients.calories'] = {
        //             [operator === '>=' ? '$gte' : operator === '<=' ? '$lte' : 
        //              operator === '>' ? '$gt' : operator === '<' ? '$lt' : '$eq']: Number(value)
        //         };
        //     }
        // }


        if (req.query.calories) {
            const caloriesValue = req.query.calories.match(/([><]=?|=)(.+)/);
            if (caloriesValue) {
                const [, operator, value] = caloriesValue;
                const mongoOp = operator === '>=' ? '$gte' : operator === '<=' ? '$lte' :
                                operator === '>' ? '$gt' : operator === '<' ? '$lt' : '$eq';
                // Build aggregation pipeline
                const pipeline = [
                    { $addFields: {
                        caloriesNum: {
                            $toDouble: {
                                $arrayElemAt: [
                                    { $split: ["$nutrients.calories", " "] },
                                    0
                                ]
                            }
                        }
                    }},
                    { $match: { ...query, caloriesNum: { [mongoOp]: Number(value) } } },
                    { $sort: { rating: -1 } },

                  
                ];
                const recipes = await Recipe.aggregate(pipeline);
                const totalRecipes = await Recipe.countDocuments({});
                return res.status(200).json({
                    success: true,
                    filteredCount: recipes.length,
                    count: totalRecipes,
                    page: Number(req.query.page || 1),
                    currentitems: resPerPage,
                    recipes
                });
            

            }
        }
        

        const recipes = await Recipe.find(query).sort({ rating:-1 })
          

        const totalRecipes = await Recipe.countDocuments({});
        const filteredRecipes = await Recipe.find(query).countDocuments({});
        
        res.status(200).json({
            success: true,
            count: totalRecipes,
            filteredCount: filteredRecipes,
            page: Number(req.query.page || 1),
            currentitems:resPerPage,
            pages: Math.ceil(totalRecipes / resPerPage),
            recipes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    res.status(200).json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});


app.post('/recipes', async (req, res) => {  
    try {
        const newRecipe = new recipeSchema.Recipe(req.body);
        await newRecipe.save();
        res.status(201).json({ message: 'Recipe created successfully', recipe: newRecipe });
    } catch (error) {
        res.status(400).json({ message: 'Error creating recipe', error: error.message });
    }
    });




app.listen(5000, () => {
  console.log('Server is running on port 5000');
});



