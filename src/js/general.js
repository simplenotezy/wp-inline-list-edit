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
	 * Taxonomies
	 */
	
		$("#taxonomies").tagit({
			availableTags: wpInlineListEdit.taxonomies,
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

		$('body').on('click', '#generate_table', function(event) {
			event.preventDefault();

			buildTable();
		});

	/**
	 * Set inputs to last saved values
	 */
	
		setInputsToLastSaved();
		buildTable();

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
	 * When you edit an textarea
	 */
	

		var editing_textarea = null, editing_type = null;

		var textareaDialog = $( "#textarea-modal" ).dialog({
			autoOpen: false,
            draggable: false,
            resizable: false,
            modal: true,
            width:'80%',
			buttons: {
				Close: function() {
					textareaDialog.dialog( "close" );
				}
			},
			close: function() {
				// form[ 0 ].reset();
				// allFields.removeClass( "ui-state-error" );
				
				var content;
				if(editing_type == 'tinymce') {
					content = tinyMCE.activeEditor.getContent();
				} else {
					content = $('.ui-dialog .default-editor textarea').val();
				}

				console.log(content, editing_textarea);
				
				editing_textarea.val(content).trigger('change');
			},
			open: function() {
				$('.ui-widget-overlay').bind('click', function () { $(this).siblings('.ui-dialog').find('.ui-dialog-content').dialog('close'); });
			}
		});

		 $('#theInlineTable').on('click', '.wp_inline_edit .triggerTextareaModal', function() {

		 	var source = $(this).parents('td').find('input, textarea, select');

			editing_textarea = source;
			
			textareaDialog.find('#wp-textarea-editor-wrap, .default-editor').hide(); // hide all editors

			textareaDialog.dialog( "open" );

			$('.ui-dialog-title').text('Edit ' + wpille_keyToReadable(source.data('name')));

			/**
			 * Editor specific behaviour
			 */
			
				if($(this).hasClass('tinyMCE')) {
					editing_type = 'tinymce';
					/**
					 * Tiny MCE editor
					 */
					
						textareaDialog.find('#wp-textarea-editor-wrap').show();

						tinyMCE.activeEditor.setContent(source.val());
						tinyMCE.activeEditor.execCommand('mceFocus', false, tinyMCE.activeEditor.id);
				} else {
					console.log('default editor', $('.ui-dialog .default-editor').find('textarea'));
					editing_type = 'default';

					/**
					 * Default editor
					 */
					
						$('.ui-dialog .default-editor').show().find('textarea').val(source.val()).focus();
				}
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
			 * If creating new post, and changing field, avoid
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

				post_is_loading(post_id, true);

			/**
			 * Send request
			 */
			
				wpille_send_request(data, function(response) {

					/* stop loading */
					post_is_loading(post_id, false);

					/* reset flag */
					wpile_creating_new_post = false;

					/* set id if created */
					if(response.created)
						line.attr('data-post-id', response.post_id); // add attribute

				});
		});
});


function wpille_send_request(data, callback) {
	/**
	 * Send request
	 */

		$.ajax({
			type: 'POST',
			url: ajaxurl,
			data: data,
			success: function(response) {

				/* make json */
				response = JSON.parse(response);

				if(typeof callback === 'function')
					callback(response);
			}
		});
}

function post_is_loading(post_id, loading) {
	var line = $('.wp_inline_edit[data-post-id="' + post_id + '"]');
	var checkContainer = line.find('th.check-column');

	if(loading) {

		if(checkContainer.find('.spinner').length === 0) {
			checkContainer.append('<div class="spinner" style="display:inline;"></div>');
			checkContainer.find('input').hide();
		}

	} else {
		checkContainer.find('.spinner').remove();
		checkContainer.find('input').show();
	}
}

function generate_table_query() {
	var query = '&post_type=' + $('#post_type').val();

	var post_columns = $("#post_columns").tagit("assignedTags");	
	var post_meta = $("#post_meta").tagit("assignedTags");
	var taxonomies = $("#taxonomies").tagit("assignedTags");


	query += '&fields=' + post_columns.join(',');
	query += '&meta=' + post_meta.join(',');
	query += '&taxonomies=' + taxonomies.join(',');


	return query;
}

var buildTableRequest = null, originalSubmitText = null;
function buildTable() {
	rememberInputs();

	var query = wpInlineListEdit.site_url + '/wp-admin/?wpInlineListEditTable' + generate_table_query();
	
	console.log(query);

	if(buildTableRequest)
		buildTableRequest.abort();

	if(!originalSubmitText)
		originalSubmitText = $('button#generate_table').html();

	$('button#generate_table').html('Generating...').prop('disabled', 'disabled');

	buildTableRequest = $.get(query, function(response) {
		$('button#generate_table').html(originalSubmitText).prop('disabled', false);
		$('#theInlineTable').html(response);

		appendEmptyLineToTable();

		$('#theInlineTable table').formNavigation();

		$(".taxonomy_tag_it").tagit({
			autocomplete: {
				source: function(search, choice) {
					var taxonomy = $(this.element).data('taxonomy');
					var tags = [];

					$(wpInlineListEdit.taxonomies_terms).each(function() {
						if(this.taxonomy == taxonomy)
							tags.push(this.slug);
					});

                    var filter = search.term.toLowerCase();
                    var tags_filtered = $.grep(tags, function(element) {
                        // Only match autocomplete options that begin with the search term.
                        // (Case insensitive.)
                        return (element.toLowerCase().indexOf(filter) === 0);
                    });

					choice(tags_filtered);
				},
			},
			afterTagRemoved: afterTaxonmyChanged,
			afterTagAdded: afterTaxonmyChanged
		});
	});
}

function afterTaxonmyChanged(trigger, event) {
	if(event.duringInitialization)
		return;

	var line = $(this).parents('.wp_inline_edit');
	var taxonomy = $(this).data('taxonomy');
	var post_id = line.attr('data-post-id'); // check with post_id

	var data = {
		'action': 'wpille_edit_taxonomy',
		'post_id': post_id,
		'taxonomy': taxonomy,
		'tags': $(this).tagit("assignedTags")
	};

	/**
	 * Append loading
	 */

		post_is_loading(post_id, true);

	/**
	 * Send request
	 */
	
		wpille_send_request(data, function(response) {
			/* stop loading */
			post_is_loading(post_id, false);
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

function rememberInputs() {
	if(!localStorageSupported())
		return;

	localStorage.setObj('wpInlineListEditSettings.post_type', $('#post_type').val());
	localStorage.setObj('wpInlineListEditSettings.post_columns', $("#post_columns").tagit("assignedTags"));
	localStorage.setObj('wpInlineListEditSettings.post_meta', $("#post_meta").tagit("assignedTags"));
	localStorage.setObj('wpInlineListEditSettings.taxonomies', $("#taxonomies").tagit("assignedTags"));
}

function setInputsToLastSaved() {
	if(!localStorageSupported())
		return;

	var settings = localStorage.getObj('wpInlineListEditSettings');


	if(settings.post_type)
		$('#post_type').val(settings.post_type);

	if(settings.post_columns)
		$("#post_columns").tagit("fill", settings.post_columns);

	if(settings.post_meta)
		$("#post_meta").tagit("fill", settings.post_meta);

	if(settings.taxonomies)
		$("#taxonomies").tagit("fill", settings.taxonomies);
}

function wpille_keyToReadable(string) {
	return string.trim().replace('-', ' ').replace('_', ' ');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Check if localstorage is supported
 * @return {Boolean} [description]
 */

	function localStorageSupported() {
		/**
		 * Supported in browser?
		 */
		
			if(typeof Storage === 'undefined')
				return false;

		/**
		 * Ensure it is useable
		 */
		
			var testKey = 'test', storage = window.sessionStorage;

			try {
				storage.setItem(testKey, '1');
				storage.removeItem(testKey);
				//return localStorageName in win && win[localStorageName];
			} catch (error) {
				console.log('Localstorage seems to be unsupported', error);
				return false;
			}

		/**
		 * Passed tests - we are enabled
		 */
			
			return true;
	}

/**
 *
 * MOVED TO: https://github.com/iFind/html5MultidimensionalStorage
 *
 * This methods extends the default HTML5 Storage object and add support
 * to set and get multidimensional data
 *
 * @example Storage.setObj('users.albums.sexPistols',"blah");
 * @example Storage.setObj('users.albums.sexPistols',{ sid : "My Way", nancy : "Bitch" });
 * @example Storage.setObj('users.albums.sexPistols.sid',"Other songs");
 *
 * @example Storage.getObj('users');
 * @example Storage.getObj('users.albums');
 * @example Storage.getObj('users.albums.sexPistols');
 * @example Storage.getObj('users.albums.sexPistols.sid');
 * @example Storage.getObj('users.albums.sexPistols.nancy');
 *
 * This is just a prototype and is not recommended to use at production apps
 * USE AT YOUR OWN RISK
 *
 * @author Klederson Bueno <klederson@klederson.com>
 * @author Gabor Zsoter <helo@zsitro.com>
 */

	//Add Storage support for objects
	Storage.prototype.__walker = function(path,o) {
		//Validate if path is an object otherwise returns false
		if(typeof path !== "object")
		return undefined;
 
		if(path.length === 0){
		return o;
		}
 
		for(var i in path){
		var prop = path[i];
		//Check if path step exists
		if(o.hasOwnProperty(prop)){
			var val = o[prop];
			if(typeof val == 'object'){
			path.splice(0,1);
			return this.__walker(path,val);
			} else {
			return val;
			}
		}
		}
	};
 
	Storage.prototype.setObj = function(key, value) {
 
		key = encodeURIComponent(key);
 
		var path = key.split('.');
 
		//First level is always the localStorage key pair item
		var _key = path[0];
		var os = this.getItem(_key) !== null ? JSON.parse(this.getItem(_key)) : null; //general storage key pair element
		path.splice(0,1);
 
		if(os === null) {
		os = {};
		this.setItem(_key,JSON.stringify(os));
		}
 
		var innerWalker = function(path,o) {
 
		//Validate if path is an object otherwise returns false
		if(typeof path !== "object")
			return undefined;
 
		if(path.length == 1) {
			o[path[0]] = value;
			return o;
		} else if(path.length === 0) {
			os = value;
			return os;
		}
		   
		var val = null;
 
		for(var i in path){
			var prop = path[i];
			//Check if path step exists
			if(o.hasOwnProperty(prop)) {
			val = o[prop];
			if(typeof val == 'object'){
				path.splice(0,1);
				return innerWalker(path,val);
			}
			} else {
			//create depth
			o[prop] = {};
			val = o[prop];
			path.splice(0,1);
			return innerWalker(path,val);
			}
		}
		};
 
		innerWalker(path,os);
	   
		this.setItem(_key,JSON.stringify(os));
	};
 
	Storage.prototype.getObj = function(key) {
 
		key = encodeURIComponent(key);
		key = key.split('.');
 
		//First level is always the localStorage key pair item
		var _key = key[0];
		var o = this.getItem(_key) ? JSON.parse(this.getItem(_key)) : null;
 
		if(o === null)
		return undefined;
 
		key.splice(0,1);
 
		return this.__walker(key,o);
	};