export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export const parsePagination = (
  query: Record<string, unknown>,
): PaginationParams => {
  const page = Math.max(1, parseInt(String(query["page"] ?? 1), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(query["limit"] ?? 20), 10) || 20),
  );

  return { page, limit, offset: (page - 1) * limit };
};

export const paginate = <T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> => {
  const total_pages = Math.ceil(total / params.limit);
  
  return {
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      total_pages,
      has_next: params.page < total_pages,
      has_prev: params.page > 1,
    },
  };
};
