module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('products', {

        subCategoryId: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'subcategory_Id'
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 0,
            field: 'sku'
        },
        productName: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 0,
            field: 'product_name'
        },
        slug: {
            type: DataTypes.STRING,
            field: 'slug'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'weight'

        },
        productImage: {
            type: DataTypes.TEXT,
            defaultValue: 0,
            field: 'product_image'

        },
        manufacturingCostPerGram: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'manufacturing_cost_per_gram'
        }, 
        hallmarkingPackaging: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'hallmarking_packaging',
        },
        shipping: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'shipping',
        },
        isEmiAvailable: {
            type: DataTypes.BOOLEAN,
            field: 'is_emi_available',
            defaultValue: true
        },
    }, {
        freezeTableName: true,
        tableName: 'emi_product',
        // schema: 'gold_emi',
    });

    return Product;
}