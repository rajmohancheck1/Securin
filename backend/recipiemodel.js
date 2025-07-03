const mongoose= require('mongoose');

const recipeSchema = new mongoose.Schema({
 
  cuisine: { type: String, default:null},
  title: { type: String, default:null},
  description: { type: String, default:null},
  rating: { type: Number, default:null },
  prep_time: { type: Number, default:null },
  cook_time: { type: Number, default:null},  
  total_time: { type: Number, default:null},
  nutrients: {
    calories: { type: String, default:null },
    fat: { type: String, default:null},
    protein: { type: String, default:null},  
    carbs: { type: String, default:null},
    fiber: { type: String, default:null },
    sugar: { type: String, default:null},
    sodium: { type: String, default:null },
    cholesterol: { type: String, default:null }
  },
  serves:{type:String,default:null},
});

module.exports = mongoose.model('Recipe', recipeSchema);
