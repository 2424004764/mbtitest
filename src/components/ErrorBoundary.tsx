import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Last-resort boundary: keeps a visible message on screen instead of a blank page. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface the cause in the title too, so it survives tree unmounts.
    document.title = `ERR: ${error.message}`.slice(0, 180);
    console.error(error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto mt-24 max-w-xl px-4 text-center">
          <p className="font-mono text-xs text-red-500">{String(this.state.error)}</p>
          <p className="mt-4 font-bold">Something went wrong · 页面出错了</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary mt-6 !py-2.5 text-sm"
          >
            Reload · 刷新重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
