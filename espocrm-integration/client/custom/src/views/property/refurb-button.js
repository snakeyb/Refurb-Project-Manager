define('custom:views/property/refurb-button', [], function () {

    const REFURB_APP_URL = '{{REFURB_APP_URL}}';

    return {
        action: function (data, e) {
            const model = this.model;
            const entityType = model.entityType || 'Property';
            const entityId = model.id;
            const entityName = model.get('name') || '';
            const espoUrl = window.location.origin;

            const params = new URLSearchParams({
                entityType: entityType,
                entityId: entityId,
                entityName: entityName,
                espoUrl: espoUrl
            });

            const url = REFURB_APP_URL + '?' + params.toString();
            window.open(url, '_blank');
        }
    };
});
