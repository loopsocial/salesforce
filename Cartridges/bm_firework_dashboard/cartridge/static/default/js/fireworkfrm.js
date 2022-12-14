function onKeyUpFunction() {
    var str = document.getElementById('fworganizationid').value; //"f_ecom_zyei_001";
    var split_str = str.split('_').slice(-2)[0] + '_' + str.split('_').slice(-1)[0];
    document.getElementById('tenantId').value = split_str;
}