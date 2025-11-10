// HFRP Relief - Stripe Connect Dashboard JavaScript
class ConnectDashboard {
  constructor() {
    this.currentAccountId = null;
    this.accountId = localStorage.getItem('accountId');
    this.productsList = document.getElementById('products-list');
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadAccountFromUrl();
    this.initializeWorkflow();
    this.createQuickAccessLinks();
  }

  // Initialize automated workflow
  initializeWorkflow() {
    if (this.accountId) {
      this.currentAccountId = this.accountId;
      this.fetchProducts();
      this.loadAccountInfo();
    }
  }

  // Create quick access div links for easy navigation
  createQuickAccessLinks() {
    const quickAccessContainer = document.getElementById('quick-access');
    if (!quickAccessContainer) return;

    const links = [
      { title: 'Dashboard', url: '/admin/connect', icon: '📊' },
      { title: 'Products', url: '/admin/connect#products', icon: '🛍️' },
      { title: 'Account Info', url: '/admin/connect#account', icon: '👤' },
      { title: 'Success Page', url: '/admin/connect/success', icon: '✅' },
      { title: 'Stripe Dashboard', url: '#', icon: '💳', action: 'openStripeDashboard' }
    ];

    quickAccessContainer.innerHTML = links.map(link => `
      <div class="quick-link-card" ${link.action ? `onclick="connectDashboard.${link.action}()"` : `onclick="window.location.href='${link.url}'"`}>
        <div class="quick-link-icon">${link.icon}</div>
        <div class="quick-link-title">${link.title}</div>
      </div>
    `).join('');
  }

  bindEvents() {
    // Account creation form
    const accountForm = document.getElementById('accountForm');
    if (accountForm) {
      accountForm.addEventListener('submit', (e) => this.handleAccountCreation(e));
    }

    // Product creation form
    const productForm = document.getElementById('productForm');
    if (productForm) {
      productForm.addEventListener('submit', (e) => this.handleProductCreation(e));
    }

    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
    }

    // Account selection
    const accountSelect = document.getElementById('accountSelect');
    if (accountSelect) {
      accountSelect.addEventListener('change', (e) => this.handleAccountChange(e));
    }

    // Refresh buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('refresh-products')) {
        this.loadProducts();
      }
      if (e.target.classList.contains('refresh-account')) {
        this.loadAccountInfo();
      }
    });
  }

  loadAccountFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get('account') || urlParams.get('success');
    
    if (accountId) {
      this.currentAccountId = accountId;
      this.loadAccountInfo();
      this.loadProducts();
    }
  }

  async handleAccountCreation(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');

    if (!email) {
      this.showMessage('Email is required', 'error');
      return;
    }

    try {
      this.showLoading('Creating Connect account...');
      
      const response = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        this.showMessage('Account created successfully! Creating onboarding link...', 'success');
        
        // Store account ID for later use
        this.currentAccountId = data.accountId;
        localStorage.setItem('accountId', data.accountId);
        
        // Create account link for onboarding
        const linkResponse = await fetch('/api/create-account-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accountId: data.accountId }),
        });
        
        const linkData = await linkResponse.json();
        
        if (linkData.success) {
          this.showMessage('Redirecting to onboarding...', 'success');
          setTimeout(() => {
            window.location.href = linkData.url;
          }, 1500);
        } else {
          this.showMessage(`Error creating onboarding link: ${linkData.error}`, 'error');
        }
      } else {
        this.showMessage(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Account creation error:', error);
      this.showMessage('Failed to create account. Please try again.', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async handleProductCreation(e) {
    e.preventDefault();
    
    if (!this.currentAccountId) {
      this.showMessage('Please select or create an account first', 'error');
      return;
    }

    const formData = new FormData(e.target);
    const productData = {
      accountId: this.currentAccountId,
      productName: formData.get('name'),
      productDescription: formData.get('description'),
      productPrice: parseInt(formData.get('price')) * 100, // Convert to cents
    };

    try {
      this.showLoading('Creating product...');
      
      const response = await fetch('/api/create-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.success) {
        this.showMessage('Product created successfully!', 'success');
        e.target.reset();
        this.loadProducts(); // Refresh product list
      } else {
        this.showMessage(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Product creation error:', error);
      this.showMessage('Failed to create product. Please try again.', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const priceId = formData.get('priceId');
    const customerEmail = formData.get('customerEmail');

    if (!priceId) {
      this.showMessage('Please select a product', 'error');
      return;
    }

    try {
      this.showLoading('Creating checkout session...');
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: this.currentAccountId,
          priceId: priceId,
          applicationFeeAmount: 123, // Optional application fee
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.showMessage('Redirecting to checkout...', 'success');
        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
      } else {
        this.showMessage(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Checkout creation error:', error);
      this.showMessage('Failed to create checkout session. Please try again.', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async loadAccountInfo() {
    if (!this.currentAccountId) return;

    try {
      const response = await fetch(`/api/stripe/connect/account?accountId=${this.currentAccountId}`);
      const data = await response.json();

      if (data.success) {
        this.displayAccountInfo(data.account);
      } else {
        this.showMessage(`Error loading account: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Account loading error:', error);
      this.showMessage('Failed to load account information', 'error');
    }
  }

  async loadProducts() {
    if (!this.currentAccountId) return;

    try {
      const response = await fetch(`/api/stripe/connect/products?accountId=${this.currentAccountId}`);
      const data = await response.json();

      if (data.success) {
        this.displayProducts(data.products);
      } else {
        this.showMessage(`Error loading products: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Products loading error:', error);
      this.showMessage('Failed to load products', 'error');
    }
  }

  displayAccountInfo(account) {
    const accountInfo = document.getElementById('accountInfo');
    if (!accountInfo) return;

    accountInfo.innerHTML = `
      <div class="account-details">
        <h3>Account Information</h3>
        <p><strong>ID:</strong> ${account.id}</p>
        <p><strong>Email:</strong> ${account.email || 'Not provided'}</p>
        <p><strong>Charges Enabled:</strong> ${account.charges_enabled ? 'Yes' : 'No'}</p>
        <p><strong>Payouts Enabled:</strong> ${account.payouts_enabled ? 'Yes' : 'No'}</p>
        <p><strong>Details Submitted:</strong> ${account.details_submitted ? 'Yes' : 'No'}</p>
        <p><strong>Created:</strong> ${new Date(account.created * 1000).toLocaleDateString()}</p>
      </div>
    `;
  }

  displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    if (products.length === 0) {
      productsContainer.innerHTML = '<p class="text-muted-foreground">No products found for this account.</p>';
      return;
    }

    const productsHtml = products.map(product => `
      <div class="product-card">
        <h4>${product.name}</h4>
        <p class="price">$${(product.default_price?.unit_amount / 100).toFixed(2)}</p>
        <p class="description">${product.description || 'No description'}</p>
        <form class="checkout-form" onsubmit="connectDashboard.handleCheckout(event)">
          <input type="hidden" name="priceId" value="${product.default_price?.id}">
          <input type="hidden" name="accountId" value="${this.currentAccountId}">
          <button type="submit" class="btn btn-primary">Buy Now</button>
        </form>
      </div>
    `).join('');

    productsContainer.innerHTML = productsHtml;
  }

  // Enhanced product fetching with automated workflow
  async fetchProducts() {
    if (!this.accountId) return;

    try {
      const response = await fetch(`/api/products/${this.accountId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const products = await response.json();
      this.renderProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      this.showMessage('Failed to fetch products', 'error');
    }
  }

  // Enhanced product rendering with template cloning
  renderProducts(products) {
    if (!this.productsList) return;

    if (products.length === 0) {
      this.productsList.innerHTML = "<p>No products found</p>";
      return;
    }

    // Get the template but don't remove it from DOM
    const templateProductDiv = document.querySelector(".product.hidden");
    if (!templateProductDiv) {
      // Fallback to regular display if no template
      this.displayProducts(products);
      return;
    }

    // Clear existing products (non-template items)
    const existingProducts = this.productsList.querySelectorAll(".product:not(.hidden)");
    existingProducts.forEach((product) => product.remove());

    products.forEach(product => {
      const productDiv = templateProductDiv.cloneNode(true);
      productDiv.classList.remove('hidden');

      productDiv.setAttribute('data-key', product.name);
      const nameEl = productDiv.querySelector('.product-name');
      if (nameEl) nameEl.textContent = product.name;

      const priceEl = productDiv.querySelector('.product-price');
      if (priceEl) {
        priceEl.textContent = `$${product.default_price?.unit_amount / 100}`;
        if (product.default_price?.recurring?.interval) {
          priceEl.textContent += ` / ${product.default_price.recurring.interval}`;
        }
      }

      const priceIdInput = productDiv.querySelector('input[name="priceId"]');
      if (priceIdInput) priceIdInput.value = product.default_price?.id;

      const accountIdInput = productDiv.querySelector('input[name="accountId"]');
      if (accountIdInput) accountIdInput.value = this.accountId;

      this.productsList.appendChild(productDiv);
    });
  }

  // Open Stripe Dashboard with login link
  async openStripeDashboard() {
    if (!this.accountId) {
      this.showMessage('No account selected', 'error');
      return;
    }

    try {
      const response = await fetch('/api/stripe/connect/login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: this.accountId })
      });

      const data = await response.json();
      if (response.ok && data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback to generic dashboard URL
        window.open(`https://dashboard.stripe.com/${this.accountId}`, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Login link error:', error);
      window.open(`https://dashboard.stripe.com/${this.accountId}`, '_blank', 'noopener,noreferrer');
    }
  }

  handleAccountChange(e) {
    this.currentAccountId = e.target.value;
    if (this.currentAccountId) {
      this.loadAccountInfo();
      this.loadProducts();
    }
  }

  showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('messages') || this.createMessageDiv();
    messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageDiv.innerHTML = '';
    }, 5000);
  }

  createMessageDiv() {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'messages';
    messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000;';
    document.body.appendChild(messageDiv);
    return messageDiv;
  }

  showLoading(message = 'Loading...') {
    const loadingDiv = document.getElementById('loading') || this.createLoadingDiv();
    loadingDiv.innerHTML = `<div class="loading-message">${message}</div>`;
    loadingDiv.style.display = 'block';
  }

  hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }

  createLoadingDiv() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1001; background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 5px; display: none;';
    document.body.appendChild(loadingDiv);
    return loadingDiv;
  }
}

// Initialize dashboard when DOM is ready
let connectDashboard;
document.addEventListener('DOMContentLoaded', () => {
  connectDashboard = new ConnectDashboard();
  window.connectDashboard = connectDashboard; // Make globally accessible
});

// Export functions for external use
window.fetchProducts = async function() {
  if (connectDashboard) {
    return await connectDashboard.fetchProducts();
  }
};

window.renderProducts = function(products) {
  if (connectDashboard) {
    return connectDashboard.renderProducts(products);
  }
};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConnectDashboard, fetchProducts: window.fetchProducts, renderProducts: window.renderProducts };
}