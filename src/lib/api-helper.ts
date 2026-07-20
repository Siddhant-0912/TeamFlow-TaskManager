import { NextResponse } from 'next/server';

export const ApiResponse = {
  success: (data: unknown, status = 200) => {
    return NextResponse.json(data, { status });
  },
  error: (message: string, status = 400) => {
    return NextResponse.json({ error: message }, { status });
  },
  unauthorized: () => {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  },
  forbidden: (message = 'Forbidden') => {
    return NextResponse.json({ error: message }, { status: 403 });
  },
  notFound: (message = 'Resource not found') => {
    return NextResponse.json({ error: message }, { status: 404 });
  },
  serverError: (message = 'Internal server error') => {
    return NextResponse.json({ error: message }, { status: 500 });
  },
};

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error';
}
