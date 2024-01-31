const { Core, Utils, Events } = Global;
const { $replaceContent } = Utils;

customElements.define('collection-modal-filters', class extends Core {
    propTypes = {
        'target': String
    }

    render() {
        this.sub(Events.COLLECTION_UPDATED, this._onCollectionChange);
    }

    _onCollectionChange({ doc }) {
        $replaceContent(this, doc.querySelector(this.prop('target')).content.querySelector(`${this.tagName}[section-id=${this.sectionId}]`))
    }
})
