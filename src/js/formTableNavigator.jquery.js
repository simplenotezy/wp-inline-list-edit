(function ($) {
  $.fn.formNavigation = function () {
    $(this).each(function () {
      $(this).find('input, select, textarea').on('keyup', function(e) {
        switch (e.which) {
          case 39:
            if(e.shiftKey) {
              $(this).closest('td').next().find('input, select, textarea').focus(); break;
              return false;
              
            }
          case 37:
            if(e.shiftKey) {
              $(this).closest('td').prev().find('input, select, textarea').focus(); break;
              return false;
            }
          case 40:
            $(this).closest('tr').next().children().eq($(this).closest('td').index()).find('input, select, textarea').focus(); break;
          case 38:
            $(this).closest('tr').prev().children().eq($(this).closest('td').index()).find('input, select, textarea').focus(); break;
        }
      });
    });
  };
})(jQuery);