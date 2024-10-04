'use strict';
/**
 * This controller implements the business manager extension action for detail.
 *
 * @module controllers/show
 */
var server = require('server');
const ISML = require('dw/template/ISML');
const Logger = require('dw/system/Logger');
var URLUtils = require('dw/web/URLUtils');
var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
var ProductMgr = require('dw/catalog/ProductMgr');

server.get(
    'Show',
    function(req, res, next) {
        var productID = request.httpParameterMap.productSKU.value;
        if (empty(productID)) {
            var params = {
                status: 'failed',
                message: "Product Id should not be empty"
            };
            response.setContentType('application/json');
            response.writer.write(JSON.stringify(params));
            return;
        }
        const product = ProductMgr.getProduct(productID);

        if (empty(product)) {
            var params = {
                status: 'failed',
                message: "Requested product doesn't exist"
            };
            response.setContentType('application/json');
            response.writer.write(JSON.stringify(params));
            return;
        }
        const masterProduct = product.variationModel.master;

        var productJSON = {}

        if (empty(product.variationModel.variants)) {
            productJSON = defaultProduct(product);
        } else {
            productJSON = {
                attribute_definitions: product.variationModel.productVariationAttributes
                    .toArray()
                    .map(function(variationAttribute) {
                        return {
                            name: variationAttribute.displayName,
                            values: product.variationModel
                                .getAllValues(variationAttribute)
                                .toArray()
                                .map(function(variationValue) {
                                    return variationValue.displayValue;
                                })
                        };
                    }),
                product_id: product.ID,
                page_description: product.pageDescription,
                short_description: product.shortDescription,
                page_url: URLUtils.url('Product-Show', 'pid', product.ID).toString(), 
                tags: [],
                title: product.name,
                variants: serializeVariants(product)
            };
        }

        response.getWriter().print(JSON.stringify(productJSON, stripNulls));
        response.setStatus(200);
    }
);

function stripNulls(key, value) {
    if (value === null || value === "undefined") {
        return undefined;
    }
    return value;
}



function defaultProduct(product) {
    return {
        attribute_definitions: [{
            name: "Default",
            values: ["Name"]
        }],
        product_id: product.ID,
        page_description: product.pageDescription,
        short_description: product.shortDescription,
        page_url: URLUtils.url('Product-Show', 'pid', product.ID).toString(), 
        tags: [],
        title: product.name,
        variants: defaultVariants(product)
    };
}

function defaultVariants(product) {

    if (empty(product.variationModel.variants)) {

        const image = getAvaialableImageUrl(product);

        return [{
            attributes: [{
                name: "Default",
                values: "Name"
            }],
            allow_backorder: true,
            product_id: product.ID,
            variant_id: product.ID,
            product_amount: product.priceModel.price.toNumberString(),
            quantity_in_stock: 100,
            original_product_amount: "9999",
            inventory_managed_by_platform: true,
            sku: product.ID,
            title: product.name,
            image_urls: (!empty(image) && [image]) || []
        }];
    } else {
        serializeVariants(product)
    }
}

function getAvaialableImageUrl(product) {

    const IMAGE_VIEW_TYPE_MEDIUM = 'medium';
    const IMAGE_VIEW_TYPE_LARGE = 'large';
    const IMAGE_VIEW_TYPE_SMALL = 'small';

    var productImageUrl =
        (!empty(product.getImage(IMAGE_VIEW_TYPE_LARGE)) &&
            product.getImage(IMAGE_VIEW_TYPE_LARGE).httpsURL.toString()) || (!empty(product.getImage(IMAGE_VIEW_TYPE_MEDIUM)) &&
            product.getImage(IMAGE_VIEW_TYPE_MEDIUM).httpsURL.toString()) || (!empty(product.getImage(IMAGE_VIEW_TYPE_SMALL)) &&
            product.getImage(IMAGE_VIEW_TYPE_SMALL).httpsURL.toString()) ||
        null;

    return productImageUrl;
}

function serializeVariants(product) {

    const variants = product.variationModel.variants;
    return variants.toArray().map(function(variant) {

        const image = getAvaialableImageUrl(variant);

        const inventoryData = getInventoryData(variant);
        return {
            attributes: variant.variationModel.productVariationAttributes
                .toArray()
                .map(function(variationAttribute) {
                    return {
                        name: variationAttribute.displayName,
                        value: variant.variationModel.getSelectedValue(variationAttribute)
                            .displayValue
                    };
                }),
            allow_backorder: inventoryData.backorderable,
            product_id: product.ID,
            variant_id: variant.ID,
            product_amount: variant.priceModel.price.toNumberString(),
            quantity_in_stock: inventoryData.quantityInStock,
            inventory_managed_by_platform: true,
            sku: variant.UPC,
            title: variant.name,
            image_urls: (!empty(image) && [image]) || []
        };
    });
}

function getInventoryData(variant) {
    const inventoryRecord = variant.availabilityModel.inventoryRecord;
    if (!inventoryRecord) {
        return {
            backorderable: null,
            quantityInStock: 0
        }
    }

    return {
        backorderable: inventoryRecord.backorderable,
        quantityInStock: inventoryRecord.ATS.value
    }
}
module.exports = server.exports();