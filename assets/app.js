/**
* bootstrap.js v3.0.0 by @fat and @mdo
* Copyright 2013 Twitter Inc.
* http://www.apache.org/licenses/LICENSE-2.0
*/
if (!jQuery) { throw new Error("Bootstrap requires jQuery") }

/* ========================================================================
 * Bootstrap: transition.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd otransitionend'
    , 'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el    = this
    $(this).one('webkitTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger('webkitTransitionEnd') }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#alerts
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent.trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one($.support.transition.end, removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(window.jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#buttons
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, Button.DEFAULTS, options)
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d);
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input').prop('checked', !this.$element.hasClass('active'))
      if ($input.prop('type') === 'radio') $parent.find('.active').removeClass('active')
    }

    this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#carousel
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000
  , pause: 'hover'
  }

  Carousel.prototype.cycle =  function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition.end) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    this.sliding = true

    isCycling && this.pause()

    $next = $next.length ? $next : this.$element.find('.item')[fallback]()

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })

    if ($next.hasClass('active')) return

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
        .emulateTransitionEnd(600)
    } else {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#collapse
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives   = this.$parent && this.$parent.find('> .accordion-group > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent=' + parent + ']').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#dropdowns
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle=dropdown]'
  var Dropdown = function (element) {
    var $el = $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement) {
        // if mobile we we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      $parent.trigger(e = $.Event('show.bs.dropdown'))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown')
    }

    $this.focus()

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var $items = $('[role=menu] li:not(.divider):visible a', $parent)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index=0

    $items.eq(index).focus()
  }

  function clearMenus() {
    $(backdrop).remove()
    $(toggle).each(function (e) {
      var $parent = getParent($(this))
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown'))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('dropdown')

      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

}(window.jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#modals
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element).on('click.dismiss.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) this.$element.find('.modal-body').load(this.options.remote)
  }

  Modal.DEFAULTS = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  Modal.prototype.toggle = function () {
    return this[!this.isShown ? 'show' : 'hide']()
  }

  Modal.prototype.show = function () {
    var that = this
    var e    = $.Event('show.bs.modal')

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element.show()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      transition ?
        that.$element
          .one($.support.transition.end, function () {
            that.$element.focus().trigger('shown.bs.modal')
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger('shown.bs.modal')
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that    = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade')?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  var $body = $(document.body)
    .on('shown.bs.modal',  '.modal', function () { $body.addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $body.removeClass('modal-open') })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#affix
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'

        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay
      , hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var defaults = this.getDefaults()
    var options  = {}

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](options).data('bs.' + this.type)

    clearTimeout(self.timeout)

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.hoverState = 'in'
    self.timeout    = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this._options).data('bs.' + this.type)

    clearTimeout(self.timeout)

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.hoverState = 'out'
    self.timeout    = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.'+ this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var tp = placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
               placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
               placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
            /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

      this.applyPlacement(tp, placement)
      this.$element.trigger('shown.bs.' + this.type)
    }
  }

  Tooltip.prototype.applyPlacement = function(offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    offset.top  = offset.top  + parseInt($tip.css('margin-top'), 10)
    offset.left = offset.left + parseInt($tip.css('margin-left'), 10)

    $tip
      .offset(offset)
      .addClass('in')

    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top  = offset.top + height - actualHeight
    }

    if (placement == 'bottom' || placement == 'top') {
      var delta = 0

      if (offset.left < 0){
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, $tip.detach)
        .emulateTransitionEnd(150) :
      $tip.detach()

    this.$element.trigger('hidden.bs.' + this.type)

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth
    , height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow =function(){
    return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this._options).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(window.jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#popovers
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.DEFAULTS = $.extend({} , $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

    $tip.removeClass('fade top bottom left right in')

    $tip.find('.popover-title:empty').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }

  Popover.prototype.destroy = function () {
    this.hide().$element.off('.' + this.type).removeData(this.type)
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(window.jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#scrollspy
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var href
    var process  = $.proxy(this.process, this)

    this.$element       = $(element).is('body') ? $(window) : $(element)
    this.$body          = $('body')
    this.$scrollElement = this.$element.on('scroll.bs.scroll-spy.data-api', process)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.offsets        = $([])
    this.targets        = $([])
    this.activeTarget   = null

    this.refresh()
    this.process()
  }

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = this.$element[0] == window ? 'offset' : 'position'

    this.offsets = $([])
    this.targets = $([])

    var self     = this
    var $targets = this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#\w/.test(href) && $(href)

        return ($href
          && $href.length
          && [[ $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
    var maxScroll    = scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets.last()[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate( targets[i] )
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parents('.active')
      .removeClass('active')

    var selector = this.selector
      + '[data-target="' + target + '"],'
      + this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length)  {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#tabs
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab'
      , relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#affix
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    this.$window = $(window)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element = $(element)
    this.affixed  =
    this.unpin    = null

    this.checkPosition()
  }

  Affix.RESET = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$window.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top()
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom()

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin) this.$element.css('top', '')

    this.affixed = affix
    this.unpin   = affix == 'bottom' ? position.top - scrollTop : null

    this.$element.removeClass(Affix.RESET).addClass('affix' + (affix ? '-' + affix : ''))

    if (affix == 'bottom') {
      this.$element.offset({ top: document.body.offsetHeight - offsetBottom - this.$element.height() })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      $spy.affix(data)
    })
  })

}(window.jQuery);

var Path = {
    'version': "0.8.4",
    'map': function (path) {
        if (Path.routes.defined.hasOwnProperty(path)) {
            return Path.routes.defined[path];
        } else {
            return new Path.core.route(path);
        }
    },
    'root': function (path) {
        Path.routes.root = path;
    },
    'rescue': function (fn) {
        Path.routes.rescue = fn;
    },
    'history': {
        'initial':{}, // Empty container for "Initial Popstate" checking variables.
        'pushState': function(state, title, path){
            if(Path.history.supported){
                if(Path.dispatch(path)){
                    history.pushState(state, title, path);
                }
            } else {
                if(Path.history.fallback){
                    window.location.hash = "#" + path;
                }
            }
        },
        'popState': function(event){
            var initialPop = !Path.history.initial.popped && location.href == Path.history.initial.URL;
            Path.history.initial.popped = true;
            if(initialPop) return;
            Path.dispatch(document.location.pathname);
        },
        'listen': function(fallback){
            Path.history.supported = !!(window.history && window.history.pushState);
            Path.history.fallback  = fallback;

            if(Path.history.supported){
                Path.history.initial.popped = ('state' in window.history), Path.history.initial.URL = location.href;
                window.onpopstate = Path.history.popState;
            } else {
                if(Path.history.fallback){
                    for(route in Path.routes.defined){
                        if(route.charAt(0) != "#"){
                          Path.routes.defined["#"+route] = Path.routes.defined[route];
                          Path.routes.defined["#"+route].path = "#"+route;
                        }
                    }
                    Path.listen();
                }
            }
        }
    },
    'match': function (path, parameterize) {
        var params = {}, route = null, possible_routes, slice, i, j, compare;
        for (route in Path.routes.defined) {
            if (route !== null && route !== undefined) {
                route = Path.routes.defined[route];
                possible_routes = route.partition();
                for (j = 0; j < possible_routes.length; j++) {
                    slice = possible_routes[j];
                    compare = path;
                    if (slice.search(/:/) > 0) {
                        for (i = 0; i < slice.split("/").length; i++) {
                            if ((i < compare.split("/").length) && (slice.split("/")[i].charAt(0) === ":")) {
                                params[slice.split('/')[i].replace(/:/, '')] = compare.split("/")[i];
                                compare = compare.replace(compare.split("/")[i], slice.split("/")[i]);
                            }
                        }
                    }
                    if (slice === compare) {
                        if (parameterize) {
                            route.params = params;
                        }
                        return route;
                    }
                }
            }
        }
        return null;
    },
    'dispatch': function (passed_route) {
        var previous_route, matched_route;
        if (Path.routes.current !== passed_route) {
            Path.routes.previous = Path.routes.current;
            Path.routes.current = passed_route;
            matched_route = Path.match(passed_route, true);

            if (Path.routes.previous) {
                previous_route = Path.match(Path.routes.previous);
                if (previous_route !== null && previous_route.do_exit !== null) {
                    previous_route.do_exit();
                }
            }

            if (matched_route !== null) {
                matched_route.run();
                return true;
            } else {
                if (Path.routes.rescue !== null) {
                    Path.routes.rescue();
                }
            }
        }
    },
    'listen': function () {
        var fn = function(){ Path.dispatch(location.hash); }

        if (location.hash === "") {
            if (Path.routes.root !== null) {
                location.hash = Path.routes.root;
            }
        }

        // The 'document.documentMode' checks below ensure that PathJS fires the right events
        // even in IE "Quirks Mode".
        if ("onhashchange" in window && (!document.documentMode || document.documentMode >= 8)) {
            window.onhashchange = fn;
        } else {
            setInterval(fn, 50);
        }

        if(location.hash !== "") {
            Path.dispatch(location.hash);
        }
    },
    'core': {
        'route': function (path) {
            this.path = path;
            this.action = null;
            this.do_enter = [];
            this.do_exit = null;
            this.params = {};
            Path.routes.defined[path] = this;
        }
    },
    'routes': {
        'current': null,
        'root': null,
        'rescue': null,
        'previous': null,
        'defined': {}
    }
};
Path.core.route.prototype = {
    'to': function (fn) {
        this.action = fn;
        return this;
    },
    'enter': function (fns) {
        if (fns instanceof Array) {
            this.do_enter = this.do_enter.concat(fns);
        } else {
            this.do_enter.push(fns);
        }
        return this;
    },
    'exit': function (fn) {
        this.do_exit = fn;
        return this;
    },
    'partition': function () {
        var parts = [], options = [], re = /\(([^}]+?)\)/g, text, i;
        while (text = re.exec(this.path)) {
            parts.push(text[1]);
        }
        options.push(this.path.split("(")[0]);
        for (i = 0; i < parts.length; i++) {
            options.push(options[options.length - 1] + parts[i]);
        }
        return options;
    },
    'run': function () {
        var halt_execution = false, i, result, previous;

        if (Path.routes.defined[this.path].hasOwnProperty("do_enter")) {
            if (Path.routes.defined[this.path].do_enter.length > 0) {
                for (i = 0; i < Path.routes.defined[this.path].do_enter.length; i++) {
                    result = Path.routes.defined[this.path].do_enter[i].apply(this, null);
                    if (result === false) {
                        halt_execution = true;
                        break;
                    }
                }
            }
        }
        if (!halt_execution) {
            Path.routes.defined[this.path].action();
        }
    }
};
/**
 * SyntaxHighlighter
 * http://alexgorbatchev.com/SyntaxHighlighter
 *
 * SyntaxHighlighter is donationware. If you are using it, please donate.
 * http://alexgorbatchev.com/SyntaxHighlighter/donate.html
 *
 * @version
 * 3.0.83 (July 02 2010)
 * 
 * @copyright
 * Copyright (C) 2004-2010 Alex Gorbatchev.
 *
 * @license
 * Dual licensed under the MIT and GPL licenses.
 */
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('K M;I(M)1S 2U("2a\'t 4k M 4K 2g 3l 4G 4H");(6(){6 r(f,e){I(!M.1R(f))1S 3m("3s 15 4R");K a=f.1w;f=M(f.1m,t(f)+(e||""));I(a)f.1w={1m:a.1m,19:a.19?a.19.1a(0):N};H f}6 t(f){H(f.1J?"g":"")+(f.4s?"i":"")+(f.4p?"m":"")+(f.4v?"x":"")+(f.3n?"y":"")}6 B(f,e,a,b){K c=u.L,d,h,g;v=R;5K{O(;c--;){g=u[c];I(a&g.3r&&(!g.2p||g.2p.W(b))){g.2q.12=e;I((h=g.2q.X(f))&&h.P===e){d={3k:g.2b.W(b,h,a),1C:h};1N}}}}5v(i){1S i}5q{v=11}H d}6 p(f,e,a){I(3b.Z.1i)H f.1i(e,a);O(a=a||0;a<f.L;a++)I(f[a]===e)H a;H-1}M=6(f,e){K a=[],b=M.1B,c=0,d,h;I(M.1R(f)){I(e!==1d)1S 3m("2a\'t 5r 5I 5F 5B 5C 15 5E 5p");H r(f)}I(v)1S 2U("2a\'t W 3l M 59 5m 5g 5x 5i");e=e||"";O(d={2N:11,19:[],2K:6(g){H e.1i(g)>-1},3d:6(g){e+=g}};c<f.L;)I(h=B(f,c,b,d)){a.U(h.3k);c+=h.1C[0].L||1}Y I(h=n.X.W(z[b],f.1a(c))){a.U(h[0]);c+=h[0].L}Y{h=f.3a(c);I(h==="[")b=M.2I;Y I(h==="]")b=M.1B;a.U(h);c++}a=15(a.1K(""),n.Q.W(e,w,""));a.1w={1m:f,19:d.2N?d.19:N};H a};M.3v="1.5.0";M.2I=1;M.1B=2;K C=/\\$(?:(\\d\\d?|[$&`\'])|{([$\\w]+)})/g,w=/[^5h]+|([\\s\\S])(?=[\\s\\S]*\\1)/g,A=/^(?:[?*+]|{\\d+(?:,\\d*)?})\\??/,v=11,u=[],n={X:15.Z.X,1A:15.Z.1A,1C:1r.Z.1C,Q:1r.Z.Q,1e:1r.Z.1e},x=n.X.W(/()??/,"")[1]===1d,D=6(){K f=/^/g;n.1A.W(f,"");H!f.12}(),y=6(){K f=/x/g;n.Q.W("x",f,"");H!f.12}(),E=15.Z.3n!==1d,z={};z[M.2I]=/^(?:\\\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\\29-26-f]{2}|u[\\29-26-f]{4}|c[A-3o-z]|[\\s\\S]))/;z[M.1B]=/^(?:\\\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\\d*|x[\\29-26-f]{2}|u[\\29-26-f]{4}|c[A-3o-z]|[\\s\\S])|\\(\\?[:=!]|[?*+]\\?|{\\d+(?:,\\d*)?}\\??)/;M.1h=6(f,e,a,b){u.U({2q:r(f,"g"+(E?"y":"")),2b:e,3r:a||M.1B,2p:b||N})};M.2n=6(f,e){K a=f+"/"+(e||"");H M.2n[a]||(M.2n[a]=M(f,e))};M.3c=6(f){H r(f,"g")};M.5l=6(f){H f.Q(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g,"\\\\$&")};M.5e=6(f,e,a,b){e=r(e,"g"+(b&&E?"y":""));e.12=a=a||0;f=e.X(f);H b?f&&f.P===a?f:N:f};M.3q=6(){M.1h=6(){1S 2U("2a\'t 55 1h 54 3q")}};M.1R=6(f){H 53.Z.1q.W(f)==="[2m 15]"};M.3p=6(f,e,a,b){O(K c=r(e,"g"),d=-1,h;h=c.X(f);){a.W(b,h,++d,f,c);c.12===h.P&&c.12++}I(e.1J)e.12=0};M.57=6(f,e){H 6 a(b,c){K d=e[c].1I?e[c]:{1I:e[c]},h=r(d.1I,"g"),g=[],i;O(i=0;i<b.L;i++)M.3p(b[i],h,6(k){g.U(d.3j?k[d.3j]||"":k[0])});H c===e.L-1||!g.L?g:a(g,c+1)}([f],0)};15.Z.1p=6(f,e){H J.X(e[0])};15.Z.W=6(f,e){H J.X(e)};15.Z.X=6(f){K e=n.X.1p(J,14),a;I(e){I(!x&&e.L>1&&p(e,"")>-1){a=15(J.1m,n.Q.W(t(J),"g",""));n.Q.W(f.1a(e.P),a,6(){O(K c=1;c<14.L-2;c++)I(14[c]===1d)e[c]=1d})}I(J.1w&&J.1w.19)O(K b=1;b<e.L;b++)I(a=J.1w.19[b-1])e[a]=e[b];!D&&J.1J&&!e[0].L&&J.12>e.P&&J.12--}H e};I(!D)15.Z.1A=6(f){(f=n.X.W(J,f))&&J.1J&&!f[0].L&&J.12>f.P&&J.12--;H!!f};1r.Z.1C=6(f){M.1R(f)||(f=15(f));I(f.1J){K e=n.1C.1p(J,14);f.12=0;H e}H f.X(J)};1r.Z.Q=6(f,e){K a=M.1R(f),b,c;I(a&&1j e.58()==="3f"&&e.1i("${")===-1&&y)H n.Q.1p(J,14);I(a){I(f.1w)b=f.1w.19}Y f+="";I(1j e==="6")c=n.Q.W(J,f,6(){I(b){14[0]=1f 1r(14[0]);O(K d=0;d<b.L;d++)I(b[d])14[0][b[d]]=14[d+1]}I(a&&f.1J)f.12=14[14.L-2]+14[0].L;H e.1p(N,14)});Y{c=J+"";c=n.Q.W(c,f,6(){K d=14;H n.Q.W(e,C,6(h,g,i){I(g)5b(g){24"$":H"$";24"&":H d[0];24"`":H d[d.L-1].1a(0,d[d.L-2]);24"\'":H d[d.L-1].1a(d[d.L-2]+d[0].L);5a:i="";g=+g;I(!g)H h;O(;g>d.L-3;){i=1r.Z.1a.W(g,-1)+i;g=1Q.3i(g/10)}H(g?d[g]||"":"$")+i}Y{g=+i;I(g<=d.L-3)H d[g];g=b?p(b,i):-1;H g>-1?d[g+1]:h}})})}I(a&&f.1J)f.12=0;H c};1r.Z.1e=6(f,e){I(!M.1R(f))H n.1e.1p(J,14);K a=J+"",b=[],c=0,d,h;I(e===1d||+e<0)e=5D;Y{e=1Q.3i(+e);I(!e)H[]}O(f=M.3c(f);d=f.X(a);){I(f.12>c){b.U(a.1a(c,d.P));d.L>1&&d.P<a.L&&3b.Z.U.1p(b,d.1a(1));h=d[0].L;c=f.12;I(b.L>=e)1N}f.12===d.P&&f.12++}I(c===a.L){I(!n.1A.W(f,"")||h)b.U("")}Y b.U(a.1a(c));H b.L>e?b.1a(0,e):b};M.1h(/\\(\\?#[^)]*\\)/,6(f){H n.1A.W(A,f.2S.1a(f.P+f[0].L))?"":"(?:)"});M.1h(/\\((?!\\?)/,6(){J.19.U(N);H"("});M.1h(/\\(\\?<([$\\w]+)>/,6(f){J.19.U(f[1]);J.2N=R;H"("});M.1h(/\\\\k<([\\w$]+)>/,6(f){K e=p(J.19,f[1]);H e>-1?"\\\\"+(e+1)+(3R(f.2S.3a(f.P+f[0].L))?"":"(?:)"):f[0]});M.1h(/\\[\\^?]/,6(f){H f[0]==="[]"?"\\\\b\\\\B":"[\\\\s\\\\S]"});M.1h(/^\\(\\?([5A]+)\\)/,6(f){J.3d(f[1]);H""});M.1h(/(?:\\s+|#.*)+/,6(f){H n.1A.W(A,f.2S.1a(f.P+f[0].L))?"":"(?:)"},M.1B,6(){H J.2K("x")});M.1h(/\\./,6(){H"[\\\\s\\\\S]"},M.1B,6(){H J.2K("s")})})();1j 2e!="1d"&&(2e.M=M);K 1v=6(){6 r(a,b){a.1l.1i(b)!=-1||(a.1l+=" "+b)}6 t(a){H a.1i("3e")==0?a:"3e"+a}6 B(a){H e.1Y.2A[t(a)]}6 p(a,b,c){I(a==N)H N;K d=c!=R?a.3G:[a.2G],h={"#":"1c",".":"1l"}[b.1o(0,1)]||"3h",g,i;g=h!="3h"?b.1o(1):b.5u();I((a[h]||"").1i(g)!=-1)H a;O(a=0;d&&a<d.L&&i==N;a++)i=p(d[a],b,c);H i}6 C(a,b){K c={},d;O(d 2g a)c[d]=a[d];O(d 2g b)c[d]=b[d];H c}6 w(a,b,c,d){6 h(g){g=g||1P.5y;I(!g.1F){g.1F=g.52;g.3N=6(){J.5w=11}}c.W(d||1P,g)}a.3g?a.3g("4U"+b,h):a.4y(b,h,11)}6 A(a,b){K c=e.1Y.2j,d=N;I(c==N){c={};O(K h 2g e.1U){K g=e.1U[h];d=g.4x;I(d!=N){g.1V=h.4w();O(g=0;g<d.L;g++)c[d[g]]=h}}e.1Y.2j=c}d=e.1U[c[a]];d==N&&b!=11&&1P.1X(e.13.1x.1X+(e.13.1x.3E+a));H d}6 v(a,b){O(K c=a.1e("\\n"),d=0;d<c.L;d++)c[d]=b(c[d],d);H c.1K("\\n")}6 u(a,b){I(a==N||a.L==0||a=="\\n")H a;a=a.Q(/</g,"&1y;");a=a.Q(/ {2,}/g,6(c){O(K d="",h=0;h<c.L-1;h++)d+=e.13.1W;H d+" "});I(b!=N)a=v(a,6(c){I(c.L==0)H"";K d="";c=c.Q(/^(&2s;| )+/,6(h){d=h;H""});I(c.L==0)H d;H d+\'<17 1g="\'+b+\'">\'+c+"</17>"});H a}6 n(a,b){a.1e("\\n");O(K c="",d=0;d<50;d++)c+="                    ";H a=v(a,6(h){I(h.1i("\\t")==-1)H h;O(K g=0;(g=h.1i("\\t"))!=-1;)h=h.1o(0,g)+c.1o(0,b-g%b)+h.1o(g+1,h.L);H h})}6 x(a){H a.Q(/^\\s+|\\s+$/g,"")}6 D(a,b){I(a.P<b.P)H-1;Y I(a.P>b.P)H 1;Y I(a.L<b.L)H-1;Y I(a.L>b.L)H 1;H 0}6 y(a,b){6 c(k){H k[0]}O(K d=N,h=[],g=b.2D?b.2D:c;(d=b.1I.X(a))!=N;){K i=g(d,b);I(1j i=="3f")i=[1f e.2L(i,d.P,b.23)];h=h.1O(i)}H h}6 E(a){K b=/(.*)((&1G;|&1y;).*)/;H a.Q(e.3A.3M,6(c){K d="",h=N;I(h=b.X(c)){c=h[1];d=h[2]}H\'<a 2h="\'+c+\'">\'+c+"</a>"+d})}6 z(){O(K a=1E.36("1k"),b=[],c=0;c<a.L;c++)a[c].3s=="20"&&b.U(a[c]);H b}6 f(a){a=a.1F;K b=p(a,".20",R);a=p(a,".3O",R);K c=1E.4i("3t");I(!(!a||!b||p(a,"3t"))){B(b.1c);r(b,"1m");O(K d=a.3G,h=[],g=0;g<d.L;g++)h.U(d[g].4z||d[g].4A);h=h.1K("\\r");c.39(1E.4D(h));a.39(c);c.2C();c.4C();w(c,"4u",6(){c.2G.4E(c);b.1l=b.1l.Q("1m","")})}}I(1j 3F!="1d"&&1j M=="1d")M=3F("M").M;K e={2v:{"1g-27":"","2i-1s":1,"2z-1s-2t":11,1M:N,1t:N,"42-45":R,"43-22":4,1u:R,16:R,"3V-17":R,2l:11,"41-40":R,2k:11,"1z-1k":11},13:{1W:"&2s;",2M:R,46:11,44:11,34:"4n",1x:{21:"4o 1m",2P:"?",1X:"1v\\n\\n",3E:"4r\'t 4t 1D O: ",4g:"4m 4B\'t 51 O 1z-1k 4F: ",37:\'<!4T 1z 4S "-//4V//3H 4W 1.0 4Z//4Y" "1Z://2y.3L.3K/4X/3I/3H/3I-4P.4J"><1z 4I="1Z://2y.3L.3K/4L/5L"><3J><4N 1Z-4M="5G-5M" 6K="2O/1z; 6J=6I-8" /><1t>6L 1v</1t></3J><3B 1L="25-6M:6Q,6P,6O,6N-6F;6y-2f:#6x;2f:#6w;25-22:6v;2O-3D:3C;"><T 1L="2O-3D:3C;3w-32:1.6z;"><T 1L="25-22:6A-6E;">1v</T><T 1L="25-22:.6C;3w-6B:6R;"><T>3v 3.0.76 (72 73 3x)</T><T><a 2h="1Z://3u.2w/1v" 1F="38" 1L="2f:#3y">1Z://3u.2w/1v</a></T><T>70 17 6U 71.</T><T>6T 6X-3x 6Y 6D.</T></T><T>6t 61 60 J 1k, 5Z <a 2h="6u://2y.62.2w/63-66/65?64=5X-5W&5P=5O" 1L="2f:#3y">5R</a> 5V <2R/>5U 5T 5S!</T></T></3B></1z>\'}},1Y:{2j:N,2A:{}},1U:{},3A:{6n:/\\/\\*[\\s\\S]*?\\*\\//2c,6m:/\\/\\/.*$/2c,6l:/#.*$/2c,6k:/"([^\\\\"\\n]|\\\\.)*"/g,6o:/\'([^\\\\\'\\n]|\\\\.)*\'/g,6p:1f M(\'"([^\\\\\\\\"]|\\\\\\\\.)*"\',"3z"),6s:1f M("\'([^\\\\\\\\\']|\\\\\\\\.)*\'","3z"),6q:/(&1y;|<)!--[\\s\\S]*?--(&1G;|>)/2c,3M:/\\w+:\\/\\/[\\w-.\\/?%&=:@;]*/g,6a:{18:/(&1y;|<)\\?=?/g,1b:/\\?(&1G;|>)/g},69:{18:/(&1y;|<)%=?/g,1b:/%(&1G;|>)/g},6d:{18:/(&1y;|<)\\s*1k.*?(&1G;|>)/2T,1b:/(&1y;|<)\\/\\s*1k\\s*(&1G;|>)/2T}},16:{1H:6(a){6 b(i,k){H e.16.2o(i,k,e.13.1x[k])}O(K c=\'<T 1g="16">\',d=e.16.2x,h=d.2X,g=0;g<h.L;g++)c+=(d[h[g]].1H||b)(a,h[g]);c+="</T>";H c},2o:6(a,b,c){H\'<2W><a 2h="#" 1g="6e 6h\'+b+" "+b+\'">\'+c+"</a></2W>"},2b:6(a){K b=a.1F,c=b.1l||"";b=B(p(b,".20",R).1c);K d=6(h){H(h=15(h+"6f(\\\\w+)").X(c))?h[1]:N}("6g");b&&d&&e.16.2x[d].2B(b);a.3N()},2x:{2X:["21","2P"],21:{1H:6(a){I(a.V("2l")!=R)H"";K b=a.V("1t");H e.16.2o(a,"21",b?b:e.13.1x.21)},2B:6(a){a=1E.6j(t(a.1c));a.1l=a.1l.Q("47","")}},2P:{2B:6(){K a="68=0";a+=", 18="+(31.30-33)/2+", 32="+(31.2Z-2Y)/2+", 30=33, 2Z=2Y";a=a.Q(/^,/,"");a=1P.6Z("","38",a);a.2C();K b=a.1E;b.6W(e.13.1x.37);b.6V();a.2C()}}}},35:6(a,b){K c;I(b)c=[b];Y{c=1E.36(e.13.34);O(K d=[],h=0;h<c.L;h++)d.U(c[h]);c=d}c=c;d=[];I(e.13.2M)c=c.1O(z());I(c.L===0)H d;O(h=0;h<c.L;h++){O(K g=c[h],i=a,k=c[h].1l,j=3W 0,l={},m=1f M("^\\\\[(?<2V>(.*?))\\\\]$"),s=1f M("(?<27>[\\\\w-]+)\\\\s*:\\\\s*(?<1T>[\\\\w-%#]+|\\\\[.*?\\\\]|\\".*?\\"|\'.*?\')\\\\s*;?","g");(j=s.X(k))!=N;){K o=j.1T.Q(/^[\'"]|[\'"]$/g,"");I(o!=N&&m.1A(o)){o=m.X(o);o=o.2V.L>0?o.2V.1e(/\\s*,\\s*/):[]}l[j.27]=o}g={1F:g,1n:C(i,l)};g.1n.1D!=N&&d.U(g)}H d},1M:6(a,b){K c=J.35(a,b),d=N,h=e.13;I(c.L!==0)O(K g=0;g<c.L;g++){b=c[g];K i=b.1F,k=b.1n,j=k.1D,l;I(j!=N){I(k["1z-1k"]=="R"||e.2v["1z-1k"]==R){d=1f e.4l(j);j="4O"}Y I(d=A(j))d=1f d;Y 6H;l=i.3X;I(h.2M){l=l;K m=x(l),s=11;I(m.1i("<![6G[")==0){m=m.4h(9);s=R}K o=m.L;I(m.1i("]]\\>")==o-3){m=m.4h(0,o-3);s=R}l=s?m:l}I((i.1t||"")!="")k.1t=i.1t;k.1D=j;d.2Q(k);b=d.2F(l);I((i.1c||"")!="")b.1c=i.1c;i.2G.74(b,i)}}},2E:6(a){w(1P,"4k",6(){e.1M(a)})}};e.2E=e.2E;e.1M=e.1M;e.2L=6(a,b,c){J.1T=a;J.P=b;J.L=a.L;J.23=c;J.1V=N};e.2L.Z.1q=6(){H J.1T};e.4l=6(a){6 b(j,l){O(K m=0;m<j.L;m++)j[m].P+=l}K c=A(a),d,h=1f e.1U.5Y,g=J,i="2F 1H 2Q".1e(" ");I(c!=N){d=1f c;O(K k=0;k<i.L;k++)(6(){K j=i[k];g[j]=6(){H h[j].1p(h,14)}})();d.28==N?1P.1X(e.13.1x.1X+(e.13.1x.4g+a)):h.2J.U({1I:d.28.17,2D:6(j){O(K l=j.17,m=[],s=d.2J,o=j.P+j.18.L,F=d.28,q,G=0;G<s.L;G++){q=y(l,s[G]);b(q,o);m=m.1O(q)}I(F.18!=N&&j.18!=N){q=y(j.18,F.18);b(q,j.P);m=m.1O(q)}I(F.1b!=N&&j.1b!=N){q=y(j.1b,F.1b);b(q,j.P+j[0].5Q(j.1b));m=m.1O(q)}O(j=0;j<m.L;j++)m[j].1V=c.1V;H m}})}};e.4j=6(){};e.4j.Z={V:6(a,b){K c=J.1n[a];c=c==N?b:c;K d={"R":R,"11":11}[c];H d==N?c:d},3Y:6(a){H 1E.4i(a)},4c:6(a,b){K c=[];I(a!=N)O(K d=0;d<a.L;d++)I(1j a[d]=="2m")c=c.1O(y(b,a[d]));H J.4e(c.6b(D))},4e:6(a){O(K b=0;b<a.L;b++)I(a[b]!==N)O(K c=a[b],d=c.P+c.L,h=b+1;h<a.L&&a[b]!==N;h++){K g=a[h];I(g!==N)I(g.P>d)1N;Y I(g.P==c.P&&g.L>c.L)a[b]=N;Y I(g.P>=c.P&&g.P<d)a[h]=N}H a},4d:6(a){K b=[],c=2u(J.V("2i-1s"));v(a,6(d,h){b.U(h+c)});H b},3U:6(a){K b=J.V("1M",[]);I(1j b!="2m"&&b.U==N)b=[b];a:{a=a.1q();K c=3W 0;O(c=c=1Q.6c(c||0,0);c<b.L;c++)I(b[c]==a){b=c;1N a}b=-1}H b!=-1},2r:6(a,b,c){a=["1s","6i"+b,"P"+a,"6r"+(b%2==0?1:2).1q()];J.3U(b)&&a.U("67");b==0&&a.U("1N");H\'<T 1g="\'+a.1K(" ")+\'">\'+c+"</T>"},3Q:6(a,b){K c="",d=a.1e("\\n").L,h=2u(J.V("2i-1s")),g=J.V("2z-1s-2t");I(g==R)g=(h+d-1).1q().L;Y I(3R(g)==R)g=0;O(K i=0;i<d;i++){K k=b?b[i]:h+i,j;I(k==0)j=e.13.1W;Y{j=g;O(K l=k.1q();l.L<j;)l="0"+l;j=l}a=j;c+=J.2r(i,k,a)}H c},49:6(a,b){a=x(a);K c=a.1e("\\n");J.V("2z-1s-2t");K d=2u(J.V("2i-1s"));a="";O(K h=J.V("1D"),g=0;g<c.L;g++){K i=c[g],k=/^(&2s;|\\s)+/.X(i),j=N,l=b?b[g]:d+g;I(k!=N){j=k[0].1q();i=i.1o(j.L);j=j.Q(" ",e.13.1W)}i=x(i);I(i.L==0)i=e.13.1W;a+=J.2r(g,l,(j!=N?\'<17 1g="\'+h+\' 5N">\'+j+"</17>":"")+i)}H a},4f:6(a){H a?"<4a>"+a+"</4a>":""},4b:6(a,b){6 c(l){H(l=l?l.1V||g:g)?l+" ":""}O(K d=0,h="",g=J.V("1D",""),i=0;i<b.L;i++){K k=b[i],j;I(!(k===N||k.L===0)){j=c(k);h+=u(a.1o(d,k.P-d),j+"48")+u(k.1T,j+k.23);d=k.P+k.L+(k.75||0)}}h+=u(a.1o(d),c()+"48");H h},1H:6(a){K b="",c=["20"],d;I(J.V("2k")==R)J.1n.16=J.1n.1u=11;1l="20";J.V("2l")==R&&c.U("47");I((1u=J.V("1u"))==11)c.U("6S");c.U(J.V("1g-27"));c.U(J.V("1D"));a=a.Q(/^[ ]*[\\n]+|[\\n]*[ ]*$/g,"").Q(/\\r/g," ");b=J.V("43-22");I(J.V("42-45")==R)a=n(a,b);Y{O(K h="",g=0;g<b;g++)h+=" ";a=a.Q(/\\t/g,h)}a=a;a:{b=a=a;h=/<2R\\s*\\/?>|&1y;2R\\s*\\/?&1G;/2T;I(e.13.46==R)b=b.Q(h,"\\n");I(e.13.44==R)b=b.Q(h,"");b=b.1e("\\n");h=/^\\s*/;g=4Q;O(K i=0;i<b.L&&g>0;i++){K k=b[i];I(x(k).L!=0){k=h.X(k);I(k==N){a=a;1N a}g=1Q.4q(k[0].L,g)}}I(g>0)O(i=0;i<b.L;i++)b[i]=b[i].1o(g);a=b.1K("\\n")}I(1u)d=J.4d(a);b=J.4c(J.2J,a);b=J.4b(a,b);b=J.49(b,d);I(J.V("41-40"))b=E(b);1j 2H!="1d"&&2H.3S&&2H.3S.1C(/5s/)&&c.U("5t");H b=\'<T 1c="\'+t(J.1c)+\'" 1g="\'+c.1K(" ")+\'">\'+(J.V("16")?e.16.1H(J):"")+\'<3Z 5z="0" 5H="0" 5J="0">\'+J.4f(J.V("1t"))+"<3T><3P>"+(1u?\'<2d 1g="1u">\'+J.3Q(a)+"</2d>":"")+\'<2d 1g="17"><T 1g="3O">\'+b+"</T></2d></3P></3T></3Z></T>"},2F:6(a){I(a===N)a="";J.17=a;K b=J.3Y("T");b.3X=J.1H(a);J.V("16")&&w(p(b,".16"),"5c",e.16.2b);J.V("3V-17")&&w(p(b,".17"),"56",f);H b},2Q:6(a){J.1c=""+1Q.5d(1Q.5n()*5k).1q();e.1Y.2A[t(J.1c)]=J;J.1n=C(e.2v,a||{});I(J.V("2k")==R)J.1n.16=J.1n.1u=11},5j:6(a){a=a.Q(/^\\s+|\\s+$/g,"").Q(/\\s+/g,"|");H"\\\\b(?:"+a+")\\\\b"},5f:6(a){J.28={18:{1I:a.18,23:"1k"},1b:{1I:a.1b,23:"1k"},17:1f M("(?<18>"+a.18.1m+")(?<17>.*?)(?<1b>"+a.1b.1m+")","5o")}}};H e}();1j 2e!="1d"&&(2e.1v=1v);',62,441,'||||||function|||||||||||||||||||||||||||||||||||||return|if|this|var|length|XRegExp|null|for|index|replace|true||div|push|getParam|call|exec|else|prototype||false|lastIndex|config|arguments|RegExp|toolbar|code|left|captureNames|slice|right|id|undefined|split|new|class|addToken|indexOf|typeof|script|className|source|params|substr|apply|toString|String|line|title|gutter|SyntaxHighlighter|_xregexp|strings|lt|html|test|OUTSIDE_CLASS|match|brush|document|target|gt|getHtml|regex|global|join|style|highlight|break|concat|window|Math|isRegExp|throw|value|brushes|brushName|space|alert|vars|http|syntaxhighlighter|expandSource|size|css|case|font|Fa|name|htmlScript|dA|can|handler|gm|td|exports|color|in|href|first|discoveredBrushes|light|collapse|object|cache|getButtonHtml|trigger|pattern|getLineHtml|nbsp|numbers|parseInt|defaults|com|items|www|pad|highlighters|execute|focus|func|all|getDiv|parentNode|navigator|INSIDE_CLASS|regexList|hasFlag|Match|useScriptTags|hasNamedCapture|text|help|init|br|input|gi|Error|values|span|list|250|height|width|screen|top|500|tagName|findElements|getElementsByTagName|aboutDialog|_blank|appendChild|charAt|Array|copyAsGlobal|setFlag|highlighter_|string|attachEvent|nodeName|floor|backref|output|the|TypeError|sticky|Za|iterate|freezeTokens|scope|type|textarea|alexgorbatchev|version|margin|2010|005896|gs|regexLib|body|center|align|noBrush|require|childNodes|DTD|xhtml1|head|org|w3|url|preventDefault|container|tr|getLineNumbersHtml|isNaN|userAgent|tbody|isLineHighlighted|quick|void|innerHTML|create|table|links|auto|smart|tab|stripBrs|tabs|bloggerMode|collapsed|plain|getCodeLinesHtml|caption|getMatchesHtml|findMatches|figureOutLineNumbers|removeNestedMatches|getTitleHtml|brushNotHtmlScript|substring|createElement|Highlighter|load|HtmlScript|Brush|pre|expand|multiline|min|Can|ignoreCase|find|blur|extended|toLowerCase|aliases|addEventListener|innerText|textContent|wasn|select|createTextNode|removeChild|option|same|frame|xmlns|dtd|twice|1999|equiv|meta|htmlscript|transitional|1E3|expected|PUBLIC|DOCTYPE|on|W3C|XHTML|TR|EN|Transitional||configured|srcElement|Object|after|run|dblclick|matchChain|valueOf|constructor|default|switch|click|round|execAt|forHtmlScript|token|gimy|functions|getKeywords|1E6|escape|within|random|sgi|another|finally|supply|MSIE|ie|toUpperCase|catch|returnValue|definition|event|border|imsx|constructing|one|Infinity|from|when|Content|cellpadding|flags|cellspacing|try|xhtml|Type|spaces|2930402|hosted_button_id|lastIndexOf|donate|active|development|keep|to|xclick|_s|Xml|please|like|you|paypal|cgi|cmd|webscr|bin|highlighted|scrollbars|aspScriptTags|phpScriptTags|sort|max|scriptScriptTags|toolbar_item|_|command|command_|number|getElementById|doubleQuotedString|singleLinePerlComments|singleLineCComments|multiLineCComments|singleQuotedString|multiLineDoubleQuotedString|xmlComments|alt|multiLineSingleQuotedString|If|https|1em|000|fff|background|5em|xx|bottom|75em|Gorbatchev|large|serif|CDATA|continue|utf|charset|content|About|family|sans|Helvetica|Arial|Geneva|3em|nogutter|Copyright|syntax|close|write|2004|Alex|open|JavaScript|highlighter|July|02|replaceChild|offset|83'.split('|'),0,{}))

/**
 * SyntaxHighlighter
 * http://alexgorbatchev.com/SyntaxHighlighter
 *
 * SyntaxHighlighter is donationware. If you are using it, please donate.
 * http://alexgorbatchev.com/SyntaxHighlighter/donate.html
 *
 * @version
 * 3.0.83 (July 02 2010)
 * 
 * @copyright
 * Copyright (C) 2004-2010 Alex Gorbatchev.
 *
 * @license
 * Dual licensed under the MIT and GPL licenses.
 */
;(function()
{
	// CommonJS
	typeof(require) != 'undefined' ? SyntaxHighlighter = require('shCore').SyntaxHighlighter : null;

	function Brush()
	{
		var keywords =	'break case catch continue ' +
						'default delete do else false  ' +
						'for function if in instanceof ' +
						'new null return super switch ' +
						'this throw true try typeof var while with'
						;

		var r = SyntaxHighlighter.regexLib;
		
		this.regexList = [
			{ regex: r.multiLineDoubleQuotedString,					css: 'string' },			// double quoted strings
			{ regex: r.multiLineSingleQuotedString,					css: 'string' },			// single quoted strings
			{ regex: r.singleLineCComments,							css: 'comments' },			// one line comments
			{ regex: r.multiLineCComments,							css: 'comments' },			// multiline comments
			{ regex: /\s*#.*/gm,									css: 'preprocessor' },		// preprocessor tags like #region and #endregion
			{ regex: new RegExp(this.getKeywords(keywords), 'gm'),	css: 'keyword' }			// keywords
			];
	
		this.forHtmlScript(r.scriptScriptTags);
	};

	Brush.prototype	= new SyntaxHighlighter.Highlighter();
	Brush.aliases	= ['js', 'jscript', 'javascript'];

	SyntaxHighlighter.brushes.JScript = Brush;

	// CommonJS
	typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();

/*globals Stativus DEBUG_MODE EVENTABLE COLOR_MODE EVENT_COLOR EXIT_COLOR ENTER_COLOR exports $ createNode*/

/**
  This is the code for creating statecharts in your javascript files
  
  @author: Evin Grano
*/
// #ifdef DEBUG_MODE
if (typeof DEBUG_MODE === "undefined"){
  DEBUG_MODE = true;
  COLOR_MODE = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if (COLOR_MODE) {
    EVENT_COLOR = "#CC00FF";
    ENTER_COLOR = "#009900";
    EXIT_COLOR = "#880000";
  }
}
// #endif
// Pre-processor for eventable code
// #ifdef EVENTABLE
if (typeof EVENTABLE === "undefined"){
  EVENTABLE = true;
}
// #endif

/** @preserve @license
==========================================================================
Statechart -- A Micro Library
Copyright: ©2011-2013 Evin Grano All rights reserved.
          Portions ©2011-2013 Evin Grano, and contributors

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software and the Software is used 
for Good, and not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

For more information about Statechart, visit http://www.itsgotwhatplanscrave.com

==========================================================================
*/
var creator = function(){
  function F() {}
  F.prototype = this;
  return new F();
};

// helper function for merging in properties
var merge = function(obj, configs){
  var k;
  obj = obj || {};
  configs = configs || [];
  configs.forEach( function(x){
    if (typeof x === 'object'){
      for (k in x){ 
        if(x.hasOwnProperty(k)) obj[k] = x[k];         
      }
    }
  });
  
  return obj;
};

Stativus = { DEFAULT_TREE: 'default', SUBSTATE_DELIM: 'SUBSTATE:', version: '0.10.0' };

// This creates the Debug object that is used to output statements
// #ifdef DEBUG_MODE
if(DEBUG_MODE){
  Stativus.DebugMessagingObject = {
    
    level: 1,
    
    _buildOutput: function(type, state, details, tree){
      tree = tree || Stativus.DEFAULT_TREE;
      var msg = "Global::["+tree+"] ";
      msg = msg + "=> State::["+state+"]: ";
      msg = msg + '{'+type+'} > '+details;
      return msg;
    },
    
    sendLog: function(type, state, details, tree){
      if (this.level > 0) return;
      var msg = this._buildOutput(type, state, details, tree);
      console.log(msg);
      return msg;
    },
    
    sendInfo: function(type, state, details, tree){
      if (this.level > 1) return;
      var msg = this._buildOutput(type, state, details, tree);
      console.info(msg);
      return msg;
    },
    
    sendWarn: function(type, state, details, tree){
      if (this.level > 2) return;
      var msg = this._buildOutput(type, state, details, tree);
      console.warn(msg);
      return msg;
    },
    
    sendError: function(type, state, details, tree){
      if (this.level > 3) return;
      var msg = this._buildOutput(type, state, details, tree);
      console.error(msg);
      return msg;
    }
  };
}
// #endif
// ******************
// State Object
// ******************
Stativus.State = {
  
  // walk like a duck
  isState: true,
  
  _data: null,
  
  _isNone: function(value){
    return (value === undefined || value === null);
  },
  
  goToState: function(name, data){
    var sc = this.statechart;
    if (sc){ sc.goToState(name, this.globalConcurrentState, this.localConcurrentState, data); }
    // #ifdef DEBUG_MODE
    else { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE){ throw 'Cannot goToState cause state doesnt have a statechart'; }
    }
    // #endif
  },
  
  goToHistoryState: function(name, isRecursive){
    var sc = this.statechart;
    if (sc){ sc.goToHistoryState(name, this.globalConcurrentState, this.localConcurrentState, isRecursive); }
    // #ifdef DEBUG_MODE
    else { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE){ throw 'Cannot goToState cause state doesnt have a statechart'; }
    }
    // #endif
  },
  
  sendEvent: function(evt){
    var sc = this.statechart;
    if (sc){ sc.sendEvent.apply(sc, arguments); }
    // #ifdef DEBUG_MODE
    else { // weird format for UglifyJS preprocessing
      if (DEBUG_MODE){ throw 'Cannot sendEvent cause state doesnt have a statechart'; }
    }
    // #endif
  },
  sendAction: function(evt){
    return this.sendEvent.apply(this, arguments);
  },
  
  getData: function(key){
    if (this._isNone(key)) return key;
    var sc = this.statechart, ret = this._data[key];
    if (this._isNone(ret)) ret = sc.getData(key, this.parentState, this.globalConcurrentState);
    return ret;
  },
  
  setData: function(key, value){
    if (this._isNone(key)) return value;
    this._data[key] = value;
  },

  removeData: function(key){
    if (this._isNone(key)) return key;
    var sc = this.statechart, ret = this._data[key];
    if (this._isNone(ret)) {
      sc.removeData(key, this.parentState, this.globalConcurrentState);
    } else delete this._data[key];
  },
  
  setHistoryState: function(state){
    this.history = this.substatesAreConcurrent ? this.substates : state.name;
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE) {
      Stativus.DebugMessagingObject.sendLog('HISTORY STATE SET', this.name, ' history state set to: '+state.name, this.globalConcurrentState);
    }
    // #endif
  }
};
// Our Maker function:  Thank you D.Crockford.
Stativus.State.create = function (config, sc) {
  var nState, k, i, len, configs = [config],
      key = config.name+'_'+config.globalConcurrentState,
      waitingConfig = sc._configs_in_waiting[key];
  nState = creator.call(this);
  nState._data = {};
  if (waitingConfig) configs.push(waitingConfig);
  return merge(nState, configs);
};

/**
  Statechart functionality...
  TODO: Document more...
*/
Stativus.Statechart = {
  
  create: function(config){
    var sc = creator.call(this);
    
    // config all the internal information 
    sc.isStatechart = true;
    sc._all_states = {};
    sc._all_states[Stativus.DEFAULT_TREE] = {};
    sc._states_with_concurrent_substates = {};
    sc._current_subtrees = {};
    sc._current_state = {};
    sc._current_state[Stativus.DEFAULT_TREE] = null;
    sc._goToStateLocked = false;
    sc._sendEventLocked = false;
    sc._pendingStateTransitions = [];
    sc._pendingEvents = [];
    sc._active_subtrees = {};
    sc._configs_in_waiting = {};
    sc._paused_transition_states = {};
    
    // #ifdef DEBUG_MODE
    if(DEBUG_MODE){
      sc.inState = function(name, tree){
        var ret = false, cStates = this.currentState(tree);
        if (!cStates) throw "Doesn't appear that you are in any states, perhaps you forgot to 'initStates'?";
        cStates.forEach( function(x){
          if(x.name === name) ret = true;
        });
        return ret;
      };
      sc.getActiveStates = sc.currentState;
    }
    // #endif
    return sc;
  },
  
  addState: function(name){
    var tree, obj, hasConcurrentSubstates = false, pState, pName, states,
        cTree, nState, config, configs = [], len, i, that = this, key;
    
    for(i = 1, len = arguments.length; i < len; i++){
      configs[i-1] = config = arguments[i];
      hasConcurrentSubstates = hasConcurrentSubstates || !!config.substatesAreConcurrent;
      tree = tree || config.globalConcurrentState;
      pName = pName || config.parentState;
    }
    tree = tree || Stativus.DEFAULT_TREE;
    config = len === 1 ? {} : merge(null, configs);
    // primary config is always the last config
    config.name = name;
    config.statechart = this;
    
    config.globalConcurrentState = tree;
    
    // Concurrent Substate checks: 
    // Do i have substates?
    cTree = this._states_with_concurrent_substates[tree];
    if (hasConcurrentSubstates){
      obj = this._states_with_concurrent_substates[tree] || {};
      obj[name] = true;
      this._states_with_concurrent_substates[tree] = obj;
    } 
    // Am I a substate of any parent State?
    if (pName){
      pState = this._all_states[tree][pName];
      if(!pState) {
        key = pName+'_'+tree;
        this._configs_in_waiting[key] = pState = this._configs_in_waiting[key] || {};
      }
      pState.substates = pState.substates || [];
      pState.substates.push(name);
    }
    
    nState = Stativus.State.create(config, this);
    
    // Actually add the state to our statechart
    obj = this._all_states[tree] || {}; 
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE){
      if (obj[name]) throw ['Trying to add state', name, 'to state tree', tree, 'and it already exists'].join(' ');
    }
    // #endif
    obj[name] = nState;
    this._all_states[tree] = obj;
    nState._beenAdded = true;
    
    // Code to get the substates and add them.
    states = nState.states || [];
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE){
      if(states.length === 1 && nState.substatesAreConcurrent){ // weird format for UglifyJS preprocessing
        throw ['Trying to add substates in property \'states\' to '+nState.name+', but must have more than ONE substate'];
      }
    }
    // #endif
    states.forEach( function(x, idx){
      var args = [], good = false, last;
      if(typeof x === 'object' && x.length > 0){
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE){
          if (typeof x[0] !== 'string'){
            throw '#addState: invalid substate array...Must have the name at index=0'; 
          }
        }
        // #endif
        args = args.concat(x);
        good = true;
      }
      else if(typeof x === 'string'){
        args.push(x);
        good = true;
      }
      else if (typeof x === 'object'){
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE){
          if (typeof x.name !== 'string') throw '#addState: invalid substate hash...Must have a \'name\' property'; 
        }
        // #endif
        args.push(x.name);
        args.push(x);
        good = true;
      }
      if (good){
        // add missing config parts to the last element.
        last = args.length-1;
        args[last].parentState = name;
        args[last].globalConcurrentState = tree;
        that.addState.apply(that, args);
      }
      // #ifdef DEBUG_MODE 
      else {
        if (DEBUG_MODE) throw '#addState: invalid substate at index='+idx; 
      }
      // #endif
    });
    
    return this;
  },
  
  initStates: function(init){
    var x, state;
    this._inInitialSetup = true;
    if ( typeof init === 'string'){
      this.goToState(init, Stativus.DEFAULT_TREE);
    }
    else if ( typeof init === 'object'){
      for( x in init){
        if (init.hasOwnProperty(x)){
          state = init[x];
          this.goToState(state, x);
        }
      }
    }
    this._inInitialSetup = false;
    this._flushPendingEvents();
    
    return this;
  },
  
  goToState: function(requestedState, tree, localConcurrentState, data){
    var cState, allStates = this._all_states[tree], idx, len,
        enterStates = [], exitStates = [], haveExited, indexes, that,
        reqState, pState, i, substateTree, t,
        enterStateHandled, exitStateHandled, substates;
    
    // #ifdef DEBUG_MODE    
    if (DEBUG_MODE){
      if (!tree) throw '#goToState: invalid global parallel state';
    }
    // #endif

    // First, find the current tree off of the localConcurrentState, then the main tree
    cState = (localConcurrentState && this._current_state[localConcurrentState]) || this._current_state[tree];
    t = typeof requestedState;
    if (t === 'object'){
      reqState = this._compileStateTransitions(requestedState, allStates);
    } else if (t === 'string'){
      reqState = allStates[requestedState];
    } else {
      return;
    }
    
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE) {
      if (!reqState) throw '#goToState: Could not find requested state: '+requestedState;
    } 
    // #endif

    // if the current state is the same as the requested state do nothing
    if (this._checkAllCurrentStates(reqState, localConcurrentState || tree)) return;

    this._setDataOnState(reqState, data);
    
    if (this._goToStateLocked){
      // There is a state transition currently happening. Add this requested
      // state transition to the queue of pending state transitions. The req
      // will be invoked after the current state transition is finished
      this._pendingStateTransitions.push({
        requestedState: requestedState,
        tree: tree,
        localConcurrentState: localConcurrentState
      });
      
      return;
    }

    // Lock for the current state transition, so that it all gets sorted out
    // in the right order
    this._goToStateLocked = true;
    
    // Get the parent states for the current state and the registered state.
    // we will use them to find the commen parent state
    enterStates = this._parentStatesWithRoot(reqState);
    exitStates = cState ? this._parentStatesWithRoot(cState) : [];
    indexes = this._findCommonAncestor(exitStates, enterStates);
    
    // Setup for the enter state sequence
    this._enterStates = enterStates;
    this._enterStateMatchIndex = indexes.second;
    this._enterStateTree = tree;
    
    // Now, we will exit all the underlying states till we reach the common
    // parent state. We do not exit the parent state because we transition
    // within it.
    this._exitStateStack = [];
    for (i = 0; i < indexes.first; i+=1){
      cState = exitStates[i];
      if (cState.substatesAreConcurrent) this._fullExitFromSubstates(tree, cState);
      this._exitStateStack.push(cState);
    }
    
    // Now, that we have the full stack of states to exit
    // We can exit them in an orderly fashion.
    this._unwindExitStateStack();
  },
  
  // Common Ancestor function:
  // continue by finding the common parent state for the current and 
  // requested states:
  //
  // At most, this takes O(m^2) time, where m is the maximum depth from the 
  // root of the tree to either the requested state or the current state.
  // Will always be less than or equal to O(n^2), where n is the number
  // of states in the tree
  _findCommonAncestor: function(set1, set2){
    var idx, len, set1Idx, set2Idx = -1;
    
    for (idx = 0, len = set1.length; idx < len; idx++){
      set1Idx = idx;
      set2Idx = set2.indexOf(set1[idx]);
      if(set2Idx >= 0) break;
    }
    
    // In the case where we don't find a common parent state, we 
    // must enter from the root state
    if (set2Idx < 0) set2Idx = set2.length - 1;
    
    return {first: set1Idx, second: set2Idx};
  },
  
  _compileStateTransitions: function(stateTransitionObj, allStates){
    var key, curr, ret, indexes,
        retStates, currStates, pivot,
        firstTime = true;
    for(key in stateTransitionObj){
      if (stateTransitionObj.hasOwnProperty(key)){
        curr = stateTransitionObj[key];
        if (firstTime){
          ret = allStates[curr];
          retStates = this._parentStates(ret);
          firstTime = false;
        } else {
          currStates = this._parentStates(allStates[curr]);
          indexes = this._findCommonAncestor(retStates, currStates);
          
          // if we can't find a common ancestor then we have a violation of the statechart
          if (indexes.second < 0){
            // #ifdef DEBUG_MODE
            if (DEBUG_MODE){
              Stativus.DebugMessagingObject.sendError('TRANSITION:', ret.name, 'Invalid Transition to '+curr.name+' because of no suitable common ancestor', ret.globalConcurrentState);
            }
            // #endif
            continue;
          }
          
          // check to see if the common ancestor has concurrent substates because 
          // we need to pause transition on the parent state
          pivot = currStates[indexes.second];
          if (!pivot.substatesAreConcurrent){
            // #ifdef DEBUG_MODE
            if (DEBUG_MODE){
              Stativus.DebugMessagingObject.sendError('TRANSITION:', ret.name, 'Invalid Transition to '+curr.name+' because of common ancestor is NOT have concurrent Substates', ret.globalConcurrentState);
            }
            // #endif
            continue;
          }
          pivot = currStates[indexes.second-1];
          // now we take the top most concurrent substate and pause it in transition
          // we will catch it on the next round of transition...
          if(pivot){
            this._paused_transition_states = this._paused_transition_states || {};
            this._paused_transition_states[pivot.name] = (this._paused_transition_states[pivot.name] || 0) + 1;
            this._pendingStateTransitions.push({
              requestedState: curr,
              tree: pivot.globalConcurrentState,
              localConcurrentState: pivot.localConcurrentState
            });
          }
          // #ifdef DEBUG_MODE
          else if (DEBUG_MODE){
            Stativus.DebugMessagingObject.sendError('TRANSITION:', ret.name, 'Invalid Transition to '+curr.name+' because of common ancestor is NOT have concurrent Substates', ret.globalConcurrentState);
          }
          // #endif
        }
        
      }
    }
    return ret;
  },
    
  goToHistoryState: function(requestedState, tree, localConcurrentState, isRecursive){
    var allStatesForTree = this._all_states[tree],
        pState, realHistoryState;
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE){
      if (!tree || !allStatesForTree) throw '#goToHistoryState: State requesting does not have a valid global parallel tree';
    }
    // #endif
    pState = allStatesForTree[requestedState];
    if (pState) realHistoryState = pState.history || pState.initialSubstate;
    
    if(!realHistoryState){
      realHistoryState = requestedState;
    }
    else if (isRecursive){
      this.goToHistoryState(realHistoryState, tree, isRecursive);
      return;
    }
    this.goToState(realHistoryState, tree);
  },
  
  currentState: function(tree){
    var ret, tmp, sTree, aTrees, bTree, cStates = this._current_state,
        cState, i, len, state, ps, aStates;
    tree = tree || 'default';
    cState = cStates[tree];
    aStates = this._all_states[tree];
    
    // now add all the parents of the current state...
    if (cState && cState.isState){
      ret = this._parentStates(cState);
    }
    
    // Now see if it has substates...
    if (cState && cState.substatesAreConcurrent){
      aTrees = this._active_subtrees[tree] || [];
      for(i = 0, len = aTrees.length; i < len; i++){
        sTree = aTrees[i];
        state = cStates[sTree];
        if(state) ps = aStates[state.parentState];
        if (ps && ret.indexOf(ps) < 0) ret.unshift(ps);
        if (state && ret.indexOf(state) < 0) ret.unshift(state);
      }
    }
    return ret;
  },
  
  sendEvent: function(evt){
    var args = [], len = arguments.length, i;

    if (len < 1) return;
    for(i = 1; i < len; i++){
      args[i-1] = arguments[i];
    }
    
    try {
      if (this._inInitialSetup || this._sendEventLocked || this._goToStateLocked){
        // We want to prevent any events from occurring until
        // we have completed the state transitions and events
        this._pendingEvents.push({
          evt: evt,
          args: args
        });

        return;
      }
      this._sendEventLocked = true;
    
      // function that processes the event, diff for testing v. production
      this._processEvent(evt, args);
      
    } catch(err) {
      this._restartEvents();
      throw err;
    }

    this._restartEvents();
  },
  
  _setDataOnState: function(state, data){
    if (state && typeof data !== 'undefined' && data !== null) {
      // #ifdef DEBUG_MODE
      if (DEBUG_MODE) {
        Stativus.DebugMessagingObject.sendLog('SETTING DATA FOR TRANSITION FOR => '+state.name);
      }
      // #endif
      if (typeof data === 'string') state.setData(data, data);
      if (typeof data === 'object') {
        for (var key in data) {
          if(data.hasOwnProperty(key)) state.setData(key, data[key]);
        }
      }
    }
  },
  
  _processEvent: function(evt, args){
    this._structureCrawl('_cascadeEvents', evt, args);
  },
  
  getData: function(key, stateName, tree){
    var allStates = this._all_states[tree], state;
    if (!allStates) return null;
    state = allStates[stateName];
    if (state && state.isState) return state.getData(key);
  },

  removeData: function(key, statename, tree){
    var allStates = this._all_states[tree], state;
    if (!allStates) return null;
    state = allStates[statename];
    if (state && state.isState) return state.removeData(key);
  },
  
  getState: function(name, tree){
    var allStates, ret;
    tree = tree || Stativus.DEFAULT_TREE;
    allStates = this._all_states[tree];
    if (!allStates) return null;
    ret = allStates[name];
    return ret;
  },
  
  _restartEvents: function(){
    // Now, that the states have a chance to process the first action
    // we can go ahead and flush the queued events
    this._sendEventLocked = false;
    if (!this._inInitialSetup) this._flushPendingEvents();
  },
  
  _structureCrawl: function(func, evt, args){
    var tree, currentStates = this._current_state, i, len, sResponder, tmp,
        allStates, responder, aTrees, sTree, handled, found, ss = Stativus.SUBSTATE_DELIM;
    for(tree in currentStates){
      if(!currentStates.hasOwnProperty(tree)) continue;
    
      handled = false;
      sTree = null;
      responder = currentStates[tree];
      if (!responder || tree.slice(0, ss.length) === ss) continue;
      // if we don't have an all state tree then we know that this is a substate tree
      allStates = this._all_states[tree];
      if(!allStates) continue;
      aTrees = this._active_subtrees[tree] || [];
      for(i = 0, len = aTrees.length; i < len; i++){
        sTree = aTrees[i];
        sResponder = currentStates[sTree];
        tmp = handled ? [true, true] : this[func](evt, args, sResponder, allStates, sTree);
        handled = tmp[0];
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) found = tmp[1];
        // #endif
      }
      if (!handled) {
        tmp = this[func](evt, args, responder, allStates, null);  
        handled = tmp[0];
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE){ 
          if (!found) found = tmp[1];
        }
        // #endif
      }
      // #ifdef DEBUG_MODE
      if (DEBUG_MODE){
        if(!found) {
          Stativus.DebugMessagingObject.sendLog('EVENT', this.name, 'Fired {'+evt+'} with '+(args.length || 0)+' argument(s) found NO state to handle this', this.globalConcurrentState);
        }
      }
      // #endif
    }
  },
  
  /**
    @private
    name: _cascadeEvents
  */
  _cascadeEvents: function(evt, args, responder, allStates, tree){
    var handled, ssName, found = false;
    
    // substate prep work...
    ssName = this._splitConcurrencyKey(tree);
    
    while(!handled && responder){
      if (responder[evt]){
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) {
          Stativus.DebugMessagingObject.sendInfo('EVENT', responder.name, 'Fired \''+evt+'\' with '+(args.length || 0)+' argument(s)', responder.globalConcurrentState);
        }
        // #endif
        try {
          handled = responder[evt].apply(responder, args);
        } catch(e){
          // #ifdef DEBUG_MODE
          if (DEBUG_MODE) {
            Stativus.DebugMessagingObject.sendError('EVENT', responder.name, 'Fired \''+evt+'\': Exception: '+e, responder.globalConcurrentState);
          }
          // #endif
        }
        found = true;
      }
      // check to see if we have reached the end of this tree
      if (tree && ssName === responder.name) return [handled, found];
      responder = !handled && responder.parentState ? allStates[responder.parentState] : null ;
    }
    
    return [handled, found];
  },
  
  _checkAllCurrentStates: function(reqState, tree){
    var currentStates = this.currentState(tree) || [];
    if (currentStates === reqState) return true;
    else if (typeof currentStates === 'string' && reqState === this._all_states[tree][currentStates]) return true;
    else if (currentStates.indexOf && currentStates.indexOf(reqState) > -1) return true;
    else return false;
  },
  
  _flushPendingEvents: function(){
    var args, pa = this._pendingEvents.shift();
    if(!pa) return;
    args = pa.args;
    args.unshift(pa.evt);
    this.sendEvent.apply(this, args);
  },
  
  _flushPendingStateTransitions: function(){
    var pending = this._pendingStateTransitions.shift(), msg;
    if (!pending) return false;
    this.goToState(pending.requestedState, pending.tree, pending.localConcurrentState);
    return true;
  },
    
  _fullEnter: function(state){
    var pState, tree, enterStateHandled = false;
    if (!state) return;
    this._addActiveConcurrentSubstate(state, state.localConcurrentState);
    tree = state.localConcurrentState || state.globalConcurrentState;
    this._current_state[tree] = state;
    try {
      if (state.enterState) state.enterState();
      if (state.didEnterState) state.didEnterState();
    } catch(e){
      // #ifdef DEBUG_MODE
      if (DEBUG_MODE) {
        Stativus.DebugMessagingObject.sendError('ENTER STATE', state.name, 'EXECEPTION ['+e+']', state.globalConcurrentState);
      }
      // #endif
    }
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE) {
      Stativus.DebugMessagingObject.sendInfo('ENTER STATE', state.name, 'Completed', state.globalConcurrentState);
    }
    // #endif
    if (state.parentState) {
      pState = state.statechart.getState(state.parentState, state.globalConcurrentState);
      pState.setHistoryState(state);
    }
    this._unwindEnterStateStack();
  },
  
  
  _fullExit: function(state){
    var pState, tree, key;
    if (!state) return;
    var exitStateHandled = false;
    try {
      if (state.exitState) state.exitState();
      if (state.didExitState) state.didExitState();
      
      // check to see if we are in a concurrent substate and if we are the defined 
      // state then delete the item else set the parent to the current state
      // debugger;
      tree = state.localConcurrentState || state.globalConcurrentState;
      key = this._splitConcurrencyKey(tree);
      if (key === state.name) {
        delete this._current_state[tree];
      } else {
        this._current_state[tree] = this._all_states[state.globalConcurrentState][state.parentState];
      }
    } catch (e){
      // #ifdef DEBUG_MODE
      if (DEBUG_MODE) {
        Stativus.DebugMessagingObject.sendError('EXIT STATE', state.name, 'EXECEPTION ['+e+']', state.globalConcurrentState);
      }
      // #endif
    }
    // #ifdef DEBUG_MODE
    if (DEBUG_MODE) {
      Stativus.DebugMessagingObject.sendInfo('EXIT STATE', state.name, 'Completed', state.globalConcurrentState);
    }
    // #endif
    this._unwindExitStateStack();
  },
  
  _initiateEnterStateSequence: function(){
    var enterStates, enterMatchIndex, concurrentTree, tree,
        allStates, i, cState;
    
    enterStates = this._enterStates;
    enterMatchIndex = this._enterStateMatchIndex;
    tree = this._enterStateTree;
    allStates = this._all_states[tree];
    
    // Initialize the Enter State Stack
    this._enterStateStack = this._enterStateStack || [];
    
    // Finally, from the common parent state, but not including the parent state,
    // enter the sub states down to the requested state. If the requested state
    // has an initial sub state, then we must enter it too
    i = enterMatchIndex-1;
    cState = enterStates[i];
    tree = this._getValidLocalConcurrentState(cState) || tree;
    if (cState) this._cascadeEnterSubstates(cState, enterStates.slice(0, enterMatchIndex), i-1, tree, allStates);
    
    // once, we have fully hydrated the Enter State Stack, we must actually async unwind it 
    this._unwindEnterStateStack();
    
    // Cleanup
    enterStates = null;
    enterMatchIndex = null;
    concurrentTree = null;
    tree = null;
    
    delete this._enterStates;
    delete this._enterStateMatchIndex;
    delete this._enterStateTree;
  },
  
  _cascadeEnterSubstates: function(start, requiredStates, index, tree, allStates){
    var cState, pState, subStates, that = this, newReqStates,
        nTree, bTree, name, currStates, aTrees, nTreeBase;
        
    if (!start || that._checkIfPausedState(start)) return;
        
    name = start.name;
    this._enterStateStack.push(start);
    start.localConcurrentState = tree;
    if (start.substatesAreConcurrent){
      tree = start.globalConcurrentState || Stativus.DEFAULT_TREE;
      nTreeBase = [Stativus.SUBSTATE_DELIM,tree,name].join('=>');
      subStates = start.substates || [];
      subStates.forEach( function(x){
        cState = allStates[x];
        
        // check to see if this state is on the paused list
        // if, yes, then decrement the list count
        if(that._checkIfPausedState(cState)) return;
        
        // Now, we have to push the item onto the active subtrees for
        // the base tree for later use of the events.
        nTree = nTreeBase+'=>'+x;
        // that._addActiveConcurrentSubstate(cState, nTree);

        // If we have required states and we are in the middle of them
        // check to see if we are on the required list and decrement the 
        // index and use the required list of states
        if (index > -1 && requiredStates[index] === cState){
          index = index - 1;
          newReqStates = requiredStates;
        // if we are in one of the other substates we *don't* have any 
        // required states so we must zero it out and just flow naturally
        // through the initialSubstates.
        } else {
          newReqStates = [];
        }
        that._cascadeEnterSubstates(cState, newReqStates, index, nTree, allStates);
      });
      return;        
    }
    else {
      // now we can trigger the lower levels of the state
      cState = requiredStates[index];
      if (cState){ 
        if (index > -1 && requiredStates[index] === cState) index = index - 1;
        this._cascadeEnterSubstates( cState, requiredStates, index, tree, allStates);
      }
      // now we will go into the initial substates of this state
      else {
        cState = allStates[start.initialSubstate];
        this._cascadeEnterSubstates( cState, requiredStates, index, tree, allStates);
      }
    }
  },
  
  _addActiveConcurrentSubstate: function(state, localConcurrentKey){
    var gTree, aTrees;
    if(!localConcurrentKey || state.globalConcurrentState === localConcurrentKey) return;
    gTree = state.globalConcurrentState || Stativus.DEFAULT_TREE;
    aTrees = this._active_subtrees[gTree] || [];
    if (aTrees.indexOf(localConcurrentKey) < 0){
      aTrees.unshift(localConcurrentKey);
      this._active_subtrees[gTree] = aTrees;
    }
  },
  
  _checkIfPausedState: function(state){
    // check to see if this state is on the paused list
    // if, yes, then decrement the list count
    if(this._paused_transition_states[state.name]){
      this._paused_transition_states[state.name] = this._paused_transition_states[state.name]-1;
      return true;
    }
    return false;
  },
  
  _fullExitFromSubstates: function(tree, stopState){
    var cStates, allStates, func, that = this;
    if (!tree || !stopState || !tree || !stopState.substates) return;
    
    allStates = this._all_states[tree];
    cStates = this._current_state;
    this._exitStateStack = this._exitStateStack || [];
    
    stopState.substates.forEach( function(state){
      var substateTree, currState, curr, exitStateHandled, aTrees;
      substateTree = [Stativus.SUBSTATE_DELIM, tree, stopState.name, state].join('=>');
      currState = cStates[substateTree];
      while(currState && currState !== stopState){
        exitStateHandled = false;
        if (!currState) continue;
        if (that._exitStateStack.indexOf(currState) < 0){
          that._exitStateStack.push(currState);

          // check to see if it has substates
          if(currState.substatesAreConcurrent) that._fullExitFromSubstates(tree, currState);
        }
        curr = currState.parentState;
        currState = allStates[curr];
      }
      
      // Now, remove this from the active substate tree
      that._active_subtrees[tree] = that._removeFromActiveTree(tree, substateTree);
    });
  },
  
  // @private
  // this function unwinds the next item on the exitStateStack...
  _unwindExitStateStack: function(){
    var stateToExit, delayForAsync = false, stateRestart,
        sc = this;
    this._exitStateStack = this._exitStateStack || [];
    stateToExit = this._exitStateStack.shift();
    if(stateToExit){
      if (stateToExit.willExitState) {
        // Now for some amazing encapsulation magic with closures
        // We are going to create a temporary object that gets passed
        // into the willExitState call that will restart the state
        // exit for this path as needed
        stateRestart = function(){
          var sc = this._statechart;
          // #ifdef DEBUG_MODE
          if (DEBUG_MODE) {
            Stativus.DebugMessagingObject.sendLog('ASYNC', stateToExit.name, 'willExitState() completed!', stateToExit.globalConcurrentState);
          }
          // #endif
          if (sc) sc._fullExit(stateToExit);
        };
        delayForAsync = stateToExit.willExitState(stateRestart);
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) {
          if (delayForAsync) { Stativus.DebugMessagingObject.sendLog('ASYNC', stateToExit.name, 'exitState() delayed', stateToExit.globalConcurrentState); }
          else { Stativus.DebugMessagingObject.sendWarn('ASYNC', stateToExit.name, 'Didn\'t return \'true\' willExitState() which is needed if you want async', stateToExit.globalConcurrentState); }
        }
        // #endif
      }
      if (!delayForAsync) this._fullExit(stateToExit);
    }
    else {
      delete this._exitStateStack;
      this._initiateEnterStateSequence();
    }
  },

  // @private
  // this function unwinds the next item on the enterStateStack...
  _unwindEnterStateStack: function(){
    var stateToEnter, delayForAsync = false, stateRestart, more, that = this;
    this._exitStateStack = this._exitStateStack || [];
    stateToEnter = this._enterStateStack.shift();
    if(stateToEnter){
      if (stateToEnter.willEnterState) {
        // Now for some amazing encapsulation magic with closures
        // We are going to create a temporary object that gets passed
        // into the willExitState call that will restart the state
        // exit for this path as needed
        stateRestart = function(){
          // #ifdef DEBUG_MODE
          if (DEBUG_MODE) {
            Stativus.DebugMessagingObject.sendLog('ASYNC', stateToEnter.name, 'willEnterState() completed!', stateToEnter.globalConcurrentState);
          }
          // #endif
          if (that) that._fullEnter(stateToEnter);
        };
        delayForAsync = stateToEnter.willEnterState(stateRestart);
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) {
          if (delayForAsync) { Stativus.DebugMessagingObject.sendLog('ASYNC', stateToEnter.name, 'enterState() delayed', stateToEnter.globalConcurrentState); }
          else { Stativus.DebugMessagingObject.sendWarn('ASYNC', stateToEnter.name, 'Didn\'t return \'true\' willEnterState() which is needed if you want async', stateToEnter.globalConcurrentState); }
        }
        // #endif
      }
      if (!delayForAsync) this._fullEnter(stateToEnter);
    }
    else {
      delete this._enterStateStack;
      
      // Ok, we're done with the current state transition. Make sure to unlock
      // the goToState and let other pending state transitions
      this._goToStateLocked = false;
      more = this._flushPendingStateTransitions();
      if (!more && !this._inInitialSetup) {
        // Once pending state transitions are flushed then go ahead and start flush
        // pending actions
        this._flushPendingEvents();
      }
    }
  },
  
  // TODO: make this more efficient
  _removeFromActiveTree: function(baseTree, tree){
    var nArray = [], aTrees = this._active_subtrees[baseTree];
    if (!aTrees) return [];
    if (!tree) return aTrees;

    aTrees.forEach( function(x){
      if(x !== tree) nArray.push(x);
    });
    
    return nArray;
  },
  
  _parentStateObject: function(name, tree){
    if(name && tree && this._all_states[tree]){
      return this._all_states[tree][name];
    }
  },
  
  _parentStates: function(state){
    var ret = [], curr = state;
    // always add first state
    ret.push(curr);
    curr = this._parentStateObject(curr.parentState, curr.globalConcurrentState);
    
    while(curr){
      ret.push(curr);
      curr = this._parentStateObject(curr.parentState, curr.globalConcurrentState);
    }
    return ret;
  },
  
  _parentStatesWithRoot: function(state){
    var ret = this._parentStates(state);
    ret.push('root');
    return ret;
  },
  
  _splitConcurrencyKey: function(key){
    var ret, len, keys;
    if (key){
      keys = key.split('=>');
      len = keys.length || 0;
      ret = keys[len-1];
    }
    return ret;
  },
  
  _getValidLocalConcurrentState: function(state, allStates){
    if (!state) return;
    allStates = allStates || this._all_states[state.globalConcurrentState];
    return state.localConcurrentState || this._getValidLocalConcurrentState(allStates[state.parentState], allStates);
  }
  
};

Stativus.createStatechart = function(){ return this.Statechart.create(); };
// #ifdef DEBUG_MODE
if (DEBUG_MODE){
  Stativus.Statechart.createStateTree = function() {

    var unprocessedStates = [];

    var addToTree = function(name, state, rootTree) {

      function addSubstateToTree(parentState, stateName, state, tree) {
        if(tree.name === parentState) {
          tree.substates.push(createNode(state, stateName, tree));
          return true;
        }
        return tree.substates.some(function(subtree) {
          return addSubstateToTree(parentState, stateName, state, subtree);
        });
      }

      function addStateToTree(name, state){
        if(!state.parentState) {
          rootTree.substates.push(createNode(state, name, rootTree));
          return true;
        }
        return addSubstateToTree(state.parentState, name, state, rootTree);
      }

      return addStateToTree(name, state);

    };

    function getTransitions(func) {
      var pattern = 
        "goToState\\s*\\(\\s*['\"]([a-zA-Z\\\-_0-9]+)['\"]\\s*\\)";
      var globalRegEx = new RegExp(pattern, 'g');
      var regExp = new RegExp(pattern);
      var matches = func.toString().match(globalRegEx);
      if(matches) return matches.map(function(m){
        return m.match(regExp)[1];
      });
      else return [];
    }

    function createNode(state, name, parentTree) {
      var events =  Object.keys(state).filter(function(key) {
        return key.slice(0,1) !== '_' && 
          state[key] && 
          ['name', 'gotoState', 'sendAction', 'parentState', 'states',
            'globalConcurrentState', 'history', 'statechart',
            'localConcurrentState', 'initialSubstate', 'actions',
            'substatesAreConcurrent', 'hasConcurrentSubstates']
          .every(function(excludedKey) { return key !== excludedKey;});
      }).map(function(key) {
        return {
          name: key, 
          content: state[key].toString(),
          transitions: getTransitions(state[key])
        };
      });

      return { 
        substates: [],
        name: name,
        initialSubstate: state.initialSubstate,
        hasConcurrentSubstates: state.hasConcurrentSubstates ||
          !!state.substatesAreConcurrent,
        isConcurrentSubstate:
          parentTree && parentTree.hasConcurrentSubstates,
        isInitialSubstate: parentTree && parentTree.initialSubstate === name,
        events: events
      };
    }

    var allStatesTree = createNode({hasConcurrentSubstates: true }, "global");

    function processState(stateHash, stateTree) {
      return function(state) {
        return !addToTree(state, stateHash[state], stateTree);
      };
    }

    function processFailedState(stateHash, stateTree) {
      return function(invalidStateName) {
        var invalidState = createNode(stateHash[invalidStateName],
                                   invalidStateName);
        invalidState.isInvalidState = true;
        stateTree.substates.push(invalidState);
      };
    }

    for (var globalStateName in this._all_states) {
      if (this._all_states.hasOwnProperty(globalStateName)) {
        var globalStateTree = createNode({}, globalStateName, allStatesTree),
            globalState = this._all_states[globalStateName];

        allStatesTree.substates.push(globalStateTree);

        unprocessedStates = Object.keys(globalState);
        do {
          var statesToProcess = unprocessedStates.length;
          unprocessedStates = unprocessedStates.filter(
            processState(globalState, globalStateTree));

          if (statesToProcess === unprocessedStates.length) {
            unprocessedStates.forEach(
              processFailedState(globalState, globalStateTree));
            break;
          }
        } while(unprocessedStates.length > 0);
      }
    }
    return allStatesTree;
  };
}
// #endif
// #ifdef DEBUG_MODE
if (DEBUG_MODE){
  Stativus.TestStateObject = {
    
    _eventsCalled: null,
    _eventHandled: null,
    
    create: function(statechart){
      var tso = creator.call(this);
      
      tso._eventsCalled = {};
      tso._eventHandled = {};
      tso._eventTransition = {};
      tso._statechart = statechart;
      
      return tso;
    },
    
    enterState: function(){
      this._statechart.sendEvent('enterState');
    },
    
    willEnterState: function(done){
      var that = this, innerDone = function(){
        that._willEnterStateDone = true;
        done();
      };
      this._statechart.sendEvent('willEnterState', innerDone);
    },
    
    willExitState: function(done){
      var that = this, innerDone = function(){
        that._willExitStateDone = true;
        done();
      };
      this._statechart.sendEvent('willExitState', innerDone);
    },
    
    exitState: function(){
      this._statechart.sendEvent('exitState');
    },
    
    // **********************
    // TESTING API
    // **********************
    wasEvent: function(name){
      var ret, eventCount = this._eventsCalled[name] || 0,
          evtHandled = this._eventHandled[name] || false,
          evtTrans = this._eventTransition[name];
      
      ret = { 
        called: function(count) { 
          return count ? count === eventCount : eventCount;
        },
        handled: function(){
          return evtHandled;
        },
        transitionedTo: function(name){
          return name === evtTrans;
        }
      };
      return ret;
    },
    
    transitionedTo: function(name){
      return name === this._transitionTo;
    },
    
    willEnterCompleted: function(){
      return !!this._willEnterStateDone;
    },
    
    willExitCompleted: function(){
      return !!this._willExitStateDone;
    },
    
    reset: function(){
      delete this._eventsCalled;
      delete this._eventHandled;
      delete this._eventTransition;
      
      this._eventsCalled = {};
      this._eventHandled = {};
      this._eventTransition = {};
    },
    
    // protected functions only used by new statechart functions: sendEvent, goToState
    _eventCalled: function(evt, handled){
      var cnt = this._eventsCalled[evt] || 0;
      this._eventsCalled[evt] = cnt+1;
      this._eventHandled[evt] = handled;
    },
    
    _setTransitionState: function(evt, stateName){
      this._eventTransition[evt] = stateName;
      this._transitionTo = stateName;
    }
  };
  
  
  // Code to convert the Statechart to a Testing Statechart
  Stativus.Statechart.loadState = function(name, tree){
    var key, state, allStates;
    tree = tree || Stativus.DEFAULT_TREE;
    
    this._overloadFunctionsForTesting();
    this.isTestingStatechart = true;
    
    this._test_stateObjects = this._test_stateObjects || {};
    key = name+'_'+tree;
    allStates = this._all_states[tree];
    
    state = this._test_stateObjects[key] || Stativus.TestStateObject.create(this);
    
    this._current_test_state_object = state;
    this._current_loaded_state = allStates[name];
    
    return state;
  };
  
  Stativus.Statechart._overloadFunctionsForTesting = function(){
    if (this.isTestingStatechart) return;
    
    this._processEvent = function(evt, args){
      var handled = false,
          currState = this._current_loaded_state,
          currTestObj = this._current_test_state_object;

      if (currState[evt]){
        this._current_testing_event = evt;
        handled = currState[evt].apply(currState, args);
        currTestObj._eventCalled(evt, handled);
        delete this._current_testing_event;
      }
    };
    
    this.goToState = function(requestedState, tree, concurrentTree){
      var currTestObj = this._current_test_state_object,
          evt = this._current_testing_event;
      currTestObj._setTransitionState(evt, requestedState);
    };
  };
}
// #endif
// All this code will add some awesome eventing structure that looks like backbone.js
// 
// #ifdef EVENTABLE
if (EVENTABLE){
  Stativus.Statechart._internalTryToPerform = function(node, evt, args){
    var that = this, lookup, selectors;
    
    if (!node || !node.className) return;
    selectors = node.className.split(/\s+/).map( function(x){ return '.'+x; });
    if (node.id) selectors.push('#'+node.id);
    selectors.forEach( function(x){
      lookup = (x+' '+evt).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      that._structureCrawl('_cascadeActionHandler', lookup, args);
    });
  };
  
  Stativus.Statechart._cascadeActionHandler = function(lookup, args, responder, allStates, tree){
    var handled, ssName, found = false, evt;
    
    // substate prep work...
    ssName = this._splitConcurrencyKey(tree);
    
    while(!handled && responder){
      evt = responder.actions ? responder.actions[lookup] : null;
      if (evt){
        // #ifdef DEBUG_MODE
        if (DEBUG_MODE) {
          Stativus.DebugMessagingObject.sendLog('EVENT LOOKUP', responder.name, ['Will fire [',evt,'] for','['+lookup+']', 'with', args.length || 0, 'argument(s)'].join(' '), responder.globalConcurrentState);
        }
        // #endif
        args.unshift(evt);
        this.sendEvent.apply(this, args);
        return [true, true];
      }
      // check to see if we have reached the end of this tree
      if (tree && ssName === responder.name) return [handled, found];
      responder = !handled && responder.parentState ? allStates[responder.parentState] : null ;
    }
    
    return [handled, found];
  };
  
  // Special sauce when you have jQuery Loaded
  var jQueryIsLoaded=false;
  try {
    if (jQuery) jQueryIsLoaded=true;
  }
  catch(err){
    jQueryIsLoaded=false;
  }

  if(jQueryIsLoaded){
    
    var findEventableNodeData = function(start){
      var parents, evt, evts, args,
          node = $(start), found, ret;
      if (node.hasClass('eventable')) found = node;

      if (!found){
        parents = node.parents('.eventable');
        if (parents && parents.length > 0) found = parents;
      }

      if (found){
        args = found.attr('data');
        args = args ? args.split('::') : [];
        found = found[0];
      }
      return [found, args];
    };
  
    Stativus.Statechart.tryToPerform = function(evt){   
      if (!evt) return;   
      var args, selectors = [], 
          tuple = findEventableNodeData(evt.target);
      if (!tuple[0]) return;
      tuple[1].push(evt); // Add the evt to the last argument
      this._internalTryToPerform(tuple[0], evt.type, tuple[1]);
    };
  }  
  else {
    
    // When you don't have JQuery you can still fire off the tryToPerform, but
    // you are responsible for converting the selectors
    Stativus.Statechart.tryToPerform = function(evt){
      if (!evt) return;
      var args = [], len = arguments.length, i, lookup;
      if (len < 2) return;
      for(i = 2; i < len; i++){
        args[i-2] = arguments[i];
      }
      args.push(evt);
      this._internalTryToPerform(evt.target, evt.type, args);
    };
  }
}
// #endif
// TODO:  Work on AMD Loading...
if (typeof window !== "undefined") {
  window.Stativus = Stativus;
} else if (typeof exports !== "undefined") {
  module.exports = Stativus;
}
/*globals StativusDocs*/

StativusDocs = {};
StativusDocs.Statechart = Stativus.createStatechart();

$(document).ready(function() {
  StativusDocs.Statechart.initStates({ 'default': 'application' });
});

// Adjust for fixed navbar
$('body').on('click.scroll-adjust', '[href^="#"]', function (e) {
  var adjustScrollForNavbar = function() { window.scrollBy(0, -50); };

  if (e && e.isDefaultPrevented()) return;
  $(window).one('scroll', adjustScrollForNavbar);
});
/*globals StativusDocs, SyntaxHighlighter*/
(function(app) {
  
  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('api', {

    parentState: 'application',

    substatesAreConcurrent: true,

    enterState: function() {
      this.sendEvent('activateNavigation', 'api');
      this.sendEvent('renderView', '#api-template');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    },

    states: [
      {
        name: 'api-navigation',

        enterState: function() {
          this.sendEvent('renderSidebarNavigation');
        },

        renderSidebarNavigation: function() {
          var html = $('#api-nav-template').html();
          $('#api-nav').html(html);

          this.sendEvent('affixSidebar');
        },

        affixSidebar: function() {
          $('.bs-sidebar').each(function() { $(this).affix({ offset: { top: 100 } }); });
        }
      },
      {
        name: 'api-documentation',

        enterState: function() {
          this.sendEvent('renderDocumentation');
        },

        renderDocumentation: function() {
          $('#api-doc').html($('#api-doc-template').html());
          this.sendEvent('highlightScript');
          this.sendEvent('wireNavigation');
        },

        wireNavigation: function() {
          $('.bs-sidenav a').each(function() {
            $(this).click(function(evt) {
              evt.preventDefault();

              var id = $(this).attr('href');
              var top = $(id).offset().top-50;
              $('html, body').animate({ scrollTop: top }, 1);
            });
          });
        },

        highlightScript: function() {
          var that = this;
          var spy = function() { that.sendEvent('setScrollSpy'); };

          SyntaxHighlighter.highlight();
          setTimeout(spy, 500);
        },

        setScrollSpy: function() {
          $('body').each(function () {
            var $this = $(this);
            $this.scrollspy($this.data());
          });
        }
      }
    ]

  });

})(StativusDocs);
/*globals StativusDocs, SyntaxHighlighter, Path, _gaq*/

(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('application', {

    enterState: function() {
      this.sendEvent('enableRouting');
      this.sendEvent('configureSyntaxHighlighter');
    },

    configureSyntaxHighlighter: function() {
      // set syntaxhighlighter defaults
      SyntaxHighlighter.defaults['toolbar'] = false;
      SyntaxHighlighter.defaults['smart-tabs'] = false;
    },

    enableRouting: function() {
      var that = this;

      var goToState = function(route) {
        return function() {
          that.sendEvent('trackEvent', 'Navigation', route, route);
          that.goToState(route);
        };
      };

      Path.map('#/api').to(goToState('api'));
      Path.map('#/faq').to(goToState('faq'));
      Path.map('#/gists').to(goToState('gists'));
      Path.map('#/guide').to(goToState('guide'));
      Path.map('#/samples').to(goToState('samples'));
      Path.map('#/versions').to(goToState('versions'));
      Path.map('#/').to(goToState('home'));

      Path.root('#/');

      Path.listen();
    },

    activateNavigation: function(id) {
      $('li#'+id).addClass('active');
    },

    deactivateNavigation: function() {
      $('.navbar li').removeClass('active');
    },

    renderView: function(selector) {
      var html = $(selector).html();
      $('#content-container').html(html);
    },

    clearContentContainer: function() {
      $('#content-container').html('');
    },

    scrollTop: function() {
      window.scrollTo(0,0);
    },

    trackEvent: function(category, evt, label) {
      if (!_gaq) return;
      _gaq.push(['_trackEvent', category, evt, label]);      
    },

    highlightSyntax: function() {
      SyntaxHighlighter.highlight();
    }

  });

})(StativusDocs);
/*globals StativusDocs*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('faq', {

    parentState: 'application',

    enterState: function() {
      this.sendEvent('activateNavigation', 'faq');
      this.sendEvent('renderView', '#faq-template');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    }

  });

})(StativusDocs);
/*globals StativusDocs, SyntaxHighlighter*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('gists', {

    parentState: 'application',

    enterState: function() {
      this.sendEvent('activateNavigation', 'gists');
      this.sendEvent('renderView', '#gists-template');
      this.sendEvent('highlightSyntax');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    }

  });

})(StativusDocs);
/*globals StativusDocs*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('guide', {

    parentState: 'application',

    enterState: function() {
      this.sendEvent('activateNavigation', 'guide');
      this.sendEvent('renderView', '#guide-template');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    }

  });

})(StativusDocs);
/*globals StativusDocs*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('home', {

    parentState: 'application',

    // events: {
    //   'click .download': 'download'
    // },

    enterState: function() {
      var that = this;
      $(document).on('click', '.download', function() { that.sendEvent('download'); }); // remove after new eventable version added

      this.sendEvent('renderView', '#home-template');
    },

    exitState: function() {
      $(document).off('click', '.download'); // remove after new eventable version added
      this.sendEvent('scrollTop');
      this.sendEvent('clearContentContainer');
    },

    download: function() {
      $('.callout').removeClass('hidden');
    }

  });
})(StativusDocs);
/*globals StativusDocs*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('samples', {

    parentState: 'application',

    enterState: function() {
      this.sendEvent('activateNavigation', 'samples');
      this.sendEvent('renderView', '#samples-template');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    }

  });

})(StativusDocs);
/*globals StativusDocs*/
(function(app) {

  if (!app.Statechart) throw new Error('The statechart object has not been initialized.');

  app.Statechart.addState('versions', {

    parentState: 'application',

    enterState: function() {
      this.sendEvent('activateNavigation', 'versions');
      this.sendEvent('renderView', '#versions-template');
    },

    exitState: function() {
      this.sendEvent('scrollTop');
      this.sendEvent('deactivateNavigation');
      this.sendEvent('clearContentContainer');
    }

  });

})(StativusDocs);
// #= require lib/bootstrap
// #= require lib/path
// #= require lib/shCore
// #= require lib/shBrushJScript
// #= require lib/stativus

// #= require core
// #= require_tree states