define(['views/record/panels/relationship'], function (Dep) {

    return class extends Dep {

        setup() {
            var links = (this.model.defs && this.model.defs.links) ? this.model.defs.links : {};

            if (!links.refurbProjects) {
                this.hide();

                return;
            }

            super.setup();
        }
    };
});
