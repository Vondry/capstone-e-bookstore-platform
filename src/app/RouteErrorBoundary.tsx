/**
 * RouteErrorBoundary - catches render errors and failed lazy-route loads so one broken
 * screen shows an error state instead of unmounting the whole app (.bob/rules/04).
 * Remount it per route (key={pathname}) so navigating away clears the error.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

type RouteErrorBoundaryProps = {
  children: ReactNode;
};

type RouteErrorBoundaryState = {
  error: Error | null;
};

export class RouteErrorBoundary extends Component<
  Readonly<RouteErrorBoundaryProps>,
  RouteErrorBoundaryState
> {
  override state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route crashed', error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <ErrorState
          className="m-16 min-h-[400px] md:m-24"
          title="This page couldn't be displayed"
          error={this.state.error}
          // A reload also recovers from a failed lazy chunk, which React caches as rejected
          onRetry={() => {
            window.location.reload();
          }}
        />
      );
    }
    return <>{this.props.children}</>;
  }
}
