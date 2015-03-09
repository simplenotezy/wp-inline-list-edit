var $ = jQuery;

$(document).ready(function() {


	/**
	 * When posttype change
	 * @param  {[type]} ) {		buildTable();	} [description]
	 * @return {[type]}   [description]
	 */
		
		$('#post_type').change(function() {
			buildTable();
		});

	/**
	 * Post columns
	 * @type {[type]}
	 */
	
		$("#post_columns").tagit({
			availableTags: wpInlineListEdit.post_columns
		});

	/**
	 * Post meta tags
	 */
	
		$("#post_meta").tagit({
			availableTags: wpInlineListEdit.post_meta,
			afterTagRemoved: function() {
				buildTable();
			},
			afterTagAdded: function() {
				buildTable();
			}
		});

	/**
	 * Build table on click
	 * @param  {[type]} ) {		buildTable();	} [description]
	 * @return {[type]}   [description]
	 */

		$('body').on('click', '#generate_table', function() {
			buildTable();
		});

	/**
	 * On click change featured image
	 */

		// Uploading files
		var file_frame, post_editing;
		$('#theInlineTable').on('click', '.wp_inline_edit .featured-image a', function( event ){
			console.log('You clicked');

			event.preventDefault();

			// link clicked
			post_editing = post_editing_container = $(this).parents('.wp_inline_edit').attr('data-post-id');

			// If the media frame already exists, reopen it.
			if ( file_frame )
				return file_frame.open();

			// Create the media frame.
			file_frame = wp.media.frames.file_frame = wp.media({
				title: jQuery( this ).data( 'uploader_title' ),
				button: {
					text: jQuery( this ).data( 'uploader_button_text' ),
				},
				multiple: false  // Set to true to allow multiple files to be selected
			});

			// When an image is selected, run a callback.
			file_frame.on( 'select', function() {
				// We set multiple to false so only get one image from the uploader
				attachment = file_frame.state().get('selection').first().toJSON();

				// Do something with attachment.id and/or attachment.url here
				// write the selected image url to the value of the #cupp_meta text field
				
				var post_editing_container = $('#theInlineTable .wp_inline_edit[data-post-id="' + post_editing + '"]');

				post_editing_container.find('.featured-image img').attr('src', attachment.url).show(); // set featured image
				post_editing_container.find('.featured-image input[type="hidden"]').val(attachment.id).trigger('change'); // set attachment id

				// jQuery('#cupp_meta').val('');
				// jQuery('#cupp_upload_meta').val(attachment.url);
				// jQuery('#cupp_upload_edit_meta').val('/wp-admin/post.php?post='+attachment.id+'&action=edit&image-editor');
				// jQuery('.cupp-current-img').attr('src', attachment.url).removeClass('placeholder');
			});

			// Finally, open the modal
			file_frame.open();
		});

	/**
	 * When fields change
	 */

	 	var data, wpile_creating_new_post = null;
		$('#theInlineTable').on('change', '.wp_inline_edit input, .wp_inline_edit select, .wp_inline_edit textarea', function() {
			
			console.log('Input changed!');

			/**
			 * Get general data
			 * @type {[type]}
			 */
			
				var line = $(this).parents('.wp_inline_edit');
				var checkContainer = line.find('th.check-column');
				var post_id = line.attr('data-post-id');

			/**
			 * 
			 */
			
			 	if(wpile_creating_new_post && !post_id) {
			 		console.log($(this));
			 		$(this).focus().focus();
			 		var that = $(this);
			 		setTimeout(function() { that.focus(); }, 100);
			 		alert('This post is currently being created. Please don\'t chage any fields before it is created');
			 		$(this).focus().focus();
			 		return false;
			 	}
			
			/**
			 * Mode
			 *
			 * Edit / add
			 */
			
				if(!post_id) {
					/**
					 * Create
					 */
						
						/**
						 * Append a new line
						 */
						
							appendEmptyLineToTable();


						/**
						 * Prepare post request
						 */
						
							 data = {
							 	'action': 'wpille_add_post',
							 	'post': {
							 		post_type: $('#post_type').val(),
							 		fields: [],
							 		meta: [],
							 	}
							 };

						/**
						 * Global "creating" flag to prevent save untill created
						 */
						
							wpile_creating_new_post = true;

						/**
						 * Get all fields 
						 */
							
						 	line.find('input, select').each(function () {

								var input = $(this).val();
								var column = $(this).data('type');
								var name = $(this).data('name');

								var dataContainer = (column == 'post_column') ? data.post.fields : ((column == 'post_meta') ? data.post.meta : null);

								if(dataContainer)
									dataContainer.push({
										name: name,
										value: input
									});
						 	});
				} else {
					/**
					 * Single edit
					 */
					
						/**
						 * Data about edited field
						 */

							var input = $(this).val();
							var column = $(this).data('type');
							var name = $(this).data('name');

						/**
						 * Post parameters
						 */

							data = {
								'action': 'wpille_edit_post',
								'post_id': post_id,
								'column': column,
								'name': name,
								'value': input
							};

				}

			/**
			 * Append loading
			 */

				checkContainer.append('<div class="spinner" style="display:inline;"></div>');
				checkContainer.find('input').hide();

			/**
			 * Send request
			 */
				console.log(data);

				$.ajax({
					type: 'POST',
					url: ajaxurl,
					data: data,
					success: function(response) {
						
						console.log(response);

						/* reset flag */
						wpile_creating_new_post = false;

						/* make json */
						response = JSON.parse(response);

						/* stop lading */
						checkContainer.find('.spinner').remove();
						checkContainer.find('input').show();

						/* set id if created */
						if(response.created)
							line.attr('data-post-id', response.post_id); // add attribute
					}
				});
		});
});

function generate_table_query() {
	var query = '&post_type=' + $('#post_type').val();

	var post_columns = $("#post_columns").tagit("assignedTags");	
	var post_meta = $("#post_meta").tagit("assignedTags");


	query += '&fields=' + post_columns.join(',');
	query += '&meta=' + post_meta.join(',');

	return query;
}

function buildTable() {
	$.get(wpInlineListEdit.site_url + '/wp-admin/?wpInlineListEditTable' + generate_table_query(), function(response) {
		$('#theInlineTable').html(response);

		appendEmptyLineToTable();
	});
}

function appendEmptyLineToTable() {
	var row = $('#theInlineTable table tbody tr:last-child')[0].outerHTML;
	$('#theInlineTable table tbody').append(row);

	 $('#theInlineTable table tbody tr:last-child').attr('data-post-id', '').find('input, select, textarea').each(function() {
		$(this).val('');

		if($(this).is('select'))
			$(this).find('option').removeAttr('selected');

		if($(this).data('name') == 'post_type') {
			$(this).find('option[value="' + $('#post_type').val() + '"]').attr('selected', 'selected');
		} else if($(this).data('name') == 'post_status') {
			$(this).find('option[value="publish"]').attr('selected', 'selected');
		} else {
			$(this).find('option:first-child').attr('selected', 'selected');
		}
	 });
}

function rememberSettings() {
	localStorage.wpInlineListEditSettings = {

	};
}