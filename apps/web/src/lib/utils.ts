// The shadcn CLI generates components that import `cn` from the published `cn`
// package. Re-export it so app code and generated components share one merger.
export { cn } from 'cn'
