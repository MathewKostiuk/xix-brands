const { Core, Utils, Events } = Global;

customElements.define('cart-notification', class extends Core {
    elements = {
        'modal': 'modal-container'
    }

    render() {
        this._handleModal();
        this._muteDrawer();
    }

    _handleAddToCart({ req }) {
        if(req === 'cartAdd') {
            // need this delay for animation
            setTimeout(() => {
                this.$('modal').open();
            }, 50);
        }
    }

    async _handleModal() {
        await customElements.whenDefined(this.elements.modal);
        this.sub(Events.CART_UPDATE, this._handleAddToCart, { global: true });
    }

    async _muteDrawer() {
        await customElements.whenDefined('cart-drawer');
        this.pub(Events.CART_DRAWER_MUTE);
    }
})