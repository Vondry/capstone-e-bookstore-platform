import { ThemeToggle } from './components/ui/ThemeToggle';
import { ToastProvider } from './components/ui/Toast';

/** Placeholder until the layout and the screens land (docs/plans/03–11) */
function App() {
  return (
    <ToastProvider>
      <main className="flex min-h-screen flex-col items-center justify-center gap-16 bg-bg p-24 text-text-primary">
        <h1 className="text-28">Book Worm</h1>
        <p className="text-14 text-text-secondary">
          The design system is ready; the screens are on their way.
        </p>
        <ThemeToggle />
      </main>
    </ToastProvider>
  );
}

export default App;
