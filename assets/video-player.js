const { Core, onPlyrLoad } = Global;

customElements.define('video-player', class extends Core {
    elements = {
        $: ['player'],
        HTML5Player: 'video'
    }

    propTypes = {
        'loop': Boolean
    }
    
    render() {
        onPlyrLoad(this._initPlayer.bind(this));
    }

    _initPlayer() {
        this.player = new Plyr(this.$player, {
            ratio: '16:9',
        });
        this.player.loop = this.prop('loop');
    }

    play() {
        this.player?.play();
    }

    pause() {
        this.player?.pause();
    }

    get $player() {
        return this.$('player') || this.$('HTML5Player')
    }
})