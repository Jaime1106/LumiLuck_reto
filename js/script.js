// public/js/script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("LumiLuck Frontend JS Cargado!");

    const NOMBRE_LOCALSTORAGE_CARRITO = 'carritoLumiluck';

    // --- FUNCIONES GLOBALES DEL CARRITO ---
    function obtenerCarritoDesdeLocalStorage() {
        const carritoGuardado = localStorage.getItem(NOMBRE_LOCALSTORAGE_CARRITO);
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }

    function guardarCarritoEnLocalStorage(carrito) {
        localStorage.setItem(NOMBRE_LOCALSTORAGE_CARRITO, JSON.stringify(carrito));
    }

    let carritoItems = obtenerCarritoDesdeLocalStorage(); // Cargar carrito al inicio

    function actualizarContadorCarrito() {
        const cartCountElement = document.querySelector('header .cart-count');
        if (cartCountElement) {
            const totalItems = carritoItems.reduce((total, item) => total + item.cantidad, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    function anadirItemAlCarrito(producto) { // producto debe ser un objeto {id, nombre, precio, cantidad, imagen}
        const itemExistente = carritoItems.find(item => item.id === producto.id);
        if (itemExistente) {
            itemExistente.cantidad += producto.cantidad;
        } else {
            carritoItems.push(producto);
        }
        guardarCarritoEnLocalStorage(carritoItems);
        actualizarContadorCarrito();
    }

    // Actualizar contador al cargar cualquier página
    actualizarContadorCarrito();


    // --- PÁGINA DE PRODUCTOS (productos.html) ---
    if (document.querySelector('.catalogo-productos')) {
        const botonesAnadirAlCarrito = document.querySelectorAll('.add-to-cart-btn');
        botonesAnadirAlCarrito.forEach(boton => {
            boton.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPriceText = productCard.querySelector('.price').textContent;
                const productPrice = parseFloat(productPriceText.replace('$', ''));
                // Asegúrate que la ruta de la imagen sea relativa al servidor si guardas en localStorage
                // y la usarás en otra página. Si tu server.js sirve /images/, entonces está bien.
                const productImageSrc = productCard.querySelector('img').src;
                // Extraer solo la parte relativa de la imagen:
                const relativeImageSrc = productImageSrc.substring(productImageSrc.indexOf('/images/'));


                const productoParaAnadir = {
                    id: productId,
                    nombre: productName,
                    precio: productPrice,
                    cantidad: 1, // Siempre se añade 1 desde la tarjeta de catálogo
                    imagen: relativeImageSrc
                };
                
                anadirItemAlCarrito(productoParaAnadir);
                alert(`"${productName}" añadido al carrito!`);
                console.log('Carrito actual:', carritoItems);
            });
        });
    }


    // --- PÁGINA DE DETALLE DEL PRODUCTO ---
    if (document.querySelector('.detalle-producto-section')) {
        // Galería de Imágenes
        const imagenPrincipal = document.querySelector('.producto-imagenes .imagen-principal');
        const miniaturas = document.querySelectorAll('.galeria-miniaturas .miniatura');

        if (imagenPrincipal && miniaturas.length > 0) {
            miniaturas.forEach(miniatura => {
                miniatura.addEventListener('click', function() {
                    // Asumimos que el src de la miniatura ya es la ruta a la imagen grande (o una versión que el servidor puede entregar)
                    // O si usas una convención para cambiar de thumb a grande:
                    // let grandeSrc = this.src;
                    // if (this.src.includes('-thumb')) {
                    //     grandeSrc = this.src.replace(/-thumb\d*/, '-grande'); 
                    // } else if (this.dataset.grandeImagenUrl) {
                    //    grandeSrc = this.dataset.grandeImagenUrl;
                    // }
                    // imagenPrincipal.src = grandeSrc;
                    imagenPrincipal.src = this.src; // Más simple si la miniatura es la imagen correcta

                    miniaturas.forEach(m => m.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }

        // Añadir al carrito desde la página de detalle
        const btnAnadirDetalle = document.querySelector('.add-to-cart-detalle-btn');
        if (btnAnadirDetalle) {
            btnAnadirDetalle.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const productName = document.querySelector('.producto-info h1').textContent;
                const productPriceText = document.querySelector('.producto-info .precio-detalle').textContent;
                const productPrice = parseFloat(productPriceText.replace('$', ''));
                const cantidadInput = document.getElementById('cantidad');
                const cantidad = cantidadInput ? parseInt(cantidadInput.value) : 1;
                const productImageSrc = document.querySelector('.producto-imagenes .imagen-principal').src;
                const relativeImageSrc = productImageSrc.substring(productImageSrc.indexOf('/images/'));


                const productoParaAnadir = {
                    id: productId,
                    nombre: productName,
                    precio: productPrice,
                    cantidad: cantidad,
                    imagen: relativeImageSrc
                };
                
                anadirItemAlCarrito(productoParaAnadir);
                alert(`${cantidad} x "${productName}" añadido(s) al carrito!`);
                console.log('Carrito actual:', carritoItems);
            });
        }
    }


    // --- PÁGINA DEL CARRITO (carrito.html) ---
    if (document.querySelector('.pagina-carrito')) {
        const tbodyCarrito = document.querySelector('.items-carrito tbody');
        const resumenSubtotalEl = document.getElementById('resumenSubtotal');
        const resumenTotalEl = document.getElementById('resumenTotal');
        const actualizarCarritoBtn = document.getElementById('actualizarCarritoBtn');

        function renderizarItemsCarrito() {
            if (!tbodyCarrito) return;
            tbodyCarrito.innerHTML = ''; // Limpiar tabla

            if (carritoItems.length === 0) {
                tbodyCarrito.innerHTML = '<tr class="carrito-vacio-mensaje"><td colspan="6">Tu carrito está vacío. <a href="/pages/productos.html">¡Empieza a comprar!</a></td></tr>';
                actualizarResumenTotal(); // Asegura que los totales se pongan a 0
                return;
            }

            carritoItems.forEach((item, index) => {
                const subtotalItem = item.precio * item.cantidad;
                const filaHTML = `
                    <tr class="item-carrito-row" data-product-id="${item.id}" data-index="${index}">
                        <td class="imagen-producto-carrito">
                            <a href="/pages/detalles_productos/producto-detalle-${item.id}.html"> 
                                <img src="${item.imagen}" alt="${item.nombre}">
                            </a>
                        </td>
                        <td class="info-producto-carrito">
                            <a href="/pages/detalles_productos/producto-detalle-${item.id}.html">${item.nombre}</a>
                            ${item.sku ? `<small>SKU: ${item.sku}</small>` : ''}
                        </td>
                        <td class="precio-unitario-carrito" data-price="${item.precio}">$${item.precio.toFixed(2)}</td>
                        <td class="cantidad-carrito">
                            <input type="number" value="${item.cantidad}" min="1" max="10" class="input-cantidad" aria-label="Cantidad">
                        </td>
                        <td class="subtotal-item-carrito">$${subtotalItem.toFixed(2)}</td>
                        <td class="acciones-carrito">
                            <button class="btn-eliminar-item" aria-label="Eliminar item" title="Eliminar">×</button>
                        </td>
                    </tr>
                `;
                tbodyCarrito.insertAdjacentHTML('beforeend', filaHTML);
            });
            
            actualizarResumenTotal();
            asignarEventListenersItemsCarrito();
        }

        function actualizarResumenTotal() {
            if (!resumenSubtotalEl || !resumenTotalEl) return;

            const subtotalGeneral = carritoItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
            // Aquí iría lógica de envío y descuentos
            const totalGeneral = subtotalGeneral; // Simplificado

            resumenSubtotalEl.textContent = `$${subtotalGeneral.toFixed(2)}`;
            resumenTotalEl.textContent = `$${totalGeneral.toFixed(2)}`;
        }

        function asignarEventListenersItemsCarrito() {
            document.querySelectorAll('.item-carrito-row').forEach(fila => {
                const cantidadInput = fila.querySelector('.input-cantidad');
                const btnEliminar = fila.querySelector('.btn-eliminar-item');
                const itemIndex = parseInt(fila.dataset.index);

                if (cantidadInput) {
                    cantidadInput.addEventListener('change', function() {
                        let nuevaCantidad = parseInt(this.value);
                        if (nuevaCantidad < 1) nuevaCantidad = 1; // Mínimo 1
                        this.value = nuevaCantidad; // Actualizar el input por si el usuario puso 0 o negativo
                        
                        carritoItems[itemIndex].cantidad = nuevaCantidad;
                        // Recalcular subtotal de esta fila
                        const precioUnitario = parseFloat(carritoItems[itemIndex].precio);
                        const nuevoSubtotalItem = precioUnitario * nuevaCantidad;
                        fila.querySelector('.subtotal-item-carrito').textContent = `$${nuevoSubtotalItem.toFixed(2)}`;
                        
                        // No actualizamos el resumen total aquí directamente, 
                        // sino con el botón "Actualizar Carrito" o al eliminar.
                    });
                }

                if (btnEliminar) {
                    btnEliminar.addEventListener('click', function() {
                        carritoItems.splice(itemIndex, 1); // Eliminar del array
                        guardarCarritoEnLocalStorage(carritoItems);
                        renderizarItemsCarrito(); // Volver a dibujar la tabla y actualizar totales
                        actualizarContadorCarrito(); // Actualizar contador del header
                    });
                }
            });
        }

        if (actualizarCarritoBtn) {
            actualizarCarritoBtn.addEventListener('click', () => {
                // Ya se actualizan las cantidades en el array 'carritoItems' con el 'change' del input
                guardarCarritoEnLocalStorage(carritoItems);
                renderizarItemsCarrito(); // Para asegurar que todos los subtotales de items se recalculen y muestren
                alert('Carrito actualizado!');
            });
        }

        // Renderizar el carrito al cargar la página del carrito
        renderizarItemsCarrito();
    }


    // --- PÁGINA MI CUENTA (cuenta.html) ---
    if (document.querySelector('.pagina-mi-cuenta')) {
        const navLinksCuenta = document.querySelectorAll('.cuenta-navegacion a');
        const sectionsCuenta = document.querySelectorAll('.seccion-cuenta');

        navLinksCuenta.forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.id === 'cerrarSesion') {
                    alert('Cerrando sesión... (simulado)');
                    // localStorage.removeItem(NOMBRE_LOCALSTORAGE_CARRITO); // Opcional: limpiar carrito al cerrar sesión
                    // actualizarContadorCarrito();
                    // window.location.href = '/pages/login.html'; // Si tienes login
                    return;
                }
                
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                } else {
                    return; 
                }

                navLinksCuenta.forEach(nav => nav.classList.remove('active-nav-cuenta'));
                this.classList.add('active-nav-cuenta');

                const targetId = this.getAttribute('href').substring(1);
                sectionsCuenta.forEach(section => {
                    section.classList.toggle('activa', section.id === targetId);
                });
            });
        });
    }


    // --- FOOTER: Actualizar Año ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

}); // Fin de DOMContentLoaded