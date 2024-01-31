const { Core, Utils, Events } = Global;
const { $loading } = Utils;

customElements.define('cart-loader', class extends Core { 

    render() {
        this.sub(Events.CART_CHANGE, this._handleCartChange, { global: true });
    }

    _handleCartChange({ key }) {
        const updatingProduct = this.querySelector(`[data-item-key="${key}"]`);
        if(!updatingProduct) {
            return;
        }

        $loading(updatingProduct);
    }

})