<template>
  <section class="page page-cart refined-layout">
    <header class="shop-hero cart-hero">
      <div>
        <p class="eyebrow">Cart</p>
        <h1>Review your items and complete checkout.</h1>
        <p class="lead">
          A flexible simulated checkout where users can review items, choose delivery, and confirm payment details without a forced wizard flow.
        </p>
      </div>

      <div v-if="store.cartItems.length" class="hero-stats">
        <span>{{ store.cartCount }} {{ cartSummaryText }}</span>
        <span>{{ formattedTotal }} total</span>
      </div>
    </header>

    <div v-if="store.cartItems.length" class="cart-layout">
      <section class="cart-list" aria-label="Cart items">
        <article
          v-for="line in store.cartItems"
          :key="`${line.productId}-${line.color}`"
          class="cart-item"
        >
          <RouterLink :to="`/product/${line.product.id}`" class="cart-item-image">
            <img :src="line.product.image" :alt="line.product.name" loading="lazy" decoding="async" />
          </RouterLink>

          <div class="cart-item-content">
            <div class="cart-item-header">
              <div>
                <p class="eyebrow">{{ line.product.category }}</p>
                <h3>{{ line.product.name }}</h3>
              </div>

              <button
                class="text-button"
                type="button"
                @click="store.removeFromCart(line.productId, line.color)"
              >
                Remove
              </button>
            </div>

            <div class="cart-item-meta">
              <span>Color: {{ line.color }}</span>
              <span>{{ formatEuro(line.product.price) }} each</span>
            </div>

            <div class="cart-item-footer">
              <div class="quantity-stepper" aria-label="Quantity controls">
                <button type="button" @click="store.updateCartQuantity(line.productId, line.color, line.quantity - 1)">
                  -
                </button>
                <span>{{ line.quantity }}</span>
                <button type="button" @click="store.updateCartQuantity(line.productId, line.color, line.quantity + 1)">
                  +
                </button>
              </div>

              <div class="cart-item-total">
                <span>Line total</span>
                <strong>{{ formatEuro(line.lineTotal) }}</strong>
              </div>
            </div>
          </div>
        </article>
      </section>

      <aside id="checkout-panel" class="checkout-panel">
        <div class="summary-card cart-section">
          <p class="eyebrow">Order summary</p>

          <div class="summary-row">
            <span>Subtotal</span>
            <strong>{{ formatEuro(store.subtotal) }}</strong>
          </div>

          <div class="summary-row">
            <span>{{ shippingLabel }}</span>
            <strong>{{ formatEuro(selectedShippingCost) }}</strong>
          </div>

          <div class="summary-row">
            <span>Tax</span>
            <strong>{{ formatEuro(store.tax) }}</strong>
          </div>

          <div class="summary-row total">
            <span>Total</span>
            <strong>{{ formatEuro(checkoutTotal) }}</strong>
          </div>
        </div>

        <form id="checkout-flow" class="checkout-flow" @submit.prevent="completeCheckout">
          <section class="checkout-section">
            <div class="checkout-section-heading">
              <div>
                <p class="eyebrow">Delivery details</p>
                <h3>Where should the order go?</h3>
              </div>
              <span class="section-status" :class="{ complete: deliveryComplete }">
                {{ deliveryComplete ? "Complete" : "Required" }}
              </span>
            </div>

            <div class="form-grid two-column">
              <label class="input-group">
                <span>Full name</span>
                <input v-model.trim="form.name" type="text" required placeholder="Jordan Lee" />
              </label>

              <label class="input-group">
                <span>Email</span>
                <input v-model.trim="form.email" type="email" required placeholder="jordan@example.com" />
              </label>

              <label class="input-group full-field">
                <span>Delivery address</span>
                <input v-model.trim="form.address" type="text" required placeholder="88 King Street, Valletta" />
              </label>
            </div>
          </section>

          <section class="checkout-section">
            <div class="checkout-section-heading">
              <div>
                <p class="eyebrow">Shipping method</p>
                <h3>Choose delivery speed.</h3>
              </div>
            </div>

            <div class="option-grid">
              <label class="option-card" :class="{ active: form.shippingMethod === 'standard' }">
                <input type="radio" v-model="form.shippingMethod" value="standard" />
                <span>
                  <strong>Standard delivery</strong>
                  <small>3-5 working days - Free</small>
                </span>
              </label>

              <label class="option-card" :class="{ active: form.shippingMethod === 'express' }">
                <input type="radio" v-model="form.shippingMethod" value="express" />
                <span>
                  <strong>Express delivery</strong>
                  <small>1-2 working days - EUR5.00</small>
                </span>
              </label>
            </div>
          </section>

          <section class="checkout-section">
            <div class="checkout-section-heading">
              <div>
                <p class="eyebrow">Simulated payment</p>
                <h3>No real payment is taken.</h3>
              </div>
              <span class="section-status" :class="{ complete: paymentComplete }">
                {{ paymentComplete ? "Ready" : "Demo fields" }}
              </span>
            </div>

            <div class="form-grid two-column">
              <label class="input-group full-field">
                <span>Card number</span>
                <input v-model.trim="form.cardNumber" inputmode="numeric" placeholder="4242 4242 4242 4242" required />
              </label>

              <label class="input-group">
                <span>Expiry</span>
                <input v-model.trim="form.expiry" placeholder="MM/YY" required />
              </label>

              <label class="input-group">
                <span>CVV</span>
                <input v-model.trim="form.cvv" inputmode="numeric" placeholder="123" required />
              </label>
            </div>
          </section>

          <section class="checkout-section review">
            <div class="checkout-section-heading">
              <div>
                <p class="eyebrow">Review</p>
                <h3>Confirm simulated order.</h3>
              </div>
            </div>

            <div class="review-lines">
              <div class="summary-row">
                <span>Items</span>
                <strong>{{ store.cartCount }}</strong>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <strong>{{ shippingLabel }}</strong>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <strong>{{ formatEuro(checkoutTotal) }}</strong>
              </div>
            </div>

            <p v-if="!checkoutReady" class="form-hint">
              Complete the required delivery and simulated payment fields before placing the order.
            </p>

            <button class="button full-width" type="submit" :disabled="!checkoutReady">
              Place simulated order
            </button>
          </section>
        </form>
      </aside>
    </div>

    <div v-else class="empty-state empty-cart">
      <h2>Your cart is empty</h2>
      <p>Add items from the shop to continue.</p>
      <RouterLink class="button" to="/shop">Browse products</RouterLink>
    </div>

    <section v-if="order" class="order-confirmation">
      <p class="eyebrow">Order confirmed</p>
      <h2>{{ order.id }}</h2>
      <p>
        Thanks {{ order.name }} - this is a simulated checkout, so no payment was taken.
        Your order has been recorded and the cart has been cleared.
      </p>
      <RouterLink class="button button-soft" to="/shop">Continue shopping</RouterLink>
    </section>

    <AssistantPanel />
    <HelpPanel />
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { useProductStore } from "../stores/productStore"
import AssistantPanel from "../components/AssistantPanel.vue"
import HelpPanel from "../components/HelpPanel.vue"

const store = useProductStore()
const order = ref(store.lastOrder)

const euroFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
})

const form = reactive({
  name: "",
  email: "",
  address: "",
  shippingMethod: "standard",
  cardNumber: "",
  expiry: "",
  cvv: "",
})

const selectedShippingCost = computed(() => (form.shippingMethod === "express" ? 5 : 0))
const shippingLabel = computed(() => (form.shippingMethod === "express" ? "Express delivery" : "Standard delivery"))
const checkoutTotal = computed(() =>
  Number((store.subtotal + store.tax + selectedShippingCost.value).toFixed(2)),
)
const formattedTotal = computed(() => euroFormatter.format(checkoutTotal.value))
const cartSummaryText = computed(() => {
  const itemLabel = store.cartCount === 1 ? "item" : "items"
  return `${itemLabel} in your bag`
})

const deliveryComplete = computed(() => Boolean(form.name && form.email && form.address))
const paymentComplete = computed(() => Boolean(form.cardNumber && form.expiry && form.cvv))
const checkoutReady = computed(() => deliveryComplete.value && paymentComplete.value)
function completeCheckout() {
  if (!checkoutReady.value) {
    store.showToast("Please complete the checkout details first", "warning")
    return
  }

  order.value = store.completeCheckout({
    name: form.name,
    email: form.email,
    address: form.address,
    shippingMethod: form.shippingMethod,
    shippingCost: selectedShippingCost.value,
    paymentType: "Simulated card payment",
    total: checkoutTotal.value,
  })

  form.name = ""
  form.email = ""
  form.address = ""
  form.shippingMethod = "standard"
  form.cardNumber = ""
  form.expiry = ""
  form.cvv = ""
}

function formatEuro(value) {
  return euroFormatter.format(value)
}

</script>

