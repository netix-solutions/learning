/** Shared route rules keep the child shell consistent across real and QA screens. */
const CHILD_ROUTES = [
  '/home', '/home-preview', '/learn', '/learn-preview', '/practice', '/quiz-preview',
  '/rewards', '/garden', '/train', '/train-preview', '/dinosaurs', '/bakery',
  '/interaction-preview', '/math-preview', '/math-layout-preview', '/reading-preview', '/science-preview',
];
export function isStudentRoute(path: string | null) {
  return !!path && CHILD_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
}
export function studentTab(path: string) {
  if (path.startsWith('/practice') || path === '/quiz-preview' || path.includes('math-') || path === '/reading-preview' || path === '/science-preview' || path === '/interaction-preview') return 'practice';
  if (path.startsWith('/learn')) return 'learn';
  if (['/rewards','/garden','/train','/train-preview','/dinosaurs','/bakery'].includes(path)) return 'rewards';
  return 'home';
}
