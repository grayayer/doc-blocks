<?php
/**
 * Get the next sibling ID of the parent page
 * Description: Adds functionality for blocks for navigating between a parent's sibling pages.
 * Version: 1.0
 * Author: Gray Ayer
 */

namespace GraysDocsBlocks\Functions;


function get_next_parent_sibling_id($page_id) {
	// Get the current page
	$current_page = get_post($page_id);

	if (!$current_page || $current_page->post_type !== 'page') {
		return null;
	}

	// Get the parent page
	$parent_page = get_post($current_page->post_parent);

	if (!$parent_page || $parent_page->post_type !== 'page') {
		return null;
	}

	// Check if the parent page is a top-level page
	if ($parent_page->post_parent == 0) {
		// Get all top-level pages
		$siblings = get_pages(array(
			'parent' => 0,
			'sort_column' => 'menu_order,post_title',
			'sort_order' => 'ASC'
		));
	} else {
		// Get all pages with the same parent as the parent page
		$siblings = get_pages(array(
			'parent' => $parent_page->post_parent,
			'sort_column' => 'menu_order,post_title',
			'sort_order' => 'ASC'
		));
	}

	// Find the index of the parent page in its siblings
	$parent_index = array_search($parent_page, $siblings);

	if ($parent_index === false) {
		return null;
	}

	// Check if there's a next sibling
	if ($parent_index < count($siblings) - 1) {
		return $siblings[$parent_index + 1]->ID;
	}

	return null;
}