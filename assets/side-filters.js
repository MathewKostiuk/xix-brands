const { Core, Utils, Events } = Global;
const { $replaceContent } = Utils;

customElements.define('side-filters', class extends Core {
    propTypes = {
        'target-id': String
    }

    render() {
        this.sub(Events.COLLECTION_UPDATED, this._onCollectionChange);
    }

    _onCollectionChange({ doc }) {
        $replaceContent(this, doc.querySelector(`#${this.prop('target-id')}`).content.querySelector(this.tagName))
    }
})