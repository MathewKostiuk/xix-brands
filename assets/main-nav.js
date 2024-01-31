const { Core, Utils } = Global;
const { $active } = Utils;

customElements.define('main-nav', class extends Core {
    elements = {
        $: [['nav-item']]
    }

    render() {
        this.$('nav-item', {click: this._handleItemClick});
        this._handleOuterClick();
    }

    _handleItemClick(e) {
        if (e.target.parentNode === e.currentTarget) {
            e.preventDefault();
            this._setActiveNav(e.currentTarget);
        }
    }

    _setActiveNav(navItem) {
        if(this.activeItem) {
            $active(this.activeItem, false);
        }

        if (this.activeItem === navItem) {
            this.activeItem = null;
            return;
        };
        this.activeItem = navItem;
        $active(this.activeItem);
    }

    _handleOuterClick() {
        document.addEventListener('click', (e) => {
            if(this.activeItem && !this.contains(e.target)) {
                $active(this.activeItem, false);
                this.activeItem = null;
            }
        })
    }
});