const { Core, Events } = Global;

const CN_LOADING = '!loading';
const ATTR_VARIANT_ID = 'variant-id';

customElements.define('product-to-cart', class extends Core {
    elements = {
        $: ['to-cart-button']
    }

    propTypes = {
        'form-child': Boolean,
        'selling-plan-id': String
    }

    render() {
        this.$({click: this._onClick});
        this.sub(Events.CART_UPDATE, this._cartUpdateHandler, { global: true });
        this.sub(Events.CART_ERROR, this._cartUpdateHandler, { global: true });
    }

    _onClick(e) {
        !this.prop('form-child') && e.preventDefault();
        this.loading = true;
        !this.prop('form-child') && this.addToCart(this.cartItem);
    }

    addToCart(items, mainVariantId) {
        this.pub(Events.CART_ADD, {
            items,
            id: mainVariantId
        });
    }

    _cartUpdateHandler() {
        setTimeout(() => {
            this.loading = false
        }, 1500)
    }

    get cartItem() {
        return [{ 
            id: this.variantId,
            quantity: 1,
            selling_plan: this.prop('selling-plan-id') || ''
        }]
    }
    
    set loading(state) {
        this.$('to-cart-button').classList.toggle(CN_LOADING, state);
    }

    set variantId(id) {
        this.setAttribute(ATTR_VARIANT_ID, id)
    }

    get variantId() {
        return +this.getAttribute(ATTR_VARIANT_ID)
    }
})