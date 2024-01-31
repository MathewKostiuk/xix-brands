const {Core, Events} = Global;
const CN_ACTIVE = '!active';
const CN_LOADING = '!loading';

customElements.define('sticky-add-to-cart', class extends Core {

    elements = {
        $: ['observer-trigger', 'wrapper'],
        'dropdown': 'drop-down'
    }

    render() {
        this.sub(Events.VARIANT_CHANGE, this._toggleLoading(true));
        this.sub(Events.VARIANT_UPDATE, this._toggleLoading(false));

        this._setBodyOffset();
        this._handleTrigger();
    }

    _handleTrigger() {
        const observer = new IntersectionObserver(([entry]) => { 
            const inView = !entry.isIntersecting && entry.boundingClientRect.top <= 0;
            this.active = inView;
            if(!inView) {
                this.$('dropdown').close();
            }
        });
        observer.observe(this.$('observer-trigger'));
    }

    _setBodyOffset() {
        document.body.style.setProperty('--bottom-offset', `${this.$('wrapper').offsetHeight}px`);
    }

    _toggleLoading(state) {
        return () => {
            this.classList.toggle(CN_LOADING, state);
        }
    }

    set active(state) {
        this.classList.toggle(CN_ACTIVE, state);
    }
})