# React Query Architecture Guide

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Project Structure](#project-structure)
4. [Query Factories Pattern](#query-factories-pattern)
5. [Implementation Examples](#implementation-examples)
6. [Best Practices](#best-practices)
7. [Migration Strategy](#migration-strategy)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

## Overview

This architecture is based on the **Query Factories** pattern recommended by the TKDODO who is maintainer of React Query, which keeps `queryKey` and `queryFn` together while providing type safety and reusability.

### Why Query Factories?

- **Maintains inseparable relationship** between `queryKey` and `queryFn`
- **Reduces abstraction layers** that could make code harder to follow
- **Provides type safety** with TypeScript
- **Enables reusability** across different contexts (hooks, prefetching, SSR)
- **Supports composition** for hierarchical key structures

## Core Principles

### 1. **QueryKey + QueryFn Together**

Always keep query keys and query functions in the same place. They are an inseparable pair since the queryKey defines the dependencies needed inside the queryFn.

### 2. **Feature-Based Organization**

Create one query factory per feature, with all queryKeys starting with the same prefix.

### 3. **Hierarchical Key Structure**

Use arrays with consistent structure for easy invalidation and composition.

### 4. **Type Safety First**

Use `queryOptions` for better TypeScript inference and autocomplete.

### 5. **Global Configuration**

Set sensible defaults in QueryClient while allowing per-query customization.

## Project Structure

```
src/
├── lib/
│   ├── query-client.ts          # QueryClient configuration
│   └── query-keys.ts            # Global query key utilities (optional)
├── features/
│   ├── todos/
│   │   ├── api/
│   │   │   └── todos.ts         # API functions
│   │   ├── hooks/
│   │   │   ├── use-todos.ts     # Custom query hooks
│   │   │   ├── use-todo-mutations.ts
│   │   │   └── use-todo-prefetch.ts
│   │   └── queries.ts           # Query Factories
│   ├── users/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── queries.ts
│   └── posts/
│       ├── api/
│       ├── hooks/
│       └── queries.ts
├── components/
│   ├── providers/
│   │   └── query-provider.tsx   # QueryClientProvider wrapper
│   └── error-boundary.tsx       # Global error handling
└── app.tsx
```

## Query Factories Pattern

### Basic Structure

```typescript
// features/todos/queries.ts
import { queryOptions } from "@tanstack/react-query";
import { fetchTodos, fetchTodo, fetchTodosByUser } from "./api/todos";

export const todoQueries = {
  // Key-only factories for invalidation (must end with "Key")
  allKey: () => ["todos"] as const,
  allListsKey: () => [...todoQueries.allKey(), "list"] as const,
  allDetailsKey: () => [...todoQueries.allKey(), "detail"] as const,
  allByUserKey: (userId: number) => [...todoQueries.allKey(), "user", userId] as const,

  // Complete query factories with queryOptions
  // Only include queryKey and queryFn - other options go in hooks
  list: (sort?: string) =>
    queryOptions({
      queryKey: [...todoQueries.allListsKey(), { sort }] as const,
      queryFn: () => fetchTodos(sort),
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...todoQueries.allDetailsKey(), id] as const,
      queryFn: () => fetchTodo(id),
    }),

  byUser: (userId: number, sort?: string) =>
    queryOptions({
      queryKey: [...todoQueries.allByUserKey(userId), { sort }] as const,
      queryFn: () => fetchTodosByUser(userId, sort),
    }),
} as const;
```

### Key-Only vs Complete Factories

**Key-Only Factories** (for invalidation - must end with "Key"):

```typescript
allKey: () => ['todos'] as const,
allListsKey: () => [...todoQueries.allKey(), 'list'] as const,
```

**Complete Factories** (for useQuery):

```typescript
list: (sort?: string) => queryOptions({
  queryKey: [...todoQueries.allListsKey(), { sort }] as const,
  queryFn: () => fetchTodos(sort),
  // Only include queryKey and queryFn here, other options (staleTime, gcTime, enabled, etc.) go in hooks.
}),
```

## Implementation Examples

### 1. QueryClient Setup

```typescript
// lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - global default
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime) - global default
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**Global Configuration Best Practices:**

- Set sensible defaults for `staleTime` and `gcTime` at the global level
- **Don't duplicate these in queries or hooks** - they inherit from global defaults
- Only override in hooks when you need different behavior for specific queries

### 2. Custom Hooks

```typescript
// features/todos/hooks/use-todos.ts
import { useQuery } from "@tanstack/react-query";
import { todoQueries } from "../queries";

export function useTodos(sort?: string) {
  return useQuery(todoQueries.list(sort));
}

export function useTodo(id: number) {
  return useQuery({
    ...todoQueries.detail(id),
    enabled: !!id, // Only override when needed
  });
}

export function useTodosByUser(userId: number, sort?: string) {
  return useQuery({
    ...todoQueries.byUser(userId, sort),
    enabled: !!userId, // Only override when needed
  });
}

// Custom hook with additional options
export function useTodosWithPolling(sort?: string) {
  return useQuery({
    ...todoQueries.list(sort),
    refetchInterval: 10 * 1000, // Override global defaults when needed
  });
}

// For hooks with many parameters, use an object parameter
interface UseHistoricalReturnsParams {
  portfolioId: number;
  startDate: Date;
  endDate: Date;
  returnType: ReturnType;
  scope: Scope;
  stockSymbol?: string;
}

export function useHistoricalReturns(params: UseHistoricalReturnsParams) {
  const { portfolioId, startDate, endDate, returnType, scope, stockSymbol } = params;

  return useQuery({
    ...historicalReturnsQueries.returns(portfolioId, startDate, endDate, returnType, scope, stockSymbol),
    enabled: !(scope === "stock" && !stockSymbol),
    placeholderData: (previousData) => previousData, // Override when needed
    // staleTime and gcTime inherit from global QueryClient defaults
  });
}
```

**Important Notes:**

- **Don't duplicate global defaults**: `staleTime` and `gcTime` are configured globally in QueryClient, so don't set them in every hook
- **Only override when needed**: Add options like `enabled`, `placeholderData`, `refetchInterval` only when you need to override defaults
- **Use object parameters**: For hooks with 4+ parameters, use an object parameter for better readability and maintainability

### 3. Mutations

```typescript
// features/todos/hooks/use-todo-mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTodo, updateTodo, deleteTodo } from "../api/todos";
import { todoQueries } from "../queries";

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Invalidate using key-only factories
      queryClient.invalidateQueries({
        queryKey: todoQueries.allListsKey(),
      });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: (_, deletedId) => {
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: todoQueries.allListsKey(),
      });
    },
  });
}
```

### 4. Prefetching

```typescript
// features/todos/hooks/use-todo-prefetch.ts
import { useQueryClient } from "@tanstack/react-query";
import { todoQueries } from "../queries";

export function useTodoPrefetch() {
  const queryClient = useQueryClient();

  const prefetchTodo = (id: number) => {
    queryClient.prefetchQuery(todoQueries.detail(id));
  };

  const prefetchTodosList = (sort?: string) => {
    queryClient.prefetchQuery(todoQueries.list(sort));
  };

  const prefetchTodosByUser = (userId: number, sort?: string) => {
    queryClient.prefetchQuery(todoQueries.byUser(userId, sort));
  };

  return {
    prefetchTodo,
    prefetchTodosList,
    prefetchTodosByUser,
  };
}
```

### 5. Provider Setup

```typescript
// components/providers/query-provider.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "../../lib/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 6. Error Handling

```typescript
// components/error-boundary.tsx
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  );
}
```

### 7. Component Usage

```typescript
// components/TodoList.tsx
import { useTodos } from "../features/todos/hooks/use-todos";
import { useCreateTodo } from "../features/todos/hooks/use-todo-mutations";
import { useTodoPrefetch } from "../features/todos/hooks/use-todo-prefetch";

export function TodoList({ sort }: { sort?: string }) {
  const { data: todos, isPending, error } = useTodos(sort);
  const { mutate: createTodo, isPending: isCreating } = useCreateTodo();
  const { prefetchTodo } = useTodoPrefetch();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {todos?.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onHover={() => prefetchTodo(todo.id)}
        />
      ))}
      <button
        onClick={() => createTodo({ title: "New Todo" })}
        disabled={isCreating}
      >
        {isCreating ? "Creating..." : "Add Todo"}
      </button>
    </div>
  );
}
```

## Best Practices

### 1. **Loading State Pattern**

Use `isPending` for loading states instead of `isLoading` and `isFetching`. The pattern is:

```typescript
const { data, isPending, error } = useQuery(...);

// Simple pattern: isPending → error → data
if (isPending) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

return <div>{/* Render data */}</div>;
```

**Why `isPending`?**

- `isPending` is true when the query has no data.
- `isLoading` is true when query has no data and is fetching (initial load).
- `isFetching` includes background refetches, which usually shouldn't block the UI
- Simpler mental model: pending → error → success

**When to use `isFetching`:**

- Only if you need to show a subtle loading indicator during background refetches
- Use `isFetching && data` to show an overlay while keeping existing data visible

### 2. **Naming Conventions**

- **Query Factories**: `featureQueries` (e.g., `todoQueries`, `userQueries`)
- **Key-only factories**: Must end with `Key` (e.g., `allKey`, `allListsKey`, `allDetailsKey`)
- **Complete factories**: Use action names like `list`, `detail`, `byUser`
- **Custom hooks**: Prefix with `use` (e.g., `useTodos`, `useCreateTodo`)

### 3. **Key Structure**

```typescript
// Good: Hierarchical and consistent
["todos", "list", { sort: "asc" }][("todos", "detail", 123)][("todos", "user", 456, "list", { sort: "desc" })][
  // Bad: Inconsistent structure
  ("todos", "list", "asc")
][("todo", "detail", 123)]; // Missing object wrapper // Inconsistent singular/plural
```

### 4. **TypeScript Usage**

```typescript
// Always use const assertions for better type inference
allKey: () => ['todos'] as const,
list: (sort?: string) => queryOptions({
  queryKey: [...todoQueries.allListsKey(), { sort }] as const,
  // ... rest of options
}),
```

### 5. **Error Handling Strategy**

```typescript
// Global error configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error) => {
        // Show toast for cached data, throw for fresh data
        return !error.data;
      },
    },
    mutations: {
      throwOnError: true,
    },
  },
});
```

## Migration Strategy

### Phase 1: Setup

1. Install React Query and dependencies
2. Create QueryClient configuration
3. Set up providers and error boundaries

### Phase 2: Create Query Factories

1. Identify existing data fetching patterns
2. Create query factories for each feature
3. Start with the most commonly used queries

### Phase 3: Convert Hooks

1. Replace existing `useQuery` calls with factory-based hooks
2. Update mutation hooks to use factories
3. Test thoroughly

### Phase 4: Advanced Features

1. Implement prefetching
2. Add optimistic updates
3. Set up proper error handling

### Phase 5: Optimization

1. Add proper TypeScript types
2. Implement query invalidation strategies
3. Add performance monitoring

## Common Patterns

### 1. **Dependent Queries**

```typescript
// User must be loaded before loading user's todos
export function useUserTodos(userId: number) {
  const { data: user } = useUser(userId);

  return useQuery({
    ...todoQueries.byUser(userId),
    enabled: !!user, // Only run when user is loaded
  });
}
```

### 2. **Parallel Queries**

```typescript
export function useDashboardData() {
  const todosQuery = useQuery(todoQueries.list());
  const usersQuery = useQuery(userQueries.list());
  const postsQuery = useQuery(postQueries.list());

  return {
    todos: todosQuery.data,
    users: usersQuery.data,
    posts: postsQuery.data,
    isPending: todosQuery.isPending || usersQuery.isPending || postsQuery.isPending,
  };
}
```

### 3. **Infinite Queries**

```typescript
// features/posts/queries.ts
export const postQueries = {
  allKey: () => ["posts"] as const,
  allListsKey: () => [...postQueries.allKey(), "list"] as const,
  infiniteList: (filters: PostFilters) =>
    queryOptions({
      queryKey: [...postQueries.allListsKey(), "infinite", filters] as const,
      queryFn: ({ pageParam = 0 }) => fetchPosts({ ...filters, page: pageParam }),
      ),
};

// features/posts/hooks/use-posts.ts
export function useInfinitePosts(filters: PostFilters) {
  return useInfiniteQuery({...postQueries.infiniteList(filters),
  getNextPageParam: (lastPage) => lastPage.nextPage,
  initialPageParam: 0,});
}
```

### 4. **Pagination Patterns**

#### A. **Traditional Pagination (External State)**

```typescript
// features/posts/queries.ts
export const postQueries = {
  allKey: () => ["posts"] as const,
  allListsKey: () => [...postQueries.allKey(), "list"] as const,

  // Paginated query factory
  list: (filters: PostFilters, page: number = 1) =>
    queryOptions({
      queryKey: [...postQueries.allListsKey(), { ...filters, page }] as const,
      queryFn: () => fetchPosts({ ...filters, page }),



    }),
};

// features/posts/hooks/use-posts.ts
export function usePosts(filters: PostFilters, page: number = 1) {
  return useQuery({...postQueries.list(filters, page), placeholderData: (previousData) => previousData,});
}

// Component implementation
export function PostList({ filters }: { filters: PostFilters }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isPlaceholderData } = usePosts(filters, page);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  if (isPending && !data) return <div>Loading...</div>;

  return (
    <div>
      <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        {data?.posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>

      <div>
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1 || isPlaceholderData}
        >
          Previous
        </button>

        <span>Page {page} of {data?.totalPages}</span>

        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= (data?.totalPages || 1) || isPlaceholderData}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

#### B. **Infinite Queries**

```typescript
// features/posts/queries.ts
export const postQueries = {
  allKey: () => ["posts"] as const,
  allListsKey: () => [...postQueries.allKey(), "list"] as const,

  // Infinite query factory
  infiniteList: (filters: PostFilters) =>
    queryOptions({
      queryKey: [...postQueries.allListsKey(), "infinite", filters] as const,
      queryFn: ({ pageParam = 1 }) => fetchPosts({ ...filters, page: pageParam }),

    }),
};

// features/posts/hooks/use-posts.ts
export function useInfinitePosts(filters: PostFilters) {
  return useInfiniteQuery({...postQueries.infiniteList(filters),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      getPreviousPageParam: (firstPage) => firstPage.prevPage,
      initialPageParam: 1,
      });
}

// Component implementation
export function InfinitePostList({ filters }: { filters: PostFilters }) {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useInfinitePosts(filters);

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  return (
    <div>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>

      <div>
        <button
          onClick={() => fetchPreviousPage()}
          disabled={!hasPreviousPage || isFetchingPreviousPage}
        >
          {isFetchingPreviousPage ? "Loading..." : "Previous"}
        </button>

        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Next"}
        </button>
      </div>
    </div>
  );
}
```

**When to Use Each Pattern:**

- **Traditional Pagination**: When you need discrete page navigation with page numbers
- **Infinite Queries**: When you want seamless infinite scrolling or "Load More" functionality

### 5. **Optimistic Updates**

```typescript
export function useUpdateTodoOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateTodo"], //optional, but it's a good practice to give it a key to invalidate.
    mutationFn: updateTodo,
    onMutate: async (newTodo) => {
      const queryKey = todoQueries.detail(newTodo.id).queryKey;
      await queryClient.cancelQueries({ queryKey }); // Cancel outgoing refetches
      const previous = queryClient.getQueryData(todoQueries.detail(newTodo.id).queryKey);
      const rollback = () => queryClient.setQueryData(queryKey, previous);

      // Optimistically update
      queryClient.setQueryData(todoQueries.detail(newTodo.id).queryKey, newTodo);

      return { rollback };
    },
    onError: (err, newTodo, context) => {
      context?.rollback();
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      // If you use this remaining Queries, then give it mutation key to invalidate.
      const remainingQueries = queryClient.isMutating({mutationKey: ["updateTodo"]});
      if (remainingQueries === 1) {
      queryClient.invalidateQueries({
        queryKey: todoQueries.detail(variables.id).queryKey,
      });
    },
  });
}
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors with queryOptions**

   ```typescript
   // Make sure to import queryOptions
   import { queryOptions } from '@tanstack/react-query'

   // Use const assertions
   queryKey: [...todoQueries.allListsKey(), { sort }] as const,
   ```

2. **Incorrect Invalidation**

   ```typescript
   // Wrong: Passing array directly
   queryClient.invalidateQueries(todoQueries.allListsKey());

   // Correct: Wrapping in object
   queryClient.invalidateQueries({
     queryKey: todoQueries.allListsKey(),
   });
   ```

3. **Missing Dependencies in QueryKey**

   ```typescript
   // Make sure all variables used in queryFn are in queryKey
   list: (sort?: string) => queryOptions({
     queryKey: [...todoQueries.allListsKey(), { sort }] as const, // ✅ sort included
     queryFn: () => fetchTodos(sort), // ✅ sort used in queryFn
   }),
   ```

### Performance Tips

1. **Configure staleTime and gcTime globally** in QueryClient - only override in hooks when needed
2. **Use select option** for data transformation to prevent unnecessary re-renders
3. **Implement proper prefetching** for better UX
4. **Use placeholderData** to keep previous data visible during transitions
5. **Use React.memo** for components that receive query data (if not using React Compiler)

### Debugging

1. **Enable React Query DevTools** in development
2. **Use consistent queryKey structure** for easier debugging
3. **Add logging** to query functions for debugging
4. **Monitor network requests** in browser dev tools
5. **Use queryClient.getQueryData()** to inspect cache state

---

## Conclusion

This architecture provides a scalable, maintainable approach to React Query integration that follows the recommendations from core maintainer TkDodo. The Query Factories pattern ensures that query keys and functions stay together while providing excellent TypeScript support and reusability across your application.

Remember to:

- Keep queryKey and queryFn together
- Use feature-based organization
- Implement proper error handling
- Follow TypeScript best practices
- Test thoroughly during migration

For more advanced patterns and edge cases, refer to the official React Query documentation.
