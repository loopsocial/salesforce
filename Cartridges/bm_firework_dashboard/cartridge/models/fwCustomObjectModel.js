'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');

/**
 * @description Contructor function for the model
 * @constructor CustomObject
 */
function CustomObject() {
}

/**
 * Get Custom Object
 * @param {*} typeCustomObject type
 * @param {*} idCustomObject id
 * @returns {*}custom object
 */
CustomObject.prototype.getCustomObject = function (typeCustomObject, idCustomObject) {
    return CustomObjectMgr.getCustomObject(typeCustomObject, idCustomObject);
};
/**
 * query custom object
 * @param {*} typeCustomObject type
 * @param {*} queryStringCustomObject queryString
 * @param {*} sortStringCustomObject  sortString
 * @param {*} argsCustomObject args
 * @returns {*} custom object
 */
CustomObject.prototype.queryCustomObjects = function (typeCustomObject, queryStringCustomObject, sortStringCustomObject, argsCustomObject) {
    return CustomObjectMgr.queryCustomObjects(typeCustomObject, queryStringCustomObject, sortStringCustomObject, argsCustomObject);
};

/**
 * Create Custom Object
 * @param {*} typeCustomObject type
 * @param {*} idCustomObject id
 * @returns {*}custom object
 */
CustomObject.prototype.createCustomObject = function (typeCustomObject, idCustomObject) {
    return CustomObjectMgr.createCustomObject(typeCustomObject, idCustomObject);
};

module.exports = CustomObject;
