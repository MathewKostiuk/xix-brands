const { Core, Utils, Events } = Global;
const { $loading } = Utils;

customElements.define('cart-drawer', class extends Core { 
    elements = {
        'modal': 'modal-container'
    }

    render() {
        this.sub(Events.CART_UPDATE, this._handleAddingToCart, { global: true });
        this.sub(Events.CART_CHANGE, this._handleCartChange, { global: true });
        this.sub(Events.CART_DRAWER_MUTE, this._handleMute, { once: true, global: true });
    }

    _handleAddingToCart({ req }) {
        if(req === 'cartAdd') {
            this.$('modal').open();
        }
    }

    _handleCartChange({ key }) {
        const updatingProduct = this.querySelector(`[data-item-key="${key}"]`);
        if(!updatingProduct) {
            return;
        }

        $loading(updatingProduct);
    }

    _handleMute() {
        this.unsub(Events.CART_UPDATE);
    }
})