game.module("plugin.essentials").require("engine.renderer.text").body(function() {
  this.version = "1.1.0", game.isStarted || (game.createClass("Button", {
    callback: null,
    clickSound: null,
    disableAlpha: .5,
    fadeSpeed: 500,
    rotateAmount: .1,
    rotateEasing: "Quadratic.InOut",
    rotateSpeed: 1e3,
    scaleAmount: .1,
    scaleEasing: "Back.Out",
    scaleSound: null,
    scaleSpeed: 250,
    staticInit: function(t, e, i, s) {
      this.sprite = new game.Sprite(t), this.sprite.anchorCenter(), this.sprite.position.set(e, i), this.sprite.interactive = !0, this.sprite.mousedown = this._mousedown.bind(this), this.sprite.mouseup = this.sprite.mouseupoutside = this._mouseup.bind(this), this.sprite.click = this._click.bind(this), this.sprite.buttonMode = !0, this.callback = s, this.clickSound = game.Button.clickSound, this.scaleSound = game.Button.scaleSound
    },
    addTo: function(t) {
      t.addChild(this.sprite)
    },
    disable: function() {
      this.sprite.alpha = this.disableAlpha, this.sprite.interactive = !1
    },
    enable: function() {
      this.sprite.alpha = 1, this.sprite.interactive = !0
    },
    fadeIn: function(t) {
      t = t || 0, this.sprite.alpha = 0, this.sprite.visible = !0, game.Tween.add(this.sprite, {
        alpha: 1
      }, this.fadeSpeed, {
        delay: t,
        onComplete: this._fadeInComplete.bind(this)
      }).start()
    },
    fadeOut: function(t, e) {
      t = t || 0, this.sprite.alpha = 1, this.sprite.interactive = !1, game.Tween.add(this.sprite, {
        alpha: 0
      }, this.fadeSpeed, {
        delay: t,
        onComplete: this._fadeOutComplete.bind(this, e)
      }).start()
    },
    remove: function() {
      this.sprite.remove(), this.rotateTween && this.rotateTween.stop()
    },
    rotate: function(t) {
      this.sprite.rotation = -this.rotateAmount, this.rotateTween = game.Tween.add(this.sprite, {
        rotation: this.rotateAmount
      }, this.rotateSpeed, {
        repeat: 1 / 0,
        yoyo: !0,
        easing: this.rotateEasing
      }).start(), t && (this.rotateTween.currentTime = this.rotateTween.duration.random())
    },
    scaleIn: function(t) {
      this.sprite.interactive = !1, t = t || 0, this.sprite.scale.set(0), game.Tween.add(this.sprite.scale, {
        x: 1,
        y: 1
      }, this.scaleSpeed, {
        easing: this.scaleEasing,
        delay: t,
        onStart: this._onScaleInStart.bind(this),
        onComplete: this._scaleInEnd.bind(this)
      }).start()
    },
    _click: function() {
      this.sprite.alpha < 1 || (this.clickSound && game.audio.playSound(this.clickSound), "function" == typeof this.callback && this.callback())
    },
    _fadeOutComplete: function(t) {
      t && (this.sprite.visible = !1)
    },
    _fadeInComplete: function() {
      this.sprite.interactive = !0
    },
    _mousedown: function() {
      this.sprite.alpha < 1 || this.sprite.scale.set(1 - this.scaleAmount)
    },
    _mouseup: function() {
      this.sprite.scale.set(1)
    },
    _onScaleInStart: function() {
      this.scaleSound && game.audio.playSound(this.scaleSound)
    },
    _scaleInEnd: function() {
      this.sprite.interactive = !0
    }
  }), game.addAttributes("Button", {
    clickSound: null,
    scaleSound: null
  }), game.createClass("Fader", {
    color: "#000",
    delay: 0,
    speed: 500,
    sprite: null,
    target: null,
    staticInit: function(t) {
      game.merge(this, t), this.sprite = new game.Graphics, this.sprite.drawRect(0, 0, game.width, game.height)
    },
    fadeIn: function(t) {
      this.sprite.shapes[0].fillColor = this.color, this.sprite.addTo(this.target || game.scene.stage), this.sprite.alpha = 1, game.Tween.add(this.sprite, {
        alpha: 0
      }, this.speed, {
        delay: this.delay,
        onComplete: this._fadeInComplete.bind(this, t)
      }).start()
    },
    fadeOut: function(t) {
      this.sprite.shapes[0].fillColor = this.color, this.sprite.addTo(this.target || game.scene.stage), this.sprite.alpha = 0, game.Tween.add(this.sprite, {
        alpha: 1
      }, this.speed, {
        delay: this.delay,
        onComplete: this._fadeOutComplete.bind(this, t)
      }).start()
    },
    _fadeInComplete: function(t) {
      this.sprite.remove(), "function" == typeof t && t()
    },
    _fadeOutComplete: function(t) {
      "function" == typeof t && t()
    }
  }), game.createClass("IconButton", "Button", {
    staticInit: function(t, e, i, s, a) {
      this.super(t, i, s, a), this.icon = new game.Sprite(e), this.icon.anchorCenter(), this.icon.center(this.sprite), this.icon.addTo(this.sprite)
    },
    setIcon: function(t) {
      this.icon.setTexture(t), this.icon.center(this.sprite)
    }
  }), game.createClass("TextButton", "Button", {
    staticInit: function(t, e, i, s, a, n) {
      this.super(t, i, s, a), this.text = new game.Text(e, n), this.text.anchorCenter(), this.text.center(this.sprite), this.text.addTo(this.sprite)
    }
  }), game.createClass("CircleText", "Text", {
    radius: 100,
    speed: 1,
    _count: 0,
    update: function() {
      this._count += this.speed * game.delta;
      for(var t = 2 * Math.PI / this.children.length, e = 0, i = 0; i < this.children.length; i++) {
        var s = this.children[i];
        s.x = this.radius * Math.cos(e + this._count), s.y = this.radius * Math.sin(e + this._count), e += t
      }
    }
  }), game.createClass("WaveText", "Text", {
    advance: 3,
    amount: 10,
    speed: 10,
    _count: 0,
    _pos: [],
    _generateText: function(t) {
      this.super(t), this._pos.length = 0;
      for(var e = 0; e < this.children.length; e++) {
        var i = this.children[e];
        this._pos.push(i.y)
      }
    },
    update: function() {
      this._count += 50 * game.delta;
      for(var t = 0; t < this.children.length; t++) {
        var e = this.children[t],
          i = (this._count + t * this.advance) / this.speed;
        e.y = this._pos[t] + Math.sin(i) * this.amount
      }
    }
  }))
});