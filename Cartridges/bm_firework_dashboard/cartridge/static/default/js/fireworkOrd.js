'use strict';

var $ = window.jQuery;
$(document).ready(function () {
    $(document).on('click', '.request-delivery-btn', function (e) {
        e.preventDefault();
        var $requestBtn = $(this);
        var orderNo = $(this).attr('data-orderno');
        var $feedbackMsg = $(this).siblings('.feedback-message');
        var $alert = $('#alertCollapse');
        if ($alert.length) {
            $alert.collapse('hide');
        }
        $requestBtn.prop('disabled', true);
        $.ajax({
            url: $(this).attr('data-url'),
            type: 'post',
            dataType: 'json',
            data: {
                orderNo: orderNo
            },
            success: function (response) {
                var message = '';
                if ($alert.length) {
                    $alert.collapse('show');
                }
                $alert.removeClass('alert-danger alert-success');
                $feedbackMsg.removeClass('d-none text-primary');
                if (response.success) {
                    message = $requestBtn.attr('data-success-msg');
                    $feedbackMsg.addClass('text-success').text(message);
                    $alert.addClass('alert-success');
                    $alert.find('.alert-msg').text(message);
                } else {
                    message = $requestBtn.attr('data-error-msg');
                    $feedbackMsg.addClass('text-danger').text(message);
                    $alert.addClass('alert-danger');
                    $alert.find('.alert-msg').text(message);
                    $requestBtn.prop('disabled', false);
                }
            }
        });
    });
});
