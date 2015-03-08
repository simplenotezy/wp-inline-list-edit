var $ = jQuery;

$(document).ready(function() {


	$('#post_type').change(function() {
		buildTable();
	});

	$("#post_columns").tagit({
		availableTags: wpInlineListEdit.post_columns
	});

	$("#post_meta").tagit({
		availableTags: wpInlineListEdit.post_meta,
		afterTagRemoved: function() {
			buildTable();
		},
		afterTagAdded: function() {
			buildTable();
		}
	});

	$('body').on('click', '#generate_table', function() {
		buildTable();
	});

	//buildTable();

	$('#theInlineTable').on('change', '.wp_inline_edit input, .wp_inline_edit select', function() {
		var input = $(this).val();
		var column = $(this).data('type');
		var name = $(this).data('name');
		var post_id = $(this).parents('.wp_inline_edit').data('post-id');

		var query = '?wpInlineListEditPost=' + post_id + '&field=' + column + '&value=' + input;

		console.log('column: ' + column + ' - value: ' + input);

		var data = {
			'action': 'wpille_edit_post',
			'post_id': post_id,
			'column': column,
			'name': name,
			'value': input
		};
		console.log(data);
		
		$.post(ajaxurl, data, function(response) {
			alert('Got this from the server: ' + response);
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
			console.log('fetching table: ', wpInlineListEdit.site_url + '?wpInlineListEditTable' + generate_table_query());
			$.get(wpInlineListEdit.site_url + '/wp-admin/?wpInlineListEditTable' + generate_table_query(), function(response) {
				console.log('has table!');
				$('#theInlineTable').html(response);
			});
		}