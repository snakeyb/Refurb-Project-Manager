define(['action-handler'], function (Dep) {

    var REFURB_APP_URL = '{{REFURB_APP_URL}}';

    return class extends Dep {

        openRefurbProjects() {
            var model = this.view.model;
            var entityType = model.entityType || model.name;
            var entityId = model.id;
            var entityName = model.get('name') || '';
            var espoUrl = window.location.origin;

            var authToken = null;
            var cookies = document.cookie.split(';');
            var username = '';
            var token = '';

            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();

                if (cookie.indexOf('auth-username=') === 0) {
                    username = decodeURIComponent(cookie.substring('auth-username='.length));
                }

                if (cookie.indexOf('auth-token=') === 0) {
                    token = decodeURIComponent(cookie.substring('auth-token='.length));
                }
            }

            if (username && token) {
                authToken = btoa(username + ':' + token);
            }

            var queryParams = new URLSearchParams({
                entityType: entityType,
                entityId: entityId,
                entityName: entityName,
                espoUrl: espoUrl
            });

            var hashParams = '';

            if (authToken) {
                hashParams = '#auth=' + encodeURIComponent(authToken) +
                    '&espoUrl=' + encodeURIComponent(espoUrl);
            }

            var url = REFURB_APP_URL + '?' + queryParams.toString() + hashParams;

            window.open(url, '_blank');
        }
    };
});
