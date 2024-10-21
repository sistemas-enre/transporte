$(document).ready(function() {
    // Ocultar y mostrar el menú lateral
    $('#menu-toggle').click(function() {
        $('#sidebar').toggleClass('hidden');
        $('#main').toggleClass('full-width');
        $('#menu-icon').toggleClass('show');
    });

    $('#menu-icon .circle').click(function() {
        $('#sidebar').toggleClass('hidden');
        $('#main').toggleClass('full-width');
        $('#menu-icon').toggleClass('show');
    });

    // Función para verificar la altura del contenido y ajustar justify-content
    function checkContentHeight() {
        var contentHeight = $('#content>div')[0].scrollHeight;
        var windowHeight = $(window).height();
        
        if (contentHeight > windowHeight * 0.9) {
            console.log('normal', contentHeight,windowHeight* 0.9) ;
            $('#content>div').css('justify-content', 'normal');
        } else {
            console.log('center', contentHeight,windowHeight* 0.9) ;
            $('#content>div').css('justify-content', 'center');
        }
    }

    // Verificar la altura al cargar la página
    checkContentHeight();

    // Verificar la altura cada vez que el tamaño de la ventana cambie
    $(window).resize(function() {
        checkContentHeight();
    });
});
