// TODO: deprecated component
const { Core, Events } = Global;

const EL_PARENT = '[data-element="cart-item"]';
const CN_LOADING = '!loading';
const ATTR_VARIANT_ID = 'variant-id';
const ATTR_SELLING_PLAN_ID = 'selling-plan-id';
const ATTR_LINE_KEY = 'line';
const ATTR_ITEM_KEY = 'key';

class CartControl extends Core {
    get variantId() {
        return this.getAttribute(ATTR_VARIANT_ID);
    }

    get sellingPlanId() {
        return this.getAttribute(ATTR_SELLING_PLAN_ID) || '';
    }
    
    get $parentItem() {
        return this.closest(EL_PARENT);
    }

    get line() {
        return this.getAttribute(ATTR_LINE_KEY)
    }

    get key() {
        return this.getAttribute(ATTR_ITEM_KEY);
    }

    parentLoading() {
        this.$parentItem?.classList.add(CN_LOADING);
    }
}

customElements.define('cart-qty-button', class extends CartControl { 
    propTypes = {
        'set-value': String 
    }

    render() {
        this.$({ click: this._onQtyChange }); // TODO: { once: true })
    }

    _onQtyChange(e) {
        e.preventDefault();
        this.parentLoading();
        this.pub(Events.CART_CHANGE, {
            id: this.variantId,
            key: this.key, 
            quantity: this.prop('set-value'),
            selling_plan: this.sellingPlanId,
            line: this.line,
            src: this.tagName
        });
    };
});

customElements.define('cart-qty-input', class extends CartControl {
    render() {
        this.$({'change': this._onQtyChange});  // TODO: { once: true })
    };

    _onQtyChange(e) {
        this.parentLoading();
        this.pub(Events.CART_CHANGE, {
            id: this.variantId,
            key: this.key, 
            quantity: e.target.value,
            selling_plan: this.sellingPlanId,
            line: this.line,
            src: this.tagName
        });
    };
});