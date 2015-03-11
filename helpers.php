<?php
 	function wpille_pluginUrl($path = '') {
		return plugin_dir_url(__FILE__) . $path;
	}

	function get_post_table_columns() {
		global $wpdb;

		$query = "
			DESCRIBE " . $wpdb->prefix . "posts
		";

		$column = array();


		foreach($wpdb->get_results($query) as $row)
			$columns[] = $row->Field;

		return $columns;
	}

	function get_post_meta_keys() {
		global $wpdb;

		$query = "
			SELECT
				meta_key as `key`,
				p.post_type
			FROM
				" . $wpdb->prefix . "postmeta meta
			INNER JOIN
				" . $wpdb->prefix . "posts p ON p.ID = meta.post_id
			GROUP BY
				meta.meta_key
		";
		$meta_keys = array();

		foreach($wpdb->get_results($query) as $meta)
			$meta_keys[] = $meta->key;

		return $meta_keys;
	}

	function get_taxonomies_as_array() {
		$taxonomies = array();

		foreach(get_taxonomies() as $name)
			$taxonomies[] = $name;

		return $taxonomies;
	}

	function wpille_keyToReadable($string) {
		//return mb_convert_case(str_replace(['-', '_'], ' ', $string), MB_CASE_TITLE, "UTF-8");
		
		return ucfirst(trim(str_replace(['-', '_'], ' ', $string)));
	}

	function get_post_terms_from_data($data_source, $taxonomy, $post_id) {
		$post_terms = array();

		foreach ($data_source as $data) {
			if($data->object_id == $post_id && $data->taxonomy == $taxonomy)
				$post_terms[$data->slug] = $data->name;
		}

		return $post_terms;
	}