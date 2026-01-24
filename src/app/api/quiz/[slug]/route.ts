import { NextRequest, NextResponse } from 'next/server';
import { getQuizBySlug } from '@/lib/services/quiz.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const quiz = await getQuizBySlug(slug);

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
