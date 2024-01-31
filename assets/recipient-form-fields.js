const { Core, Events } = Global;

customElements.define('recipient-form-fields', class extends Core {
   elements = {
        $: [['field-ref'], 'fields-trigger']
   }

   render() {
      this.$('fields-trigger', { change: this._handleTriggerChange });
   }

   _handleTriggerChange({ target }) {
      this._toggleFieldsDisable(!target.checked);
   }

   _toggleFieldsDisable(state) {
      this.$('field-ref').map(field => field.disabled = state);
   }
});