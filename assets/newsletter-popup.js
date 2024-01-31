const { Core, Store, DOMEvents } = Global;

const STORE_KEY = 'newsletter';

customElements.define('newsletter-popup', class extends Core {  
    propTypes = {
        'display-delay': Number,
        'timeout': Number
    }

    elements = {
        'modal': 'modal-container'
    }

    render() {
        this._initPopup();
    }

    _initPopup() {
        if (!this.wasViewed || this.timeoutOver) {
            this.wasViewed = Date.now();
            this._showPopup();
        }
    }

    _showPopup() {
        setTimeout(this._openModal.bind(this), this.prop('display-delay'));
    }

    _openModal() {
        this.$('modal').dispatchEvent(DOMEvents.MODAL_OPEN);
    }

    get timeoutOver() {
        return Date.now() >= (this.wasViewed + this.prop('timeout'));
    }

    get wasViewed() {
        return Store.get(STORE_KEY);
    }
      
    set wasViewed(value) {
        Store.set(STORE_KEY, value);
    }
});