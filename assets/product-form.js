const { Core } = Global;
const PREFIX_BUY_WITH = 'buy_with_' 

const CUSTOM_PROPERTY_REF = 'customPropertyReference';

customElements.define('product-form', class extends Core {

    elements = {
        toCartButton: 'product-to-cart',
        form: '[data-type=add-to-cart-form]'
    }

    render() {
        this.$('form', {
            submit: this._submitHandler
        })
    }

    _submitHandler(e) {
        e.preventDefault();
        this.$('toCartButton').addToCart(this.cartItems, this.mainVariantId);
    }

    _isVariantInput([ inputName, value ]) {
        if (inputName === 'selling_plan') this._setSellingPlan(value);
        return inputName.includes(PREFIX_BUY_WITH) || inputName === 'id';
    }
    
    _setSellingPlan(id) {
        this.sellingPlanId = id;
    }

    _setCartItem([ inputName, value ]) {
        if (inputName === 'id') this.mainVariantId = value;
        const sellingPlanId = this.sellingPlanId || '';
        return {
            id: value,
            quantity: this._getItemQty(inputName),
            selling_plan: inputName === 'id' ? sellingPlanId : '',
            properties: this._getProperties(inputName)
        }
    }

    _getItemQty(inputName) {
        return inputName === 'id' ? this.qty : 1;
    }
    _getProperties(inputName) {
        return inputName === 'id' ? this.properties : {};
    }

    get cartItems() {
        return Array.from(this.formData.entries())
            .filter(this._isVariantInput.bind(this))
            .map(this._setCartItem.bind(this))
    }

    get formData() {
        return new FormData(this.$('form'));
    }

    get qty() {
        return +this.formData.get('quantity') || 1;
    }
    get properties() {
        const propertyKeys = this.formData.getAll(CUSTOM_PROPERTY_REF);
        return propertyKeys.filter(Boolean).reduce((acc, key) => {
            acc[key] = this.formData.get(`properties[${key}]`);
            return acc;
        }, {})
    }
})