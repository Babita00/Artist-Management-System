export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const paginate = async <T>(
  page: number = 1,
  limit: number = 10,
  fetchQuery: (limit: number, offset: number) => Promise<T[]>,
  countQuery: () => Promise<number>
): Promise<PaginatedResponse<T>> => {
  const sanitizedPage = Math.max(1, page);
  const sanitizedLimit = Math.min(Math.max(1, limit), 100); // Cap at 100
  const offset = (sanitizedPage - 1) * sanitizedLimit;

  // Run count and fetch in parallel for better performance
  const [data, total] = await Promise.all([
    fetchQuery(sanitizedLimit, offset),
    countQuery()
  ]);

  return {
    data,
    total,
    page: sanitizedPage,
    limit: sanitizedLimit
  };
};
