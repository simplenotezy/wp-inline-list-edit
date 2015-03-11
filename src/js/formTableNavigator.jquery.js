(function ($) {
  $.fn.formNavigation = function () {
    $(this).each(function () {

      $(this).on('keyup', 'input, select, textarea', function(e) {
        switch (e.which) {
          
          case 39:
            console.log('This is case 39', e.which);
            if(e.shiftKey) {
              console.log('We have shift. Go focus');
              $(this).closest('td').next().find('input, select, textarea').focus();
              
            }
          break;
          
          case 37:
            console.log('This is case 37', e.which);

            if(e.shiftKey) {
              console.log('We have shift. Go focus');
              $(this).closest('td').prev().find('input, select, textarea').focus();
            }
          break;
          
          case 40:
            console.log('This is case 40', e.which);

            $(this).closest('tr').next().children().eq($(this).closest('td').index()).find('input, select, textarea').focus();
          break;
          
          case 38:
            console.log('This is case 38', e.which);

            $(this).closest('tr').prev().children().eq($(this).closest('td').index()).find('input, select, textarea').focus();
          break;
        }
      });
    });
  };
})(jQuery);