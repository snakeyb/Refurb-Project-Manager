define(['action-handler'], function (Dep) {

    var REFURB_APP_URL = '{{REFURB_APP_URL}}';

    return class extends Dep {

        editRefurbProject() {
            var model = this.view.model;
            var refurbId = model.id;
            var entityType = model.get('associatedEntityType') || '';
            var entityId = model.get('associatedEntityId') || '';
            var entityName = model.get('associatedEntityName') || '';
            var espoUrl = window.location.origin;

            this._openRefurbApp(espoUrl, entityType, entityId, entityName, refurbId);
        }

        createRefurbProject() {
            var espoUrl = window.location.origin;

            this._openRefurbApp(espoUrl, '', '', '', null);
        }

        _openRefurbApp(espoUrl, entityType, entityId, entityName, refurbId) {
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

                    var queryParams = new URLSearchParams();

                    if (entityType) {
                        queryParams.set('entityType', entityType);
                    }

                    if (entityId) {
                        queryParams.set('entityId', entityId);
                    }

                    if (entityName) {
                        queryParams.set('entityName', entityName);
                    }

                    queryParams.set('espoUrl', espoUrl);

                    var hashParts = [
                        'auth=' + encodeURIComponent(authToken),
                        'espoUrl=' + encodeURIComponent(espoUrl)
                    ];

                    if (authSecret) {
                        hashParts.push('authSecret=' + encodeURIComponent(authSecret));
                    }

                    var path = '';

                    if (refurbId) {
                        path = '/projects/' + refurbId + '/edit';
                    } else {
                        path = '/projects/new';
                    }

                    var url = REFURB_APP_URL + path + '?' + queryParams.toString() + '#' + hashParts.join('&');

                    window.open(url, '_blank');
                })
                .catch(function () {
                    Espo.Ui.error('Could not retrieve authentication secret. Please try again.');
                });
        }
    };
});
