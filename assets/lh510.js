/* ==========================================================================
   lh510 - Page scripts
   Vanilla JS for the lh510-* sections. Everything is opt-in through data attributes, so a section only
   needs the markup:
     [data-lh-slider]      wraps a .lh-scroller [data-lh-track]; data-lh-autoplay="ms" for autoplay
     .lh-scroller          mouse drag on desktop (touch scrolls natively)
     [data-lh-menu]        mobile nav - button[data-lh-menu-toggle] toggles .is-open on the root
     [data-lh-cart-form]   buy now / add to cart (snippets/lh510-buy-button)
   ========================================================================== */
(function () {
  "use strict";
  if (window.__lh510) return; // several sections include this file; run it once
  window.__lh510 = true;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // helpers
  function each(sel, root, fn) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); }

  // init guard - sections get re-rendered in the theme editor
  function once(el, flag) {
    if (el.hasAttribute(flag)) return false;
    el.setAttribute(flag, "");
    return true;
  }

  // ---- Slider: optional autoplay, one card per step
  function slider(root) {
    if (!once(root, "data-lh-slider-ready")) return;
    var track = root.querySelector("[data-lh-track]");
    if (!track) return;
    function step() {
      var first = track.children[0];
      if (!first) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    }
    function atEnd() { return track.scrollLeft + track.clientWidth >= track.scrollWidth - 2; }
    function go(dir) { track.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" }); }

    // autoplay - keeps going on hover; waits while a card has keyboard focus or the row is being dragged; loops back to the start
    var ms = parseInt(root.getAttribute("data-lh-autoplay"), 10);
    if (ms > 0 && !reduce) {
      var timer = null, paused = false;
      function tick() {
        if (paused || document.hidden || track.classList.contains("is-dragging")) return;
        if (atEnd()) track.scrollTo({ left: 0, behavior: "smooth" }); else go(1);
      }
      function start() { stop(); timer = setInterval(tick, ms); }
      function stop() { if (timer) clearInterval(timer); timer = null; }
      root.addEventListener("focusin", function () { paused = true; });
      root.addEventListener("focusout", function () { paused = false; });
      start();
    }
  }

  // ---- Mouse drag for every .lh-scroller (touch already scrolls natively)
  function dragScroll(track) {
    if (track.hasAttribute("data-lh-drag-ready")) return;
    track.setAttribute("data-lh-drag-ready", "");
    var down = false, startX = 0, startLeft = 0, moved = false, lastDx = 0;
    track.addEventListener("dragstart", function (e) { e.preventDefault(); }); // images would start a native drag
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add("is-dragging"); }
      if (moved) { track.scrollLeft = startLeft - dx; lastDx = dx; }
    });
    function end() {
      if (!down) return;
      down = false;
      if (!moved) return;
      if (track.classList.contains("lh-scroller--free")) { track.classList.remove("is-dragging"); return; }
      // Settle on the nearest snap position, nudged in the drag direction, honouring each card's scroll-snap-align.
      var tr = track.getBoundingClientRect(), best = track.scrollLeft, bestD = Infinity;
      var want = track.scrollLeft - Math.sign(lastDx) * Math.min(Math.abs(lastDx), 60);
      var max = track.scrollWidth - track.clientWidth;
      Array.prototype.forEach.call(track.children, function (c) {
        var r = c.getBoundingClientRect(), left = r.left - tr.left + track.scrollLeft;
        var align = getComputedStyle(c).scrollSnapAlign.split(" ").pop();
        var pos = align === "center" ? left + r.width / 2 - track.clientWidth / 2 : align === "end" ? left + r.width - track.clientWidth : left - (parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0);
        pos = Math.max(0, Math.min(max, pos));
        var d = Math.abs(pos - want);
        if (d < bestD) { bestD = d; best = pos; }
      });
      track.scrollTo({ left: best, behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { track.classList.remove("is-dragging"); }, reduce ? 0 : 450);
    }
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    // a drag shouldn't count as a click on the card under the cursor
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }

  // ---- Mobile menu (header), Esc closes it
  function menu(root) {
    if (!once(root, "data-lh-menu-ready")) return;
    var btn = root.querySelector("[data-lh-menu-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = !root.classList.contains("is-open");
      root.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("lh-menu-open", open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("is-open")) btn.click();
    });
  }

  // ---- Cart
  // Forms with [data-lh-cart-form] (snippets/lh510-buy-button) are sent to /cart/add.js:
  //   data-action="buy"  add + go to Shopify's checkout
  //   data-action="add"  stay on the page - the theme's own cart popup if it has one, else our notice;
  //                      every [data-lh-cart-count] badge updates
  // Without JS the form still posts to /cart/add normally.
  var toastEl = null, toastTimer = null;
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // added-to-cart / error notice at the bottom of the screen (one element, reused)
  function toast(html, isError) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "lh lh-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.classList.toggle("is-error", !!isError);
    toastEl.innerHTML = html + '<button type="button" class="lh-toast__close" aria-label="Close">&times;</button>';
    toastEl.querySelector(".lh-toast__close").addEventListener("click", function () { toastEl.classList.remove("is-visible"); });
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, isError ? 7000 : 6000);
  }
  // cart badges in the header, hidden at 0
  function setCount(n) {
    each("[data-lh-cart-count]", document, function (el) { el.textContent = n; el.hidden = !n; });
  }
  // Shopify's standard events module (@shopify/events), mapped in Horizon's import map; null on other themes.
  // Loaded through a small inline module script: Shopify minifies theme JS and rewrites a dynamic import() in a
  // classic script into require(), which doesn't exist in the browser.
  var eventsModule = null;
  function shopifyEvents() {
    if (eventsModule) return eventsModule;
    eventsModule = new Promise(function (resolve) {
      var map = document.querySelector('script[type="importmap"]');
      if (!map || map.textContent.indexOf('"@shopify/events"') < 0) return resolve(null);
      var cb = "__lh510Events";
      var timer = setTimeout(function () { resolve(null); }, 5000);
      window[cb] = function (m) { clearTimeout(timer); resolve(m); };
      var s = document.createElement("script");
      s.type = "module";
      s.textContent = 'import * as m from "@shopify/events"; window.' + cb + "(m);";
      s.onerror = function () { clearTimeout(timer); resolve(null); };
      document.head.appendChild(s);
    });
    return eventsModule;
  }
  // Horizon themes: dispatch their CartLinesUpdateEvent so the theme's own cart icon and drawer update too.
  function themeCartEvent(target, variantId, qty) {
    return shopifyEvents().then(function (m) {
      var E = m && m.CartLinesUpdateEvent;
      if (!E || !E.createPromise) return null;
      var d = E.createPromise();
      target.dispatchEvent(new E({ action: "add", context: "product", promise: d.promise,
        lines: [{ merchandiseId: String(variantId), quantity: qty }] }));
      return {
        resolve: function (cart) {
          d.resolve({ cart: E.createCartFromAjaxResponse ? E.createCartFromAjaxResponse(cart) : cart,
            detail: { items: cart.items, itemCount: qty, source: "lh510" } });
        },
        reject: d.reject
      };
    }).catch(function () { return null; });
  }
  function addedNotice(title, cartUrl, checkoutUrl) {
    toast('<span class="lh-toast__msg">' + (title ? "<strong>" + esc(title) + "</strong> added to cart" : "<strong>Added to cart</strong>") + "</span>" +
      '<a class="lh-toast__link" href="' + esc(cartUrl) + '">View cart</a>' +
      '<a class="lh-toast__link lh-toast__link--primary" href="' + esc(checkoutUrl) + '">Checkout</a>');
  }
  function getCart(cartUrl) {
    return fetch(cartUrl + ".js", { headers: { Accept: "application/json" } }).then(function (r) { return r.json(); });
  }
  document.addEventListener("submit", function (e) {
    var form = e.target && e.target.closest ? e.target.closest("[data-lh-cart-form]") : null;
    if (!form || !window.fetch || !window.FormData) return;     // no JS support: the normal form post works
    e.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    if (!btn || btn.disabled || btn.getAttribute("aria-busy") === "true") return;
    var buy = form.getAttribute("data-action") === "buy";
    var fd = new FormData(form);
    fd.delete("return_to");
    var variantId = fd.get("id"), qty = parseInt(fd.get("quantity"), 10) || 1;
    var cartUrl = form.getAttribute("data-cart-url") || "/cart";
    var checkoutUrl = form.getAttribute("data-checkout-url") || "/checkout";

    // 1. Dawn themes (lavnalocks.com runs Dawn): request the theme's cart sections with the add, so its own
    //    "Item added to your cart" popup / drawer shows, same as on a product page
    var themeCart = buy ? null : document.querySelector("cart-notification, cart-drawer");
    if (themeCart && (typeof themeCart.renderContents !== "function" || typeof themeCart.getSectionsToRender !== "function")) themeCart = null;
    if (themeCart) {
      fd.append("sections", themeCart.getSectionsToRender().map(function (s) { return s.id; }));
      fd.append("sections_url", window.location.pathname);
      if (typeof themeCart.setActiveElement === "function") themeCart.setActiveElement(document.activeElement);
    }

    // 2. Add to cart
    btn.setAttribute("aria-busy", "true");
    btn.classList.add("is-loading");
    var themeEvent = buy || themeCart ? Promise.resolve(null) : themeCartEvent(form, variantId, qty);
    var leaving = false;
    fetch(form.getAttribute("action") + ".js", {
      method: "POST", body: fd, headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || res.j.status) throw new Error(res.j.description || res.j.message || "This item could not be added to the cart.");
        if (buy) {
          leaving = true;                       // keep the loading state while the browser navigates
          window.location.href = checkoutUrl;
          return;
        }
        if (themeCart) {
          themeCart.renderContents(res.j);      // the theme shows its own "added to cart" UI and updates its icon
        }
        // update badges, tell the theme / other scripts, then show our notice if the theme has no popup
        return getCart(cartUrl).then(function (cart) {
          setCount(cart.item_count);
          themeEvent.then(function (h) { if (h) h.resolve(cart); });
          document.dispatchEvent(new CustomEvent("lh510:cart:added", { detail: { item: res.j, cart: cart } }));
          if (themeCart) return;
          addedNotice(res.j.product_title || form.getAttribute("data-product-title"), cartUrl, checkoutUrl);
        });
      })
      .catch(function (err) {   // shows Shopify's message, e.g. sold out / quantity limit
        themeEvent.then(function (h) { if (h) h.reject(err); });
        toast('<span class="lh-toast__msg">' + esc(err && err.message ? err.message : "Something went wrong. Please try again.") + "</span>", true);
      })
      .then(function () {       // reset the button, unless we're on the way to checkout
        if (leaving) return;
        btn.removeAttribute("aria-busy");
        btn.classList.remove("is-loading");
      });
  });
  // Horizon pages (catalog, product, cart...) use the lh510 header too: keep its cart badge in sync with the
  // theme's own add to cart / quantity changes, and show our notice for theme adds unless Horizon's cart drawer
  // is set to open by itself. Themes without @shopify/events skip this.
  shopifyEvents().then(function (m) {
    var name = m && m.StandardEvents && m.StandardEvents.cartLinesUpdate;
    if (!name) return;
    document.addEventListener(name, function (e) {
      if (!e.promise || !document.querySelector("[data-lh-cart-count]")) return;
      e.promise.then(function (r) {
        var n = r && r.cart && r.cart.totalQuantity != null ? r.cart.totalQuantity : r && r.detail && r.detail.itemCount;
        if (n != null) setCount(n);
        var ours = r && r.detail && r.detail.source === "lh510";
        if (e.action === "add" && !ours && !document.querySelector("cart-drawer-component[auto-open]")) addedNotice("", "/cart", "/checkout");
      }).catch(function () {});
    });
  }).catch(function () {});

  // Back from checkout via the browser's back button: the page comes from cache, so refresh the counts.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted || !document.querySelector("[data-lh-cart-count]") || !window.fetch) return;
    var form = document.querySelector("[data-lh-cart-form]");
    getCart(form ? form.getAttribute("data-cart-url") : "/cart").then(function (c) { setCount(c.item_count); }).catch(function () {});
    each('[data-lh-cart-form] [aria-busy="true"]', document, function (b) { b.removeAttribute("aria-busy"); b.classList.remove("is-loading"); });
  });

  // ---- Init
  function init(root) {
    each("[data-lh-slider]", root, slider);
    each(".lh-scroller", root, dragScroll);
    each("[data-lh-menu]", root, menu);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(document); });
  else init(document);
  // Theme editor: re-init a section when it is re-rendered.
  document.addEventListener("shopify:section:load", function (e) { init(e.target); });
})();
