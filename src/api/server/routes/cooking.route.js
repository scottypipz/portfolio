const multer = require('multer');
const fs = require('fs');
const aws = require('../aws')
const sharp = require('sharp')
const router = require('./router');

const URL = require('../../APIRoutes');
const CookingModel = require('../models/cooking.model');

const foodCategories = {
    hors: 1,
    appetizer: 2,
    salad: 3,
    main: 4,
    dessert: 5
}

/**
 * /cooking/create/procedure
 */
router.get(URL.cooking.create.procedure, (req, res) => {
    req.getConnection((err, db) => {
        if (err) return res.status(500).json('No Connection');

        let ProcedureModel = new CookingModel.Procedure(db)
        ProcedureModel.createTable()
            .then(() => res.status(200).json('Successfully created table hobbies_procedure'))
            .catch(err => res.status(500).json(err))
    })
})
/**
 * /cooking/recipe
 * query
 *  -sortBy
 * 
*/
router.get(URL.cooking.recipeList, (req, res) => {
    var query = 'SELECT * FROM hobbies_recipe'

    let sortBy = req.query.sortBy || 'favorite'
    switch (sortBy) {
        case 'hors':
            query += ` WHERE food_category_id = ${foodCategories.hors}`
            break;
        case 'appetizer':
            query += ` WHERE food_category_id = ${foodCategories.appetizer}`
            break;
        case 'salad':
            query += ` WHERE food_category_id = ${foodCategories.salad}`
            break;
        case 'mainCourse':
            query += ` WHERE food_category_id = ${foodCategories.main}`
            break;
        case 'dessert':
            query += ` WHERE food_category_id = ${foodCategories.dessert}`
            break;
        case 'favorite':
            query += " WHERE favorite = 1"
            break;
        default:
            break;
    }

    req.getConnection((connectionErr, db) => {
        db.query(query, (error, recipeList) => {
            if (error) return res.JSONerror()

            return res.JSONsuccess(recipeList)
        })
    })
})

/** /ingredients */
router.get(URL.cooking.ingredients, (req, res) => {
    req.getConnection((err, db) => {
        let ingredient = new CookingModel.Ingredient(db)
        ingredient.getIngredients('id, name')
            .then(ingredients => res.JSONsuccess(ingredients))
            .catch(err => res.JSONerror(err))
    })
})

/** /food-categories */
router.get(URL.cooking.foodCategories, (req, res) => {
    req.getConnection((err, db) => {
        let foodCategories = new CookingModel.FoodCategories(db)
        foodCategories.getFoodCategories('id, name')
            .then(response => res.JSONsuccess(response))
            .catch(err => res.JSONerror(err))
    })
})

/** /cooking */
router.get(URL.cooking.main, (req, res) => {
    res.status(200).json({
        message: 'GET cooking'
    })
})

/** /cooking/recipe/:recipeID */
router.get(URL.cooking.recipe, (req, res) => {
    req.getConnection((err, db) => {
        if (err) return res.JSONerror()

        let recipe = new CookingModel.Recipe(db)
        recipe.id = req.params.recipeID
        recipe.getInfo()
            .then(response => res.JSONsuccess(response))
            .catch(() => res.JSONerror())
    })
})

/** /cooking/recipe/edit */
router.patch(URL.cooking.edit, (req, res) => {
    req.getConnection((err, db) => {
        if (err) return res.JSONerror()

        var recipe = new CookingModel.Recipe(db)
        recipe.id = req.body.id
        recipe.updateRecipeInfo({
            name: req.body.name.trim(),
            duration_from: req.body.duration_from,
            duration_to: req.body.duration_to
        }).then(() => res.JSONsuccess())
        .catch(() => res.JSONerror())

    })
})

/**
 * ADD RECIPE
 * @param { String } recipeName - Name of the recipe
 * @param { Number } favorite - 0 : not, 1 : favorite
 * @param { Number } durationFrom - Minimum finish in Minutes
 * @param { Number } durationTo - Max finish in Minutes
 * @param { Array } ingredients - Ingredients used for the recipe
 * @param { Array } procedures - Procedures for cooking the recipe
 * @param { String } foodCategoryID - food category
 * 
 * @return { json }
 */

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if ( ! allowedTypes.includes(file.mimetype)) {
        const error = new Error("Wrong file type");
        error.code = "LIMIT_FILE_TYPES";
        return cb(error, false);
    }
    return cb(null, true);
}
const MAX_SIZE = 1000000;
var storage = multer.diskStorage({
        destination: 'tmp/uploads',
        filename: function ( req, file, cb ) {
            // Remove the excess extensions from the file
            const fileNameNoExtensions = file.originalname.split('.').slice(0, -1).join('');
            const fileName = `${fileNameNoExtensions}-${Date.now()}.png`;
            cb(null, fileName);
        }
});
const upload = multer({
    dest: 'tmp/uploads',
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_SIZE
    }
})

router.post(URL.cooking.addRecipe, upload.single('file'), async (req, res) => {
    // AMAZON S3 bucket
    const s3 = new aws.S3();
    const now = Date.now();

    try {

        const bucketName = "chefpipz-resource-portfolio";
        const imageName = `${req.body.name}-${now}.png`;
        // Resize the image and put in buffer
        const buffer = await sharp(req.file.path)
            .resize(300)
            .toBuffer();

        const s3res = await s3.upload({
            Bucket: bucketName,
            Key: imageName,
            Body: buffer,
            ACL: 'public-read'
        }).promise();

        // Remove from tmp_uploads
        fs.unlink(req.file.path, () => {
            // Save the path to the database
            req.getConnection((connectionErr, db) => {
                if (connectionErr) return res.status(500).json('No Connection');

                let procedures = JSON.parse(req.body.procedures)
                let ingredients = JSON.parse(req.body.ingredients)
                var recipe = new CookingModel.Recipe(db)
                recipe.setRecipe(
                    req.body.name,
                    req.body.favorite,
                    req.body.durationFrom,
                    req.body.durationTo,
                    req.body.foodCategoryID,
                    s3res.Location
                )
                if ( ! recipe.validateEmpty()) {
                    throw new Error("Incomplete Parameters");
                }
                if (procedures.length === 0) {
                    throw new Error("No Procedures")
                }
                if (ingredients.length === 0) {
                    throw new Error("No Ingredients")
                }

                recipe.addRecipe(procedures, ingredients)
                    .then(() => res.JSONcreated())
                    .catch(() => res.JSONerror())
            })
        })
    } catch (err) {
        return res.status(422).json({ err })
    }
});

module.exports = router;