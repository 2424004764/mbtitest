import { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { LangProvider } from './i18n';
import { ThemeProvider } from './hooks/useTheme';
import { lazyWithRetry } from './lib/retry';

const Home = lazyWithRetry(() => import('./pages/Home'));
const Test = lazyWithRetry(() => import('./pages/Test'));
const Result = lazyWithRetry(() => import('./pages/Result'));
const Types = lazyWithRetry(() => import('./pages/Types'));
const TypeDetail = lazyWithRetry(() => import('./pages/TypeDetail'));
const Compatibility = lazyWithRetry(() => import('./pages/Compatibility'));
const Quiz = lazyWithRetry(() => import('./pages/Quiz'));
const QuizResult = lazyWithRetry(() => import('./pages/QuizResult'));
const Blog = lazyWithRetry(() => import('./pages/Blog'));
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost'));
const About = lazyWithRetry(() => import('./pages/About'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/result" element={<Result />} />
                  <Route path="/types" element={<Types />} />
                  <Route path="/type/:code" element={<TypeDetail />} />
                  <Route path="/compatibility" element={<Compatibility />} />
                  <Route path="/quiz/:id" element={<Quiz />} />
                  <Route path="/quiz/:id/result" element={<QuizResult />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </LangProvider>
    </ThemeProvider>
  );
}
