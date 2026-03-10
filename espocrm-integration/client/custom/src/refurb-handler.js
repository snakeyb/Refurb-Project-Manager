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

            var cookies = document.cookie.split(';');
            var cookieToken = '';

            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();

                if (cookie.indexOf('auth-username=') === 0) {
                    username = decodeURIComponent(cookie.substring('auth-username='.length));
                }

                if (cookie.indexOf('auth-token=') === 0) {
                    cookieToken = decodeURIComponent(cookie.substring('auth-token='.length));
                }
            }

            if (!cookieToken) {
                Espo.Ui.error('Could not read authentication token. Please re-login and try again.');

                return;
            }

            var authToken = btoa(username + ':' + cookieToken);

            Espo.Ajax.getRequest('RefurbAuth')
                .then(function (response) {
                    var authSecret = (response && response.authTokenSecret) ? response.authTokenSecret : '';

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
                })
                .catch(function () {
                    Espo.Ui.error('Could not retrieve authentication secret. Please try again.');
                });
        }
    };
});
