// TODO: deprecated component
const { Core, Utils, Events } = Global;
const { $replaceContent, $toggleDisplay } = Utils;

customElements.define('x-cart', class extends Core {
    elements = {
        $: ['items-container', 'cart-empty', 'items-wrapper', 'subtotal-block', 'free-shipping-block']
    }

    render() {
        this._registerAsFeature();
        this.sub(Events.CART_UPDATE, this._onUpdate, { global: true });
    };

    async _registerAsFeature() {
        await customElements.whenDefined('cart-provider');
        this.pub(Events.CART_ADD_FEATURE, { feature: 'cart' });
    }

    _onUpdate({ cart }) {
        if (!cart) return;
        const hasCartItems = cart.getCount() > 0;
        this._toggleView(hasCartItems);
        hasCartItems && this._updateItems(cart);
    }

    _toggleView(state) {
        $toggleDisplay(this.$('cart-empty'), !state);
        $toggleDisplay(this.$('items-container'), state);
    }

    _updateItems({ getItems, getSubtotalBlock, getFreeShippingBlock }) {
        this.$('subtotal-block') && $replaceContent(this.$('subtotal-block'), getSubtotalBlock());
        this.$('free-shipping-block') && $replaceContent(this.$('free-shipping-block'), getFreeShippingBlock());
        $replaceContent(this.$('items-wrapper'), getItems());
    }
});