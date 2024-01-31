const { Core, Utils } = Global;
const { $state } = Utils;

const ATTR_DROP_OPTION = 'data-dropdown-option';

customElements.define('drop-down', class extends Core {
    propTypes = {
        'close-on-change': Boolean,
        'update-value': Boolean
    }

    elements = {
        $: ['selected-value', 'select', 'details']
    }

    render() {
        // need this abomination for document event clean up
        this._handleDocClick = this._handleDocClick.bind(this);
        document.addEventListener('click', this._handleDocClick);

        this.$({
            change: this._handleChange
        })

        this.$('select', {
            change: this._handleSelectChange
        })
    }

    destroy() {
        document.removeEventListener('click', this._handleDocClick);
    }

    _handleChange(e) {
        const target = e.target;
        if(target.hasAttribute(ATTR_DROP_OPTION)) {
            e.stopPropagation();
            this._updateSelect(target.value);

            if(this.prop('close-on-change')) {
                this.close();
            }
        }
    }

    _handleDocClick(e) {
        if(this.contains(e.target)) {
            return;
        } 
        this.close();
    }

    _updateSelect(value) {
        if(this.$('select')) {
            this.$('select').value = value;
            this.$('select').dispatchEvent(new Event('change', {
                bubbles: true
            }));
        }
    }

    _handleSelectChange(e) {
        if(this.prop('update-value') && this.$('selected-value')) {
            this.$('selected-value').innerText = e.target.options[e.target.selectedIndex].text;
        }
    }

    close() {
        this.open = false;
    }

    set open(state) {
        this.$('details').open = state;
    }
});