const { Core, Events } = Global;
const EVENT_SRC = 'sort';

customElements.define('collection-sort', class extends Core {
    propTypes = {
        'form-id': String
    }

    render() {
        this.$({ change: this._changeHanler})
    }

    _changeHanler() {
        this.pub(Events.COLLECTION_CHANGE, { 
            src: EVENT_SRC, 
            formId: this.prop('form-id') 
        });
    }
})