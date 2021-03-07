/**
 * @file definition of a LazyRoute component
 * @version 1.0
 * @author Martin Danhier
 */

import LoadingScreen from 'components/loading-screen';
import React, { Suspense } from 'react';
import { StaticContext } from 'react-router';
import { Route, RouteComponentProps } from 'react-router-dom';

/** Props of a LazyRoute */
export interface LazyRouteProps<T> {
    /** Should the route exactly match the path ? */
    exact?: boolean;
    /** Path of the route */
    path?: string;
    /** Render function of the component. Pass props to it.
     *
     * @example <LazyRoute exact path="/" render={(p): JSX.Element => <Home {...p} customProp="value" />}/>
     */
    render: (props: RouteComponentProps<T, StaticContext, {}>) => JSX.Element;
}

/** Route that can load a Lazy component on demand.
 *
 * @example <LazyRoute exact path="/" render={(p): JSX.Element => <Home {...p} customProp="value" />}/>
*/
class LazyRoute<T = {}> extends React.Component<LazyRouteProps<T>> {
    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        return (
            <Route
                exact={this.props.exact}
                path={this.props.path}
                render={
                    (props): JSX.Element => <Suspense
                        /* Show loading screen when not ready */
                        fallback={<LoadingScreen />}
                    >
                        {/* Render child */}
                        {this.props.render(props as RouteComponentProps<T, StaticContext, {}>)}
                    </Suspense>
                }
            />
        );
    }
}

export default LazyRoute;