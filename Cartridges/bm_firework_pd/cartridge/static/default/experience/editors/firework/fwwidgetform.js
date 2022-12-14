const getIframeUrl = (value, config) => {
    if(value!=null)
    {
        val = encodeURIComponent(JSON.stringify(value));
        let widgetType = encodeURIComponent(JSON.stringify(config.widgetType));
        return config.iFrameEnv + '?widgetType=' + widgetType + '&value=' +val;
    }
    else
    {
        let widgetType = encodeURIComponent(JSON.stringify(config.widgetType));
        return config.iFrameEnv + '?widgetType=' + widgetType;  
    }
    
};
const reInitIframe = (value, config) => {
    
    var iFrm = document.getElementById('widget-form');
    if (iFrm) {
        iFrm.src = getIframeUrl(value, config);
    }
};
const handleIframeMessage = (message, ifrm, value = null, config) => {
    if (message.action) {
        switch (message.action) {
        case 'done':
            delete message.action;
            emit({
                type: 'sfcc:valid',
                payload: {
                    valid: false
                }
            });
            emit({
                type: 'sfcc:value',
                payload: message
            });
            break;
        case 'invalid':
            emit({
                type: 'sfcc:valid',
                payload: {
                    valid: false
                }
            });
            break;
        }
    }
};
(() => {
    subscribe('sfcc:ready', async ({ value, config }) => {
        let iFrame = document.createElement('iframe');
        iFrame.src = getIframeUrl(value, config);
        iFrame.id = 'widget-form';
        iFrame.setAttribute('frameborder', 0);
        iFrame.setAttribute('marginwidth', 0);
        iFrame.setAttribute('marginheight',0);
        iFrame.setAttribute('height',config.iframesize);
        iFrame.setAttribute('vspace', 0);
        iFrame.setAttribute('hspace', 0);
        iFrame.setAttribute('scrolling', 'no');
        iFrame.setAttribute('name', Date.now().toString());
        document.body.appendChild(iFrame);
        let ifrm = document.querySelector('iframe');
        window.addEventListener('message', (event) =>
            {
                handleIframeMessage(event.data, ifrm, value, config);
            });
        window.config = config;
        iFrameResize({ heightCalculationMethod: 'taggedElement' }, '#widget-form');
    });
    
    listen('sfcc:value', (value) => {
        reInitIframe(value, window.config);
    });
})();
