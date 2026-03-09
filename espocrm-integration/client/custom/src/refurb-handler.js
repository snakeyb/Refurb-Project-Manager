define(['action-handler'], function (Dep) {

    var REFURB_APP_URL = '{{REFURB_APP_URL}}';

    return class extends Dep {

        isVisible() {
            var entityType = this.view.model.entityType || this.view.model.name;

            return ['Lead', 'Opportunity'].includes(entityType);
        }

        openRefurbProjects() {
            var model = this.view.model;
            var entityType = model.entityType || model.name;
            var entityId = model.id;
            var entityName = model.get('name') || '';
            var espoUrl = window.location.origin;

            var username = this.view.getUser().get('userName') || '';
            var authToken = null;
            var authSecret = null;

            var cookies = document.cookie.split(';');
            var cookieToken = '';
            var cookieSecret = '';
            var cookieUsername = '';

            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();

                if (cookie.indexOf('auth-username=') === 0) {
                    cookieUsername = decodeURIComponent(cookie.substring('auth-username='.length));
                }

                if (cookie.indexOf('auth-token=') === 0) {
                    cookieToken = decodeURIComponent(cookie.substring('auth-token='.length));
                }

                if (cookie.indexOf('auth-token-secret=') === 0) {
                    cookieSecret = decodeURIComponent(cookie.substring('auth-token-secret='.length));
                }
            }

            if (cookieUsername) {
                username = cookieUsername;
            }

            if (cookieToken) {
                authToken = btoa(username + ':' + cookieToken);
                authSecret = cookieSecret || null;
            }

            if (!authToken) {
                Espo.Ui.error('Could not read authentication credentials. Please re-login and try again.');

                return;
            }

            var queryParams = new URLSearchParams({
                entityType: entityType,
                entityId: entityId,
                entityName: entityName,
                espoUrl: espoUrl
            });

            var hashParts = [
                'auth=' + encodeURIComponent(authToken),
                'espoUrl=' + encodeURIComponent(espoUrl)
            ];

            if (authSecret) {
                hashParts.push('authSecret=' + encodeURIComponent(authSecret));
            }

            var url = REFURB_APP_URL + '?' + queryParams.toString() + '#' + hashParts.join('&');

            window.open(url, '_blank');
        }
    };
});
