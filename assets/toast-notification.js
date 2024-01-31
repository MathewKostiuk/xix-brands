const { Core, Events, Utils } = Global;
const { $active } = Utils;

const AUTOCLOSE_TIMEOUT = 5000;
const ANIMATION_DURATION = 300;

customElements.define('toast-notification', class extends Core {
    elements = {
        $: ['msg', 'title', 'close']
    }

    render() {
        this.sub(Events.TOAST_NOTIFICATION, this._handleNotification, { global: true });
        this.$('close', {
            click: this._handleClose
        });
    }

    _handleNotification({ type, msg, title }) {
        if(!msg && !title) {
            return;
        }

        let pending = false;
        if(this.active) {
            pending = true;
            this.active = false;
        }

        // move it to the next animation cycle
        setTimeout(() => {
            if(type) {
                this.type = type;
            }

            if(msg) {
                this.msg = msg;
            }

            if(title) {
                this.title = title;
            }
            this._show();
        }, pending ? ANIMATION_DURATION : 0);
    }

    _handleClose() {
        if(this.active) {
            this.active = false;
        }
    }

    _show() {
        this.active = true;
        this.activeTimeout = setTimeout(() => {
            this.active = false;
            this.activeTimeout = null;
        }, AUTOCLOSE_TIMEOUT);
    }

    set type(value) {
        this.dataset.type = value;
    }

    set msg(value) {
        this.$('msg').innerText = value;
    }

    set title(value) {
        this.$('title').innerText = value;
    }

    set active(state) {
        this._active = state;
        $active(this, state);
        if(!state) {
            clearInterval(this.activeTimeout);
            this._reset();
        }
    }

    get active() {
        return this._active;
    }

    _reset() {
        setTimeout(() => {
            this.title = '';
            this.msg = '';
            this.type = '';
        }, ANIMATION_DURATION);
    }
});