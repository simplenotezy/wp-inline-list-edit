(function ($) {
  $.fn.formNavigation = function () {
    $(this).each(function () {

      $(this).on('keyup', 'input, select, textarea', function(e) {
        switch (e.which) {
          
          case 39:
            if(e.shiftKey) {
              console.log('We have shift. Go focus');
              $(this).closest('td').next().find('input, select, textarea').focus();
              
            }
          break;
          
          case 37:

            if(e.shiftKey) {
              console.log('We have shift. Go focus');
              $(this).closest('td').prev().find('input, select, textarea').focus();
            }
          break;
          
          case 40:
            if(!$(".ui-autocomplete").is(":visible"))
              $(this).closest('tr').next().children().eq($(this).closest('td').index()).find('input, select, textarea').focus();
          break;
          
          case 38:

            if(!$(".ui-autocomplete").is(":visible"))
              $(this).closest('tr').prev().children().eq($(this).closest('td').index()).find('input, select, textarea').focus();
          break;
        }
      });
    });
  };
})(jQuery);