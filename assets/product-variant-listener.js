const { Core, Events } = Global;
const { $isEmpty, $replaceContent } = Global.Utils;

customElements.define('product-variant-listener', class extends Core {
    propTypes = {
        emptyable: Boolean,
        'variant-selector': Boolean
    }

    render() {
        // TEMP: emptyable -> bad naming
        if(this.prop('emptyable')) {
            this.$meta = this.closest('[data-meta-block]');
            this._setMetaVisibility();
        }

        this.sub(Events.VARIANT_UPDATE, this._onVariantUpdate);
    }
    
    _onVariantUpdate({ targets }) {
        $replaceContent(this, targets[this.id])

        if(this.prop('emptyable')) {
            this._setMetaVisibility();
        }

        this.dispatchEvent(new CustomEvent('update', {
            bubbles: true
        }))
    }

    _setMetaVisibility() {
        this.$meta.toggleAttribute('hidden', $isEmpty(this));
    }
})


customElements.define('product-variant-selector', class extends Core {
    
    render() {
        this.$({'change': this._onVariantChange});
    }
    
    _onVariantChange(e) {
        this.pub(Events.VARIANT_CHANGE, {
            variantId: e.target.dataset.variantId,
            variantImagePosition: e.target.dataset.variantImagePosition
        });
    }
})