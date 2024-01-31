const { Core, Events, Utils } = Global;
const { $replaceContent } = Utils;

customElements.define('collection-products', class extends Core {
    elements = {
        $: ['products-container']
    }
    
    render() {
        this.sub(Events.COLLECTION_UPDATED, this._handleCollectionUpdate);
    }

    _handleCollectionUpdate({ doc, src }) {
        if(src !== 'dynamic-pagination') {
            this.updateContentFrom(doc);
            return;
        }

        const additionalProducts = 
            doc.getElementById(this.id)
                .querySelector(this.elements['products-container'])
                .childNodes;

        this.$('products-container')
            .append(...additionalProducts);
    }
})