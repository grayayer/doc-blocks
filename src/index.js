const { registerBlockType } = wp.blocks;
const { useBlockProps, InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl, ToggleControl } = wp.components;
const { useSelect } = wp.data;
const { __ } = wp.i18n;

// "Parent & Child Pages" block code
registerBlockType( 'page-hierarchy-block/main', {
    title: 'Parent & Child Pages',
    icon: 'list-view',
    category: 'widgets',
    attributes: {
        selectedPageId: {
            type: 'number',
            default: 0,
        },
        listType: {
            type: 'string',
            default: 'ul', // Default to unordered list
        },
        hideParentPage: {
            type: 'boolean',
            default: false,
        },
    },
    edit: function( props ) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();

        const pages = useSelect( ( select ) => {
            try {
                const fetchedPages = select( 'core' ).getEntityRecords( 'postType', 'page', { per_page: -1 } );
                return fetchedPages;
            } catch ( error ) {
                console.error( 'Error fetching pages:', error );
                return [];
            }
        }, [] );

        const onChangePageId = function( newPageId ) {
            setAttributes( { selectedPageId: parseInt( newPageId ) } );
        };

        const selectedPage = pages?.find( function( page ) {
            return page.id === attributes.selectedPageId;
        } );
        const childPages = pages?.filter( function( page ) {
            return page.parent === attributes.selectedPageId;
        } );

        let pageOptions = [ { label: __( 'Select a page' ), value: 0 } ];
        if ( Array.isArray( pages ) ) {
            pageOptions = [
                ...pageOptions,
                ...pages.map( function( page ) {
                    return {
                        label: page.title.rendered,
                        value: page.id,
                    };
                } ),
            ];
        }

        return (
            <div { ...blockProps }>
                <InspectorControls>
                    <PanelBody title={ __( 'Page Selection' ) }>
                        <SelectControl
                            label={ __( 'Select Parent Page' ) }
                            value={ attributes.selectedPageId }
                            options={ pageOptions }
                            onChange={ onChangePageId }
                        />
                        <ToggleControl
                            label={ __( 'Hide Parent Page' ) }
                            checked={ attributes.hideParentPage }
                            onChange={ ( newValue ) => setAttributes( { hideParentPage: newValue } ) }
                        />
                        <SelectControl
                            label={ __( 'List Type' ) }
                            value={ attributes.listType }
                            options={ [
                                { label: __( 'Unordered List (UL)' ), value: 'ul' },
                                { label: __( 'Ordered List (OL)' ), value: 'ol' },
                            ] }
                            onChange={ ( newListType ) => setAttributes( { listType: newListType } ) }
                        />
                    </PanelBody>
                </InspectorControls>
                <div className="page-hierarchy-block">
                    { null === pages ? (
                        <p>{ __( 'Loading pages...' ) }</p>
                    ) : 0 === pages.length ? (
                        <p>{ __( 'No pages found.' ) }</p>
                    ) : selectedPage ? (
                        <>
                            { ! attributes.hideParentPage && (
                                <h2>{ selectedPage.title.rendered }</h2>
                            ) }
                            { childPages && childPages.length > 0 ? (
                                attributes.listType === 'ul' ? (
                                    <ul>
                                        { childPages.map( function( childPage ) {
                                            return <li key={ childPage.id }>{ childPage.title.rendered }</li>;
                                        } ) }
                                    </ul>
                                ) : (
                                    <ol>
                                        { childPages.map( function( childPage ) {
                                            return <li key={ childPage.id }>{ childPage.title.rendered }</li>;
                                        } ) }
                                    </ol>
                                )
                            ) : (
                                <p>{ __( 'No child pages found.' ) }</p>
                            ) }
                        </>
                    ) : (
                        <p>{ __( 'Please select a parent page.' ) }</p>
                    ) }
                </div>
            </div>
        );
    },
    save: function() {
        return null; // We'll use PHP to render the block
    },
} );

// Updated "Page Sibling Navigation" block
registerBlockType('page-hierarchy-block/sibling-navigation', {
    title: 'Page Sibling Navigation',
    icon: 'admin-links',
    category: 'widgets',
    attributes: {
        usePageOrder: {
            type: 'boolean',
            default: false,
        },
        navigationType: {
            type: 'string',
            default: 'both',
        },
        useParentAsPrevious: {
            type: 'boolean',
            default: false,
        },
        useNextTopicAsNext: {
            type: 'boolean',
            default: false,
        },
    },
    edit: function( props ) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();

        const currentPageId = useSelect( ( select ) => {
            return select( 'core/editor' ).getCurrentPostId();
        }, [] );

        const parentId = useSelect( ( select ) => {
            const page = select( 'core/editor' ).getCurrentPost();
            return page ? page.parent : 0;
        }, [] );

        console.log( 'useNextTopicAsNext:', attributes.useNextTopicAsNext );

        return (
            <div { ...blockProps }>
                <InspectorControls>
                    <PanelBody title={ __( 'Navigation Settings' ) }>
                        <ToggleControl
                            label={ __( 'Use Page Order' ) }
                            checked={ attributes.usePageOrder }
                            onChange={ ( value ) => setAttributes( { usePageOrder: value } ) }
                        />
                        <SelectControl
                            label={ __( 'Navigation Type' ) }
                            value={ attributes.navigationType }
                            options={ [
                                { label: __( 'Previous and Next' ), value: 'both' },
                                { label: __( 'Previous Only' ), value: 'previous' },
                                { label: __( 'Next Only' ), value: 'next' },
                            ] }
                            onChange={ ( value ) => setAttributes( { navigationType: value } ) }
                        />
                        <ToggleControl
                            label={ __( 'Use Parent as Previous' ) }
                            help={ __( 'If there is no previous sibling, use the parent page as the previous link' ) }
                            checked={ attributes.useParentAsPrevious }
                            onChange={ ( value ) => setAttributes( { useParentAsPrevious: value } ) }
                        />
                        <ToggleControl
                            label={ __( 'Use Next Topic as Next' ) }
                            help={ __( 'If there is no next sibling, use the next topic (parent\'s next sibling) as the next link' ) }
                            checked={ attributes.useNextTopicAsNext }
                            onChange={ ( value ) => setAttributes( { useNextTopicAsNext: value } ) }
                        />
                    </PanelBody>
                </InspectorControls>
                <div className="wp-block-page-sibling-navigation">
                    { parentId ? (
                        <p>{ __( 'Sibling navigation will be displayed here.' ) }</p>
                    ) : (
                        <p>{ __( 'This page has no parent. Sibling navigation is not applicable.' ) }</p>
                    ) }
                </div>
            </div>
        );
    },
    save: function() {
        return null; // We'll use PHP to render the block
    },
});