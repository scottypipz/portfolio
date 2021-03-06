const Model = require('./model')

class FoodCategories extends Model {
    constructor (db) {
        super (db)
        this.tableName = 'hobbies_foodcategory'
    }

    getFoodCategories (fields = '*') {
        let sql = `SELECT ${fields} FROM ${this.tableName}`
        return new Promise((resolve, reject) => {
            this.db.query(sql, (err, ingredients) => {
                if (err) return reject(err)

                return resolve(ingredients)
            })
        })
    }
}

class Ingredient extends Model {
    constructor (db) {
        super (db)
        this.tableName = 'hobbies_ingredient'
    }

    getIngredients (fields = '*') {
        let sql = `SELECT ${fields} FROM ${this.tableName}`
        return new Promise((resolve, reject) => {
            this.db.query(sql, (err, ingredients) => {
                if (err) return reject(err)

                return resolve(ingredients)
            })
        })
    }
}

class RecipeIngredient extends Model {
    constructor (db) {
        super (db)
        this.tableName = 'hobbies_recipeingredients'
    }

    getByRecipe (recipeID, fields = '*') {
        let _ingredient = new Ingredient(this.db)
        let where = { "recipe_id": recipeID }
        let join = {
            type: 'left',
            table: `${_ingredient.tableName}`,
            on: `ingredient_id = ${_ingredient.tableName}.id`
        }
        let sort = {
            column: 'order',
            order: 'ASC'
        }
        let condition = {
            table: this.tableName,
            fields,
            where,
            join,
            sort
        }

        return this.getQuery(condition)
    }

    addRecipeIngredients (recipeID, ingredients) {
        const buildRecipeIngredients = () => ingredients.map((ingredient, index) => {
            return [
                ingredient.quantity,
                ingredient.description,
                index + 1,
                ingredient.id,
                recipeID
            ]
        })
        return this.insertBatch(
            this.tableName,
            ['quantity', 'description', 'order', 'ingredient_id', 'recipe_id'],
            buildRecipeIngredients()
        ).catch(err => { throw err })
    }

    updateIngredientByRecipe ({ recipeID, recipeIngredients }) {
        return new Promise((resolve, reject) => {
            const promises = [
                this.deleteByRecipe(recipeID),
                this.addRecipeIngredients(recipeID, recipeIngredients)
            ]
            Promise.all(promises)
                .then(() => resolve())
                .catch(err => reject(err))
        });
    }

    deleteByRecipe(recipeID) {
        const params = {
            'recipe_id': recipeID
        }
        return this.delete(this.tableName, params)
    }
}

class Procedure extends Model {
    constructor (db) {
        super (db)

        this.tableName = 'hobbies_procedure'
    }

    createTable () {
        let sql = `CREATE TABLE \`${this.tableName}\` (
            \`id\` int(11) NOT NULL AUTO_INCREMENT,
            \`description\` longtext NOT NULL,
            \`order\` int(10) unsigned NOT NULL,
            \`dateCreated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`recipe_id\` int(11) NOT NULL,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`hobbies_procedure_recipe_id_order_5cbc87a6_uniq\` (\`recipe_id\`,\`order\`),
            CONSTRAINT \`hobbies_procedure_recipe_id_beeb89a5_fk_hobbies_recipe_id\` FOREIGN KEY (\`recipe_id\`) REFERENCES \`hobbies_recipe\` (\`id\`)
        ) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
        `

        return this.query(sql)
    }

    addProcedures (recipeID, procedures) {
        const buildProcedures = () => procedures.map((description, index) => {
            return [
                description, // description
                index + 1, // order
                recipeID
            ]
        })
        return this.insertBatch(
            this.tableName,
            ['description', 'order', 'recipe_id'],
            buildProcedures()
        )
    }

    getByRecipe (recipeID, fields = '*') {
        let where = { "recipe_id": recipeID }
        let sort = {
            column: 'order',
            order: 'ASC'
        }
        let condition = {
            table: this.tableName,
            fields,
            where,
            sort
        }

        return this.getQuery(condition)
    }
    
    /**
     * UPDATES THE PROCEDURES OF THE RECIPE
     */
    updateProcedureByRecipe ({ recipeID, procedures }) {
        return new Promise ((resolve, reject) => {
            const promises = [
                this.deleteByRecipe(recipeID),
                this.addProcedures(recipeID, procedures)
            ]

            Promise.all(promises)
                .then(() => resolve())
                .catch(err => reject(err))
        })
    }

    deleteByRecipe(recipeID) {
        const params = {
            'recipe_id': recipeID
        }
        return this.delete(this.tableName, params)
    }
}
class Recipe extends Model {
    constructor (db) {
        super (db)

        this.table = {}
        this.tableName = 'hobbies_recipe'

    }

    setRecipe (name, favorite, duration_from, duration_to, food_category_id, image_path) {
        this.form = {}
        this.form.name = name ? name.trim() : ''
        this.form.favorite = favorite || 0
        this.form.duration_from = duration_from || 5
        this.form.duration_to = duration_to || 5
        this.form.food_category_id = food_category_id || null
        this.image_path = image_path
    }

    getInfo () {
        let _procedure = new Procedure(this.db)
        let _recipeIngredient = new RecipeIngredient(this.db)
        return new Promise(async(resolve, reject) => {
            let fields = 'quantity, description, ingredient_id, name'
            const recipeIngredients = _recipeIngredient.getByRecipe(this.id, fields)
            fields = 'description'
            const procedures = _procedure.getByRecipe(this.id, fields)
            await Promise.all([recipeIngredients, procedures])
                .then(response => resolve({ recipeIngredients: response[0], procedures: response[1] }))
                .catch(err => reject(err))
        })
    }

    /**
     * CHECK EMPTY VALUES
     *  it should be already checked on the front end
     * only additional validation before entering database
     */
    validateEmpty () {
        if (this.form.name.length <= 0) return false

        return true
    }

    /**
     * Handles submit and adding of recipe
     */
    addRecipe (procedures, ingredients) {
        // Insert to recipe
        return new Promise((resolve, reject) => {
            let _procedure = new Procedure(this.db)
            let _recipeIngredient = new RecipeIngredient(this.db)
            let recipe = {
                name: this.form.name,
                favorite: this.form.favorite,
                duration_from: this.form.duration_from,
                duration_to: this.form.duration_to,
                food_category_id: this.form.food_category_id,
                image_path: this.image_path
            }

            this.beginTransaction(async err => {
                try {
                    if (err) return reject(err);

                    // Insert recipe to hobbies_recipe
                    await this.insert(this.tableName, recipe).catch(err => { throw err })
                    // get inserted ID to be used as foreign key for procedures and recipeingredients
                    const recipeID = await this.insertID().catch(err => { throw err })

                    const promises = [
                        _procedure.addProcedures(recipeID, procedures),
                        _recipeIngredient.addRecipeIngredients(recipeID, ingredients)
                    ]
                    await Promise.all(promises).catch(err => { throw err })
                    await this.commitTransaction()
                    return resolve()
                } catch (err) {
                    // eslint-disable-next-line
                    console.log(err)
                    
                    await this.rollbackTransaction()
                    return reject(err)
                }
            })
        })
    }

    updateRecipe ({ recipeID, recipeIngredients, procedures }) {
        return this.transaction(async() => {
            const _recipeIngredient = new RecipeIngredient(this.db)
            const _procedure = new Procedure(this.db)
            const promises = [
                _recipeIngredient.updateIngredientByRecipe({ recipeID, recipeIngredients }),
                _procedure.updateProcedureByRecipe({ recipeID, procedures })
            ]

            await Promise.all(promises).catch(err => { throw err })
        })
    }

    updateRecipeInfo (form) {
        return this.transaction(async() => {
            let promises = [
                this.update(this.tableName, this.id, form)
            ]

            await Promise.all(promises).catch(err => { throw err })
        })
    }

    /**
     * Delete a recipe
     * @param { Number } recipeID 
     */
    async delete (recipeID) {
        return this.transaction(async() => {
            const recipeIngredient = new RecipeIngredient(this.db)
            const procedure = new Procedure(this.db)
            try {
                let promises = [
                    recipeIngredient.deleteByRecipe(recipeID),
                    procedure.deleteByRecipe(recipeID)
                ]
                await Promise.all(promises).catch(err => { throw err })
                await this.deleteByID(this.tableName, recipeID).catch(err => { throw err })
            } catch (err) {
                return Promise.reject(err)
            }

        })
    }
}

module.exports = {
    Recipe,
    Procedure,
    Ingredient,
    RecipeIngredient,
    FoodCategories
}