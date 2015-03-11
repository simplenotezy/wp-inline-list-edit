<?php

	/**
	 * Get helpers
	 */
	
		require_once 'helpers.php';

	/**
	 * WordPress inline list edit
	 *
	 * 
	 * Plugin Name: Wordpress Inline List Bulk Edit
	 * Plugin URI: http://athliit.com
	 * Description: A plugin that makes it easy to edit your posts/pages/products inline. Useful when you have many posts to create/edit
	 * Version: 0.1
	 * Author: Mattias Fjellvang
	 */
		class WPInlineListEdit {
			/**
			 * Holds the values to be used in the fields callbacks
			 */
			private $options;

			/**
			 * Start up
			 */
			public function __construct() {
				if(isset($_GET['page']) && $_GET['page'] == 'inline-list-edit') {
					add_action( 'admin_init', array( $this, 'page_init' ) );
				}

				add_action( 'admin_menu', array( $this, 'add_plugin_page' ) );
				add_action( 'init', array( $this, 'actions' ) );
				

				$this->admin_actions();
			}

			public function actions() {
				if(!is_user_logged_in())
					return;

				if(isset($_GET['wpInlineListEditTable'])) {


					$posts = new WP_Query( array(
						'post_status' => 'publish',
						'post_type' => $_GET['post_type'],
						'posts_per_page' => (isset($_GET['limit'])) ? $_GET['limit'] : 20,
						'page' => (isset($_GET['page'])) ? $_GET['page'] : 1,
					));

					$post_columns = explode(',', $_GET['fields']);
					$post_meta = explode(',', $_GET['meta']);
					$taxonomies = explode(',', $_GET['taxonomies']);
					$posts = $posts->get_posts();


					$taxonomies_data = wp_get_object_terms(wp_list_pluck($posts, 'ID' ), $taxonomies, array('fields' => 'all_with_object_id'));


					if(count($post_meta) == 1 && $post_meta[0] == '')
						$post_meta = array();

					if(count($taxonomies) == 1 && $taxonomies[0] == '')
						$taxonomies = array();

					$columns = array_merge($post_columns, $post_meta, $taxonomies);

					echo '<table class="widefat fixed" cellspacing="0">';
						echo '<thead>';
							echo '<tr>';
								echo '<th id="cb" class="manage-column column-cb check-column" scope="col"></th>';
								
								foreach($columns as $column)
									echo '<th id="columnname" class="manage-column column-columnname" scope="col">' . wpille_keyToReadable($column) . '</th>';
								
							echo '</tr>';
						echo '</thead>';

						echo '<tfoot>';
							echo '<tr>';
								echo '<th class="manage-column column-cb check-column" scope="col"></th>';
								
								foreach($columns as $column)
									echo '<th id="columnname" class="manage-column column-columnname" scope="col">' . wpille_keyToReadable($column) . '</th>';

							echo '</tr>';
						echo '</tfoot>';

						echo '<tbody>';
							foreach($posts as $post) {
								$post = (array) $post;
								$this_post_meta = get_post_meta($post['ID']);

								echo '<tr class="alternate wp_inline_edit" data-post-id="' . $post['ID'] . '">';
									echo '<th class="check-column" scope="row"><input type="checkbox"></th>';

									/**
									 * Post table fields
									 * @var [type]
									 */
									
										foreach($post_columns as $key => $column) {

											echo '<td class="column-title">';

												if(has_filter('wp_inline_list_edit_postfield_' . $column)) {
													echo apply_filters('wp_inline_list_edit_postfield_' . $column, $post[$column]);												
												} else {
													echo apply_filters('wp_inline_list_edit_postfield_default', $post[$column], $column);												
												}


													echo '<div class="row-actions">';
														if($key == 0) {
															echo '<span><a href="' . admin_url('post.php?post=' . $post['ID'] . '&action=edit') . '" tabindex="-1">' . __('Edit') . '</a> |</span>';
															echo '<span><a href="' . $post['guid'] . '" tabindex="-1">' . __('View') . '</a> | </span>';
														}
														echo '<span><a href="#" tabindex="-1" class="triggerTextareaModal">' . __('Textarea') . '</a> | </span>';
														echo '<span><a href="#" tabindex="-1" class="triggerTextareaModal tinyMCE">' . __('Editor') . '</a></span>';
													echo '</div>';
											echo '</td>';
										}

									/**
									 * Post meta
									 * @var [type]
									 */
									
										foreach($post_meta as $key => $column) {
											echo '<td class="column-title">';

												if(has_filter('wp_inline_list_edit_metafield_' . $column)) {
													echo apply_filters('wp_inline_list_edit_metafield_' . $column, $this_post_meta[$column][0]);												
												} else {
													echo apply_filters('wp_inline_list_edit_metafield_default', $this_post_meta[$column][0], $column);												
												}

											echo '</td>';
										}

									/**
									 * Taxonomies
									 */

										foreach($taxonomies as $taxonomy) {

											echo '<td class="column-title">';

												echo '<ul class="taxonomy_tag_it" data-taxonomy="' . $taxonomy . '">';

													foreach(get_post_terms_from_data($taxonomies_data, $taxonomy, $post['ID']) as $tax_slug => $tax_name)
														echo '<li>' . $tax_slug . '</li>';

												echo '</ul>';

											echo '</td>';
										}

								echo '</tr>';
							}
						echo '</tbody>';
					echo '</table>';

					exit;
				}
			}

			public function admin_actions() {
				/**
				 * Get posts table
				 */
				
					add_action( 'wp_ajax_get_posts_table_columns', 'wp_get_posts_table_columns_callback' );

					function wp_get_posts_table_columns_callback() {
						global $wpdb;

						$query = "
							DESCRIBE " . $wpdb->prefix . "posts
						";


						echo json_encode($wpdb->get_results($query));
						wp_die();
					}

				/**
				 * Get post meta
				 */
			}

			/**
			 * Add options page
			 */
			public function add_plugin_page()
			{
				// This page will be under "Settings"
				add_menu_page(
					'Bulk edit', 
					'Bulk edit', 
					'edit_posts', 
					'inline-list-edit', 
					array( $this, 'create_admin_page' ),
					'',
					30
				);


			}

			/**
			 * Options page callback
			 */
			public function create_admin_page()
			{
				?>
				<div class="wrap">
					<h1>Inline list edit</h1>
					<div class="filter">
						<table class="options-and-filters">
							<tbody>
								<tr>
									<th scope="row"><label for="post_columns">Post type</label></th>
									<td><select name="post_type" id="post_type">
										<?php foreach(get_post_types() as $post_type) echo '<option value="' . $post_type . '">' . $post_type . '</option>'; ?>
									</select></td>
								</tr>
								<tr>
									<th scope="row"><label for="post_columns">Post fields</label></th>
									<td><ul id="post_columns" class="tagit"><li>post_title</li><li>post_type</li><li>post_status</li><li>post_content</li></ul></td>
								</tr>
								<tr>
									<th scope="row"><label for="post_meta">Post meta</label></th>
									<td><ul id="post_meta" class="tagit"></ul></td>
								</tr>
								<tr>
									<th scope="row"><label for="post_meta">Taxonomies</label></th>
									<td><ul id="taxonomies" class="tagit"></ul></td>
								</tr>
								<tr>
									<td colspan="2"><button id="generate_table" href="#" class="button button-primary">Generate table</button></td>
								</tr>
							</tbody>
						</table>
					</div>
					<div id="theInlineTable">
					<!-- table will be loaded using jQuery -->
					</div>
				</div>

				<div id="textarea-modal" title="Edit content">
					<?php wp_editor('', 'textarea-editor'); ?>
					<div class="default-editor">
						<textarea></textarea>
					</div>
				</div>

				<script>
					var $ = jQuery;

					
				</script>
				<?php
			}

			/**
			 * Register and add settings
			 */
			public function page_init()
			{
				wp_enqueue_media();

				/**
				 * Load general JS
				 */
				

					wp_enqueue_script('wp-inline-list-edit-js', wpille_pluginUrl('assets/js/wp-inline-list-edit.min.js?time=' . time(), __FILE__ ), array('jquery-ui-autocomplete', 'jquery-ui-dialog'));
					wp_enqueue_style("wp-jquery-ui-dialog");
				/**
				 * Localize script
				 */

					wp_localize_script( 'wp-inline-list-edit-js', 'wpInlineListEdit', array(
							'post_columns' => get_post_table_columns(),
							'post_meta' => get_post_meta_keys(),
							'taxonomies' => get_taxonomies_as_array(),
							'taxonomies_terms' => get_terms(get_taxonomies(), array('hide_empty' => false)),
							'site_url' => site_url()
						));


				/**
				 * Styles
				 */
				
					/**
					 * Load instantButler CSS
					 */
					
						wp_register_style(
							'wp-inline-list-edit-css',
							wpille_pluginUrl('assets/css/wp-inline-list-edit.css'),
							array(),
							FALSE,
							'screen'
						);

						wp_enqueue_style( 'wp-inline-list-edit-css' );
			
			}
		}

		if( is_admin() )
			$wpinlinelistedit = new WPInlineListEdit();


		/**
		 * Tax edit
		 */

			add_action( 'wp_ajax_wpille_edit_taxonomy', 'wpille_edit_taxonomy' );

			function wpille_edit_taxonomy() {
				global $wpdb;

				$updated = wp_set_object_terms($_POST['post_id'], $_POST['tags'], $_POST['taxonomy']);

				exit(json_encode(array(
					'updated' => $updated
				), true));
				
				wp_die(); // this is required to terminate immediately and return a proper response
			}

		/**
		 * Quick update
		 */

			add_action( 'wp_ajax_wpille_edit_post', 'wpille_edit_post' );

			function wpille_edit_post() {
				global $wpdb;

				if($_POST['column'] == 'post_column') {
					// post column
					$updated = wp_update_post(array(
							'ID' => $_POST['post_id'],
							$_POST['name'] => $_POST['value']
						));
				} else {
					// meta
					//$updated = update_post_meta($_POST['post_id'], $_POST['name'], $_POST['value']);
					$updated = add_post_meta( $_POST['post_id'], $_POST['name'], $_POST['value'], true ) || update_post_meta( $_POST['post_id'], $_POST['name'], $_POST['value']);
				}

				exit(json_encode(array(
					'updated' => $updated
				)));
				
				wp_die(); // this is required to terminate immediately and return a proper response
			}

		/**
		 * Quick add
		 */

			add_action( 'wp_ajax_wpille_add_post', 'wpille_add_post' );

			function wpille_add_post() {
				global $wpdb;

				/**
				 * Default fields
				 * @var array
				 */
				
					$post = array();

					if(is_array($_POST['post']['fields']))
						foreach($_POST['post']['fields'] as $field)
							$post[$field['name']] = $field['value'];

				/**
				 * Ensure defaults
				 * @var [type]
				 */
				
					// post type
					if(!isset($post['post_type']))
						$post['post_type'] = (isset($_POST['post']['post_type']) && $_POST['post']['post_type']) ? $_POST['post']['post_type'] : 'post';
				
					// post status
					if(!isset($_POST['post_status']))
						$post['post_status'] = 'publish';
				
				/**
				 * Create post
				 */

					$post_id = wp_insert_post($post);

				/**
				 * Add meta
				 */
				
					if(is_array($_POST['post']['meta']))
						foreach($_POST['post']['meta'] as $key => $value)
							add_post_meta($post_id, $key, $value, true);

				/**
				 * Return data
				 */
				
					exit(json_encode(array(
						'updated' 	=> $updated,
						'created' 	=> true,
						'post_id'   => $post_id
					)));

					wp_die(); // this is required to terminate immediately and return a proper response
			}

		/**
		 * Default post column
		 */
		
			add_filter('wp_inline_list_edit_postfield_default', 'wp_inline_list_edit_postfield_default',10,3);
			
			function wp_inline_list_edit_postfield_default($value, $name) {
				return '<input type="text" data-type="post_column" data-name="' . $name . '" value="' . $value . '">';
			}

		/**
		 * Default meta
		 */
		
			add_filter('wp_inline_list_edit_metafield_default', 'wp_inline_list_edit_metafield_default',10,3);
			function wp_inline_list_edit_metafield_default($value, $name) {
				return '<input type="text" data-type="post_meta" data-name="' . $name . '" value="' . $value . '">';
			}

		/**
		 * Post status
		 */
		
			add_filter('wp_inline_list_edit_postfield_post_status', 'wp_inline_list_edit_postfield_post_status',10,3);
			function wp_inline_list_edit_postfield_post_status($value) {
				$return = '<select data-type="post_column" data-name="post_status">';

					foreach(get_post_statuses() as $key => $name) {

						$return .= '<option value="' . $key . '"';

							if($key == $value)
								$return .= ' selected';

						$return .= '>' . $name . '</option>';
					}

				return $return;
			}

		/**
		 * Featured image
		 */
			
			add_filter('wp_inline_list_edit_metafield__thumbnail_id', 'wp_inline_list_edit_metafield_featured_image',10,3);

			function wp_inline_list_edit_metafield_featured_image($image_id) {
				$return = '<div class="featured-image"><input type="hidden" data-type="post_meta" data-name="_thumbnail_id" value="' . $image_id . '">';

				$image = wp_get_attachment_image_src( $image_id, 'thumbnail');
				$return .= '<IMG src="' . $image[0] . '"';

					if(!$image_id)
						$return .= ' style="display:none;"';

				$return .= '>';

				$return .= '<a href="#" class="setFeaturedImage">' . __('Set featured image') . '</a>';

				return $return . '</div>';
			}

		/**
		 * Post status
		 */
		
			add_filter('wp_inline_list_edit_postfield_post_type', 'wp_inline_list_edit_postfield_post_type',10,3);
			function wp_inline_list_edit_postfield_post_type($value) {
				$return = '<select data-type="post_column" data-name="post_type">';

					foreach(get_post_types() as $key => $name) {

						$return .= '<option value="' . $key . '"';

							if($key == $value)
								$return .= ' selected';

						$return .= '>' . $name . '</option>';
					}

				return $return;
			}

		// /**
		//  * Post content
		//  */
		
		// 	add_filter('wp_inline_list_edit_postfield_post_content', 'wp_inline_list_edit_postfield_post_content',10,3);
		// 	function wp_inline_list_edit_postfield_post_content($value) {
		// 		return '<textarea data-type="post_column" data-name="post_content" class="triggerTextareaModal tinyMCE">' . $value . '</textarea>';
		// 	}

		// /**
		//  * Post excerpt
		//  */
		
		// 	add_filter('wp_inline_list_edit_postfield_post_excerpt', 'wp_inline_list_edit_postfield_post_excerpt',10,3);
		// 	function wp_inline_list_edit_postfield_post_excerpt($value) {
		// 		return '<textarea data-type="post_column" data-name="post_content" class="triggerTextareaModal">' . $value . '</textarea>';
		// 	}

		/**
		 * Post author
		 */
		
			add_filter('wp_inline_list_edit_postfield_post_author', 'wp_inline_list_edit_postfield_post_author',10,3);
			function wp_inline_list_edit_postfield_post_author($value) {
				if($authors = wp_cache_get('wpille_authors')) {
					$authors = unserialize($authors);
				} else {
					$authors = get_users(array(
						//'who' => 'authors'
					));

					wp_cache_add('wpille_authors', serialize($authors), null, 5);
				}

				$return = '<select data-type="post_column" data-name="post_author">';

					foreach($authors as $author) {

						$return .= '<option value="' . $author->ID . '"';

							if($author->ID == $value)
								$return .= ' selected';

						$return .= '>' . $author->user_nicename . '</option>';
					}

				return $return;
			}


