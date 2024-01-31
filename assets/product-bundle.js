const { Core, Events, Cache } = Global;
const { $fetch, $replaceContent, $toggleDisplay } = Global.Utils;

function _getPriceValue(el) {
    return Number(el.dataset.priceValue);
}

customElements.define('product-bundle', class extends Core {
    propTypes = {
        'product-url': String,
        'initial-variant': String,
        'subtotal': Number,
        'selected-count': Number
    }

    elements = {
        $: ['subtotal', 'main-product', 'main-product-meta', 'footer'],
        'button-counter': '[data-i18n-amount]'
    }

    render() {
        this._initValues();

        this.$({
            change: this._handleChange
        });

        this.$('main-product', {
            update: this._handleMainProductUpdate
        });
    }

    _initValues() {
        this.mainPrice = _getPriceValue(this.$('main-product-meta'));
        this.subtotal = this.prop('subtotal');
        this.selectedCount = this.prop('selected-count');
    }

    _handleMainProductUpdate() {
        const productMeta = this.$('main-product-meta');

        // Don't like the idea of relying on implicit re-render of main-product-meta, but right now it's the cheapest option
        $toggleDisplay(this, productMeta.dataset.available);
        
        const updatedMainPrice = _getPriceValue(productMeta);
        if(this.mainPrice === updatedMainPrice) {
            return;
        }
        this.subtotal = this.subtotal - this.mainPrice + updatedMainPrice;
        this.mainPrice = updatedMainPrice;
        this._renderSubtotal();
    }

    _handleChange(e) {
        const checkbox = e.target;
        try {
            if(checkbox.tagName !== 'INPUT' || checkbox.type !== 'checkbox') {
                throw new Error('invalid change event');
            }
            const price = _getPriceValue(checkbox);
            if(isNaN(price)) {
                throw new Error('invalid price');
            }
            if(checkbox.checked) {
                this.subtotal += price;
                this.selectedCount++;
            } else {
                this.subtotal -= price;
                this.selectedCount--;
            }
            this._renderSubtotal();
            this._renderFooter();
            this._updateButtonCount();
        } catch(e) {
            console.error(e);
        }
    }

    _renderFooter() {
        $toggleDisplay(this.$('footer'), this.selectedCount > 0);
    }

    _updateButtonCount() {
        // count with the main product
        this.$('button-counter').innerText = this.selectedCount + 1;
    }

    _renderSubtotal() {
        const renderValue = Shopify.formatMoney(this.subtotal);
        this.$('subtotal').innerText = renderValue;
    }

})