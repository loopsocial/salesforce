/* global request response */
'use strict';

var ISML = require('dw/template/ISML');

/**
 * Generate address name based on the full address object
 * @param {dw.order.OrderAddress} address - Object that contains shipping address
 * @returns {string} - String with the generated address name
 */
function generateAddressName(address) {
    return [(address.address1 || ''), (address.address2 || ''), '<br>', (address.city || ''), (address.postalCode || ''), '<br>', (address.countryCode || '')].join(' ');
}
/**
 * Get Orders
 * @param {number|null} orderNo - order number
 * @returns {dw.util.ArrayList} orders - Orders
 */
function getOrders(orderNo) {
    var SystemObjectMgr = require('dw/object/SystemObjectMgr');
    var ArrayList = require('dw/util/ArrayList');
    var StringUtils = require('dw/util/StringUtils');
    var Calendar = require('dw/util/Calendar');
    var systemOrders;
    if (orderNo) {
        systemOrders = SystemObjectMgr.querySystemObjects('Order', "orderNo LIKE {0} AND custom.fwpaymentprovider ='Stripe'", 'creationDate desc', orderNo);
    } else {
        systemOrders = SystemObjectMgr.querySystemObjects('Order',"custom.fwpaymentprovider ='Stripe'", 'creationDate desc');
    }
    var orders = new ArrayList(); // eslint-disable-line no-shadow
    var order;
    var orderDate;
    var obj;

    var orderIndex = 0;
    var maxSystemOrdersCount = 9000;
    var orderPropertyNames = {
        orderNo: 'Number',
        orderDate: 'Order Date',
        customer: 'Customer',
        email: 'Email',
        orderTotal: 'Total',
        status: 'Status'
    };
    while (systemOrders.hasNext()) {
        orderIndex += 1;

        if (orderIndex > maxSystemOrdersCount) {
            break;
        }
        order = systemOrders.next();

        orderDate = new Date(order.creationDate);
        obj = {
            orderNo: order.orderNo,
            orderDate: StringUtils.formatCalendar(new Calendar(orderDate), 'M/dd/yy h:mm a'),
            customer: order.customerName,
            email: order.customerEmail,
            orderTotal: order.totalGrossPrice,
            status: order.status
        };
        orders.push(obj);
    }
    var PropertyComparator = require('dw/util/PropertyComparator');
    orders.sort(new PropertyComparator('dateCompare', false));

    return {
        orderTableNames: orderPropertyNames,
        orders: orders
    };
}
/**
 * Render Template
 * @param {string} templateName - Template Name
 * @param {Object} data - pdict data
 */
function render(templateName, data) {
    if (typeof data !== 'object') {
        data = {}; // eslint-disable-line no-param-reassign
    }
    try {
        ISML.renderTemplate(templateName, data);
    } catch (e) {
        throw new Error(e.javaMessage + '\n\r' + e.stack, e.fileName, e.lineNumber);
    }
}

/**
 * Show firework order list
 */
function show() {
    var Site = require('dw/system/Site');
    var PagingModel = require('dw/web/PagingModel');
    var orderNo = request.httpParameterMap.orderNo.stringValue || null;
    var ordersObj = getOrders(orderNo);
    var pageSize = request.httpParameterMap.pageSize.stringValue || 10;
    var currentPage = request.httpParameterMap.page.stringValue || 1;
    var start = pageSize * (currentPage - 1);
    var orderPagingModel = new PagingModel(ordersObj.orders);

    orderPagingModel.setPageSize(pageSize);
    orderPagingModel.setStart(start);
    var currentURL = [request.httpProtocol, '://', request.httpHost, '/on/demandware.store/Sites-' + Site.getCurrent().ID + '-Site', '/default/fireworkorder-Track?order='].join('');
    render('fireworkorder/fireworkOrderMenu', {
        orderTableNames: ordersObj.orderTableNames,
        pagingModel: orderPagingModel,
        currentURL: currentURL
    });
}
/**
 * Show Order detail
 */
function detail() {
    var OrderMgr = require('dw/order/OrderMgr');
    var orderNo = request.httpParameterMap.orderNo.stringValue || null;
    var order = OrderMgr.getOrder(orderNo);
    var details = {
        'OrderNo': order.orderNo,
        'Order Number': order.orderNo,
        'Creation Date': order.creationDate,
        'Ip Address': order.remoteHost,
        'Customer Name': order.customerName,
        'Email Address': order.customerEmail,
        'Order Total': order.totalGrossPrice,
        'Address ': generateAddressName(order.defaultShipment.shippingAddress)
    };
    render('fireworkorder/fireworkOrderDetail', {
        details: details
    });
}
/**
 * Request delivery functionality
 */
function requestRefund() {
    var OrderMgr = require('dw/order/OrderMgr');
    var Transaction = require('dw/system/Transaction');
    var orderNo = request.httpParameterMap.orderNo.stringValue || null;
    var order = OrderMgr.getOrder(orderNo);
    if (order) {
        var fireworkOrderServiceObj =require('~/cartridge/scripts/fireworkorder/fireworkOrderService');
        var serviceResponse = fireworkOrderServiceObj.sendRefundRequest(orderNo);
        var shipment = order.getDefaultShipment();
        if (!serviceResponse.ok && serviceResponse.status === 'ERROR') {
            if (serviceResponse.errorMessage) {
                try {
                    var errorMsg = JSON.parse(serviceResponse.errorMessage);
                    Transaction.wrap(function () {
                        shipment.custom.fireworkRefundStatus = false;
                    });
                } catch (e) {
                    Transaction.wrap(function () {
                        shipment.custom.fireworkRefundStatus= false;
                    });
                }
            }
            response.setContentType('application/json');
            response.setStatus(200);
            response.writer.print(JSON.stringify({
                success: false
            }));
        } else {
            Transaction.wrap(function () {
                shipment.custom.fireworkRefundStatus=TURE;
            });
            response.setContentType('application/json');
            response.setStatus(200);
            response.writer.print(JSON.stringify({
                success: true
            }));
        }
    }
}

show.public = true;
detail.public = true;
requestRefund.public = true;

exports.Show = show;
exports.Detail = detail;
exports.RequestRefund = requestRefund;
