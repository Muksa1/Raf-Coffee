document.addEventListener('DOMContentLoaded', function() {
    // Общие функции из main.js
    const preloader = document.querySelector('.preloader');
    
    setTimeout(function() {
        preloader.classList.add('fade-out');
        
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 500);
    }, 1500);
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Корзина
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckout = document.getElementById('closeCheckout');
    const orderForm = document.getElementById('orderForm');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Переключение категорий меню
    const categoryTabs = document.querySelectorAll('.category-tab');
    const menuCategories = document.querySelectorAll('.menu-category');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Удаляем активный класс у всех табов и категорий
            categoryTabs.forEach(t => t.classList.remove('active'));
            menuCategories.forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс к выбранному табу и категории
            this.classList.add('active');
            document.getElementById(category).classList.add('active');
        });
    });
    
    // Открытие/закрытие корзины
    cartIcon.addEventListener('click', function() {
        cartSidebar.classList.add('active');
        updateCartUI();
    });
    
    closeCart.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
    });
    
    // Добавление товара в корзину
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const menuItem = this.closest('.menu-item');
            const itemName = menuItem.querySelector('.item-name').textContent;
            const itemPrice = parseInt(menuItem.querySelector('.item-price').textContent.replace(/\D/g, ''));
            
            addToCart(itemName, itemPrice);
            
            // Анимация добавления в корзину
            const cartIconRect = cartIcon.getBoundingClientRect();
            const buttonRect = this.getBoundingClientRect();
            
            const animationElement = document.createElement('div');
            animationElement.className = 'add-to-cart-animation';
            animationElement.innerHTML = '<i class="fas fa-coffee"></i>';
            animationElement.style.position = 'fixed';
            animationElement.style.left = `${buttonRect.left}px`;
            animationElement.style.top = `${buttonRect.top}px`;
            animationElement.style.color = '#8fb3a1';
            animationElement.style.fontSize = '20px';
            animationElement.style.zIndex = '10000';
            animationElement.style.pointerEvents = 'none';
            animationElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            document.body.appendChild(animationElement);
            
            setTimeout(() => {
                animationElement.style.left = `${cartIconRect.left}px`;
                animationElement.style.top = `${cartIconRect.top}px`;
                animationElement.style.opacity = '0';
                animationElement.style.transform = 'scale(0.5)';
            }, 10);
            
            setTimeout(() => {
                animationElement.remove();
            }, 600);
        });
    });
    
    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        saveCart();
        updateCartCount();
    }
    
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    }
    
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Ваша корзина пуста</p>';
            document.getElementById('subtotal').textContent = '0 ₸';
            document.getElementById('serviceFee').textContent = '0 ₸';
            document.getElementById('total').textContent = '0 ₸';
            return;
        }
        
        let subtotal = 0;
        
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} ₸</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <div class="cart-item-remove">
                    <i class="fas fa-times"></i>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
            
            // Обработчики для кнопок количества
            const minusBtn = cartItemElement.querySelector('.minus');
            const plusBtn = cartItemElement.querySelector('.plus');
            const quantityValue = cartItemElement.querySelector('.quantity-value');
            const removeBtn = cartItemElement.querySelector('.cart-item-remove');
            
            minusBtn.addEventListener('click', function() {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                    quantityValue.textContent = item.quantity;
                    saveCart();
                    updateCartUI();
                    updateCartCount();
                }
            });
            
            plusBtn.addEventListener('click', function() {
                item.quantity += 1;
                quantityValue.textContent = item.quantity;
                saveCart();
                updateCartUI();
                updateCartCount();
            });
            
            removeBtn.addEventListener('click', function() {
                cart = cart.filter(cartItem => cartItem.name !== item.name);
                saveCart();
                updateCartUI();
                updateCartCount();
            });
        });
        
        const serviceFee = Math.round(subtotal * 0.1);
        const total = subtotal + serviceFee;
        
        document.getElementById('subtotal').textContent = `${subtotal} ₸`;
        document.getElementById('serviceFee').textContent = `${serviceFee} ₸`;
        document.getElementById('total').textContent = `${total} ₸`;
    }
    
    // Оформление заказа
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Ваша корзина пуста');
            return;
        }
        
        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeCheckout.addEventListener('click', function() {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
	orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Получаем данные формы
    const tableNumber = document.getElementById('tableNumber').value.trim();
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    // Валидация
    if (!customerName || !customerPhone) {
        alert('Пожалуйста, заполните имя и телефон');
        return;
    }

    // Расчет суммы
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const serviceFee = Math.round(subtotal * 0.1);
    const total = subtotal + serviceFee;
    
    // Формируем сообщение
    const orderDetails = cart.map(item => 
        `${item.name} x${item.quantity} - ${item.price * item.quantity} ₸`
    ).join('\n');
    
    const messageText = `Новый заказ!\n\nСтолик: ${tableNumber || 'не указан'}\nИмя: ${customerName}\nТелефон: ${customerPhone}\n\nЗаказ:\n${orderDetails}\n\nСумма: ${subtotal} ₸\nОбслуживание: ${serviceFee} ₸\nИтого: ${total} ₸\n\nПримечания: ${notes || 'нет'}`;
    
    try {
        // Отправка в Telegram
        const botToken = '7376725168:AAFc_AmEl_q__acgOKq5tZblMCLJFb49EtE';
        const chatId = '-1002625893973';
        
        // Правильное кодирование URL
        const encodedMessage = encodeURIComponent(messageText);
        const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}`;
        
        const response = await fetch(url);
        const data = await response.json(); // Добавляем разбор JSON ответа
        
        if (data.ok) {
            alert('Ваш заказ отправлен! Скоро с вами свяжутся.');
            
            // Очищаем корзину
            cart = [];
            saveCart();
            updateCartUI();
            updateCartCount();
            
            // Закрываем модальные окна
            checkoutModal.classList.remove('active');
            cartSidebar.classList.remove('active');
            document.body.style.overflow = '';
            
            // Очищаем форму
            orderForm.reset();
        } else {
            throw new Error(data.description || 'Ошибка при отправке заказа');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.');
    }
});
    
    // Закрытие модального окна при клике вне его
    checkoutModal.addEventListener('click', function(e) {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Инициализация корзины
    updateCartCount();
    
    // Анимация элементов меню при скролле
    const animateMenuItems = function() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach((item, index) => {
            const itemPosition = item.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (itemPosition < windowHeight - 100) {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    };
    
    window.addEventListener('scroll', animateMenuItems);
    animateMenuItems();
});