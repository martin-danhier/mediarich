import { IconButton } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { TreeItemProps, TreeItem, TreeView } from '@material-ui/lab';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import './drawer-menu.style.css';

export interface DrawerMenuItem {
    /** Label of the item (displayed in the menu) */
    label: string;
    /** Children of this item (other items) */
    children?: DrawerMenuItem[];
    /** Callback to call when the item is clicked */
    onClick?: (e: React.MouseEvent) => void;
    /** URL of the resource (move when clicked) */
    url: string;
}

export interface DrawerMenuProps extends RouteComponentProps {
    items: DrawerMenuItem[];
}

export interface DrawerMenuState {
    selected?: string;
    expanded: string[];
}

/** Tree menu */
class DrawerMenu extends React.Component<DrawerMenuProps, DrawerMenuState> {

    constructor(props: DrawerMenuProps) {
        super(props);

        const current = props.location.pathname;
        const parents = this.getParents(current, props.items);

        this.state = {
            // Select the current route if it exist
            selected: parents ? current : '',
            // Expand the root level if there isn't a path
            expanded: parents ?? props.items.map(item => item.url),
        };
    }

    toggleItemExpansion(item: string): void {
        const newState = { ...this.state };

        const index = newState.expanded.indexOf(item);
        // If item in array, remove it
        if (index !== -1) {
            newState.expanded.splice(index, 1);
        }
        // Else add it
        else {
            newState.expanded.push(item);
        }

        this.setState(newState);
    }

    handleItemClicked = (event: React.MouseEvent<HTMLLIElement>, item: DrawerMenuItem): void => {
        const newState = { ...this.state };

        // Select that url
        newState.selected = item.url;

        this.setState(newState);

        // Go to that url
        this.props.history.push(item.url);
    }

    /* Recursively renders a drawer menu item and its elements */
    renderMenuItem = (item: DrawerMenuItem, index: number): React.ReactElement<TreeItemProps> => {
        return <TreeItem
            classes={{
                label: 'DrawerMenu-treeViewItemLabel',
                group: 'DrawerMenu-treeViewItemGroup',
                iconContainer: 'DrawerMenu-treeViewIconContainer',
            }}
            key={index.toString()}
            nodeId={item.url}
            label={<>
                {item.children ?
                    <IconButton
                        className='DrawerMenu-iconButton'
                        onClick={(e): void => {
                            // Prevent the click event from propagating to the item
                            e.stopPropagation();
                            // Toggle the expansion
                            this.toggleItemExpansion(item.url);
                        }}
                    >
                        {
                            this.state.expanded.includes(item.url) ?
                                <ExpandLess />
                                : <ExpandMore />

                        }
                    </IconButton>
                    // Take the space of an iconButton if there isn't one
                    : <div className='DrawerMenu-iconButton' />
                }
                <div className='DrawerMenu-labelText'>{item.label}</div>
            </>}
            onClick={(e): void => this.handleItemClicked(e, item)}
        >
            {/* Render children, if any */}
            {item.children && item.children.map(this.renderMenuItem)}
        </TreeItem >;
    }

    getParents(url: string, list: DrawerMenuItem[]): string[] | undefined {
        for (const item of list) {
            if (item.url === url) {
                // If the destination is found, go back up with an empty string
                return [];
            }
            else if (item.children && item.children.length > 0) {
                const res = this.getParents(url, item.children);
                if (res != null) {
                    res.push(item.url);
                    return res;
                }
            }
        }
    }

    render(): JSX.Element {
        return <TreeView
            expanded={this.state.expanded}
            selected={this.state.selected}
            className="DrawerMenu-treeView"
        >
            {this.props.items.map(this.renderMenuItem)}
        </TreeView>;
    }
}

export default DrawerMenu;