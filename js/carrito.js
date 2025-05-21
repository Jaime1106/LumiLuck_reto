// js/carrito.js
document.addEventListener('DOMContentLoaded', () => {
    const filasItems = document.querySelectorAll('.item-carrito-row');
    const actualizarCarritoBtn = document.getElementById('actualizarCarritoBtn');
    // ... otros selectores para el resumen, etc.

    function calcularSubtotalItem(fila) {
        const precioUnitarioEl = fila.querySelector('.precio-unitario-carrito');
        const cantidadInput = fila.querySelector('.input-cantidad');
        const subtotalItemEl = fila.querySelector('.subtotal-item-carrito');

        const precioUnitario = parseFloat(precioUnitarioEl.dataset.price);
        const cantidad = parseInt(cantidadInput.value);

        if (!isNaN(precioUnitario) && !isNaN(cantidad)) {
            const subtotal = precioUnitario * cantidad;
            subtotalItemEl.textContent = `$${subtotal.toFixed(2)}`;
            return subtotal;
        }
        return 0;
    }

    function actualizarResumenTotal() {
        let subtotalGeneral = 0;
        filasItems.forEach(fila => {
            // Asegurarse de que el subtotal del item se recalculó o leerlo
            const subtotalItemTexto = fila.querySelector('.subtotal-item-carrito').textContent;
            subtotalGeneral += parseFloat(subtotalItemTexto.replace('$', ''));
        });

        document.getElementById('resumenSubtotal').textContent = `$${subtotalGeneral.toFixed(2)}`;
        // Aquí lógica para envío, descuentos, etc.
        document.getElementById('resumenTotal').textContent = `$${subtotalGeneral.toFixed(2)}`; // Simplificado por ahora

        // Actualizar el contador del carrito en el header
        const cartCountEl = document.querySelector('header .cart-count');
        if (cartCountEl) {
            // Aquí deberías contar el número real de diferentes productos o la suma de cantidades
            // Por ahora, un placeholder basado en filas visible
            let totalItems = 0;
            document.querySelectorAll('.item-carrito-row:not(.fila-oculta-por-eliminar)').forEach(fila => {
                totalItems += parseInt(fila.querySelector('.input-cantidad').value);
            });
            cartCountEl.textContent = totalItems;
        }
    }

    // Event listeners para inputs de cantidad
    filasItems.forEach(fila => {
        const cantidadInput = fila.querySelector('.input-cantidad');
        cantidadInput.addEventListener('change', () => {
            calcularSubtotalItem(fila);
            // No actualizamos el resumen total aquí directamente,
            // sino cuando el usuario presione "Actualizar Carrito"
            // o podríamos hacerlo en tiempo real si se prefiere.
        });

        // Botón eliminar item
        const btnEliminar = fila.querySelector('.btn-eliminar-item');
        btnEliminar.addEventListener('click', () => {
            fila.remove(); // Elimina la fila del DOM
            // Si usaras un array de datos, también lo eliminarías del array
            actualizarResumenTotal(); // Recalcular todo después de eliminar
            if (document.querySelectorAll('.item-carrito-row').length === 0) {
                // Mostrar mensaje de carrito vacío
                const tbody = document.querySelector('.items-carrito tbody');
                tbody.innerHTML = '<tr class="carrito-vacio-mensaje"><td colspan="6">Tu carrito está vacío. <a href="productos.html">¡Empieza a comprar!</a></td></tr>';
            }
        });
    });

    // Botón Actualizar Carrito
    if (actualizarCarritoBtn) {
        actualizarCarritoBtn.addEventListener('click', () => {
            filasItems.forEach(fila => { // Recalcular todos los subtotales de items
                calcularSubtotalItem(fila);
            });
            actualizarResumenTotal(); // Luego actualizar el resumen general
            alert('Carrito actualizado!'); // Feedback simple
        });
    }
    
    // Cargar y calcular totales iniciales al cargar la página
    filasItems.forEach(fila => {
        calcularSubtotalItem(fila);
    });
    actualizarResumenTotal();

});