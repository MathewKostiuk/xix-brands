const { Core, Events } = Global;

customElements.define('contact-form-submiter', class extends Core {
    elements = {
        $: ['contact-form', 'contact-form-targeter']
    }
    propTypes = {
        'success-message': String,
        'success-title': String
    }

    render() {
        this.$form = this.$('contact-form') || this.$('contact-form-targeter').form;
        this.$form.addEventListener('submit', this._handleSubmit.bind(this));
    }

    async _handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { url } = await this._send(formData);
        url.includes('challenge') ? e.target.submit() : this._success();
    }
    
    async _send(formData) {
        try {
            return await fetch(window.dynamicURLs['contact'], { method: 'POST', body: formData });
        } catch ({ message }) {
            console.error(message);
        }
    }
    
    _success() {
        this._publishNotification();
        this.$form.reset();
    }

    _publishNotification() {
        this.pub(Events.TOAST_NOTIFICATION, {  
            type: 'success',
            msg: this.prop('success-message') || '', 
            title: this.prop('success-title') || ''
        })
    }
})
