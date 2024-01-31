const { Core, Utils, Events } = Global;
const { $fetch, parseHTML } = Utils;


customElements.define('cart-provider', class extends Core {
    liveSections = new Set();

    render() {
        this.sub(Events.CART_REGISTER, this._registerSection, { global: true });
        this.sub(Events.CART_ADD, this._addToCart, { global: true });
        this.sub(Events.CART_CHANGE, this._updateCart, { global: true });
    }

    _registerSection(section) {
        this.liveSections.add(section);
    }
    
    async _addToCart({ items }) {
        await this._requestCart('cartAdd', {
            items,
            attributes: {
                notification_items_variant_ids: items.map(({id}) => id).join(',')
            }
        }, items.map(item => item.id));
        this._cleanCartAttributes();
    }

    _cleanCartAttributes() {
        this._fetchCart('cartUpdate', { attributes: { notification_items_variant_ids: null }});
    }

    _fetchCart(route, body) {
        return fetch(`${window.dynamicURLs[route]}.js`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(
                body
            )
        })
    }

    async _updateCart({ key, quantity, selling_plan }) {
        // TODO: depracate implicit variantId
        const [variantId] = key.split(':');
        await this._requestCart('cartChange', {
            id: key, quantity, selling_plan,
        }, [variantId]);
    }

    async _requestCart(route, body, items, keys) {
        try {
            const res = await this._fetchCart(route, {
                ...body,
                sections: Array.from(this.liveSections).join(','),
            });
            
            const cartData = await res.json();

            if(!res.ok) {
                this.pub(Events.TOAST_NOTIFICATION, {
                    type: 'error',
                    msg: cartData.description,
                    title: cartData.message
                });
                throw new Error(cartData.description);
            }

            this.pub(Events.CART_UPDATE, {
                sections: cartData.sections,
                req: route,
                items,
                keys
            })

        } catch (error) {
            console.error(error);
            this.pub(Events.CART_ERROR, error);
        }
    }
})

customElements.define('cart-qty', class extends Core {
    propTypes = {
        value: Number,
        key: String,
        input: Boolean,
        'prevent-default': Boolean
    }

    render() {
        this.$({
            [this.evt]: this._handleEvent
        })
    }

    _handleEvent(e) {
        this.prop('prevent-default') && e.preventDefault();
        this.pub(Events.CART_CHANGE, {
            key: this.prop('key'),
            quantity: this._getValue(e)
        })
    }

    _getValue(e) {
        return this.evt === 'change' 
            ? e.target.value 
            : this.prop('value'); 
    }

    get evt() {
        return this.prop('input') 
            ? 'change' 
            : 'click';
    }
});

customElements.define('cart-live-region', class extends Core {
    propTypes = {
        'target-section': String,
        'target-element': String
    }

    render() {
        this.targetSection = this.prop('target-section') || this.sectionId;
        this.targetSelector = this.prop('target-element') || `#${this.id}`;

        customElements.whenDefined('cart-provider').then(() => {
            this.pub(Events.CART_REGISTER, this.targetSection)
        })

        this.sub(Events.CART_UPDATE, this._updateContent, { global: true })
    }
    
    _updateContent({ sections }) {
        const targetSection = sections && sections[this.targetSection];
        if(!targetSection) {
            console.error(`target section ${targetSection} do not exists`);
            return;
        }

        const doc = Utils.parseHTML(targetSection);
        Utils.$replaceContent(this, doc.querySelector(this.targetSelector));
    }
})