/**
 * Product helper
 */
var Transaction = require('dw/system/Transaction');
var ProductMgr = require('dw/catalog/ProductMgr');
/*
 * attr product (object/string) 
 */
function getProductCategory(product) {
	var Product = typeof product == 'string' ? ProductMgr.getProduct(product) : product;
	var primaryCategory;
	if (Product.isVariant()) {
        var variationMaster = Product.getMasterProduct();

        primaryCategory = variationMaster.getPrimaryCategory();
    	if (empty(primaryCategory)) {
    		primaryCategory = variationMaster.getClassificationCategory();
    	}
    	if (empty(primaryCategory)) {
    		primaryCategory = variationMaster.categories[0];
    	}

    } else {
    	primaryCategory = Product.getPrimaryCategory();
    }
	return {
		name: primaryCategory.displayName,
		ID: primaryCategory.ID
	};
}
function getMasterProductID(product) {
	
	var Product = typeof product == 'string' ? ProductMgr.getProduct(product) : product;
        var masterProductID = Product.getID();
        if (Product.variant) {
            masterProductID = Product.masterProduct.getID();
        }
	return masterProductID;
}
function getProductAvgRate(product) {
	var Product = typeof product == 'string' ? ProductMgr.getProduct(product) : product;
	var primaryCategory;
	var acAvgRate = Product.custom.acAvgRate;
	return {
		avgRate: acAvgRate
	};
}
exports.getMasterProductID=getMasterProductID;
exports.getProductAvgRate=getProductAvgRate;
exports.getProductCategory = getProductCategory;