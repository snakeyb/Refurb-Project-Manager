define(['views/record/panels/relationship'], function (Dep) {

    /**
     * Wraps the standard relationship panel so that when the refurbProjects link
     * is absent from the model (because the user's role blocks access to the
     * RefurbProject entity), the panel silently hides itself instead of throwing.
     *
     * EspoCRM's built-in relationship.js throws unconditionally when the link is
     * not in model.defs.links, and clientDefs bottomPanels are not filtered
     * through the layout-system ACL pipeline, so this wrapper is necessary.
     */
    return class extends Dep {

        setup() {
            // Replicate the link-resolution logic from the parent so we can
            // check existence before super.setup() attempts to use the link.
            var link = this.defs.link || this.panelName;

            var links = (this.model.defs && this.model.defs.links) || {};

            if (!(link in links)) {
                this._noAccess = true;

                return;
            }

            super.setup();
        }

        render() {
            if (this._noAccess) {
                // Hide the container the detail view created for this panel.
                if (this.$el && this.$el.length) {
                    this.$el.addClass('hidden');
                }

                return Promise.resolve();
            }

            return super.render.call(this, ...arguments);
        }
    };
});
