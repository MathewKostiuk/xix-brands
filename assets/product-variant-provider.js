const { Core, Events, Cache } = Global;
const { $fetch, $loading } = Global.Utils;

const CACHE_KEY = 'variant-provider';

// TODO: Make it as global util -> nodeListToMap
function elementsToMap(elements) {
    return elements.reduce((acc, element) => {
        if(element.id) {
            acc[element.id] = element.cloneNode(true);
        }
        return acc;
    }, {});
}

customElements.define('product-variant-provider', class extends Core {
    propTypes = {
        'product-page': Boolean,
        'product-url': String,
        'initial-variant-id': String,
        'initial-image-position': Number,
        'initial-selling-plan': String
    }
    
    elements = {
        $: ['id-input', 'product-meta'],
        listeners: ['product-variant-listener']
    }

    render() {
        this.sub(Events.VARIANT_CHANGE, this._onVariantChange);
        this.sub(Events.SELLING_PLAN_CHANGE, this._onSellingPlanChange)

        this._handleNoscript();
        this._initDefaultVariant();
    }
    
    _handleNoscript() {
        if (this.$('id-input')) this.$('id-input').disabled = false;
    }

    async _initDefaultVariant() {
        this.variantId = this.prop('initial-variant-id');
        this.variantImagePosition = this.prop('initial-image-position');
        this.sellingPlanId = this.prop('initial-selling-plan');
        this._initCache();
    }
    
    _setCurrentVariant({ variantId, variantImagePosition }) {
        this.variantImagePosition = variantImagePosition;
        this.variantId = variantId;
        this.$('id-input').value = variantId;
    }
    
    _onVariantChange(variantData) {
        this._setCurrentVariant(variantData);
        this._handleUpdate();
    }

    async _handleUpdate() {
        await this._updateCache();
        this._updateProps();
        this._publishUpdates();
        this.prop('product-page') && this._updateHistory();
    }

    _updateProps() {
        this.setProp('initial-variant-id', this.variantId);
        this.setProp('initial-image-position', this.variantImagePosition);
        this.setProp('initial-selling-plan', this.sellingPlanId);
    }

    _publishUpdates() {
        this.pub(Events.VARIANT_UPDATE, {
            imageIndex: this.variantImagePosition - 1,
            targets: Cache.get(this._cacheKey()),
            imagePosition: this.variantImagePosition
        })
    }

    _initCache() {
        if(!Cache.get(this._cacheKey())) {
            Cache.set(
                this._cacheKey(), 
                elementsToMap(this.$('listeners'))
            );
            return;
        }

        // if we have cache on initilization it's mean this cache was initited by someone before
        // refresh contents on the next tick
        setTimeout(() => {
            this._publishUpdates();
        }, 20)
    }

    _cacheKey(variantId, sellingPlanId) {
        return`${CACHE_KEY}-${this.sectionId}-${variantId || this.variantId}-${sellingPlanId || this.sellingPlanId}`; 
    }

    async _updateCache(variantId, reset) {
        if (!reset && Cache.get(this._cacheKey(variantId))) return;
        const $listeners = await this._fetchListeners(variantId);

        Cache.set(this._cacheKey(variantId), elementsToMap($listeners));
    }

    async _fetchListeners(variantId) {
        return await $fetch(this.prop('product-url'), {
            before: this._loading(true),
            after: this._loading(false),
            params: {
                variant: variantId || this.variantId,
                selling_plan: this.sellingPlanId,
                section_id: this.sectionId
            },
            // TODO: make a better array selection
            selectAll: this.elements['listeners'].at(0)
        })
    }

    _loading(state) {
        return () => {
            $loading(this.$('product-meta'), state);
        }
    }

    _updateHistory() {
        // TODO: refactor to Utils
        window.history.replaceState({}, null, `${window.location.pathname}?${this.historyURLParams.toString()}`);
    }

    _onSellingPlanChange({ sellingPlanId }) {
        this.sellingPlanId = sellingPlanId;
        this._handleUpdate();
    }

    get historyURLParams() {
        const params = new URLSearchParams({ 
            'variant': this.variantId
        });
        this.sellingPlanId ? params.set('selling_plan', this.sellingPlanId) : params.delete('selling_plan');
        return new URLSearchParams(params);
    }
});