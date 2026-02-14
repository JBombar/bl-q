'use client';

import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { StageLayout } from '@/components/layout';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface InsertScreenProps {
  question: QuizQuestionWithOptions;
  questionIndex?: number;
  onComplete?: () => void;
}

/**
 * Lightweight parser for formatted text
 * Supports: **bold**, *italic*, and paragraph breaks (\n\n)
 */
function parseFormattedText(text: string) {
  return text.split('\n\n').map((paragraph, pIdx) => {
    // Split by both **bold** and *italic* markers
    const parts = paragraph.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return (
      <p key={pIdx} className={pIdx > 0 ? 'mt-[12px]' : ''}>
        {parts.map((part, idx) => {
          // Bold text
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
          }
          // Italic text
          if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
            return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
          }
          return <span key={idx}>{part}</span>;
        })}
      </p>
    );
  });
}

export function InsertScreen({ question, questionIndex, onComplete }: InsertScreenProps) {
  const { nextQuestion, previousQuestion, currentQuestionIndex, quiz } = useQuizState();

  const handleContinue = () => {
    // Check if this is the last question
    const isLastQuestion = quiz && questionIndex !== undefined && questionIndex === quiz.questions.length - 1;

    if (isLastQuestion && onComplete) {
      onComplete();
    } else {
      nextQuestion();
    }
  };

  const handleBack = () => {
    previousQuestion();
  };

  const isValidationScreen = question.question_type === 'validation_info';
  const isEducationalInsert = question.question_type === 'education_insert';
  const canGoBack = currentQuestionIndex > 0;
  const showExpertBadge = question.question_key === 'e07';

  // Map question_key to image paths for educational inserts
  const getInsertImageUrl = (questionKey: string): string => {
    const imageMap: Record<string, string> = {
      'e01': '/images/educational-inserts/e1.png',
      'e02': '/images/educational-inserts/e2.png',
      'e03': '/images/educational-inserts/e3.png',
      'e04': '/images/educational-inserts/e4.png',
      'e05': '/images/educational-inserts/e5.png',
      'e06': '/images/educational-inserts/e6.png',
      'e07': '/images/educational-inserts/e7.png',
    };
    return imageMap[questionKey] || '';
  };

  const insertImageUrl = isEducationalInsert && question.question_key
    ? getInsertImageUrl(question.question_key)
    : question.image_url;

  // Special rendering for validation screen
  if (isValidationScreen) {
    return (
      <StageLayout
        showProgress={false}
        showCTA
        ctaLabel="Pokračovat"
        onCtaClick={handleContinue}
        variant="gate"
        showBackButton={canGoBack}
        onBackClick={handleBack}
        showHeaderLogo={true}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-start h-full text-center px-4 pt-7 pb-2 md:pt-10 md:pb-3"
        >
          {/* Title - highlighting "vědeckých postupů" in green */}
          <h1 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 md:mb-2 max-w-md px-2" style={{ fontFamily: 'Figtree', lineHeight: '115%' }}>
            {question.question_text.split('vědeckých postupů').map((part, idx, arr) => (
              idx < arr.length - 1 ? (
                <span key={idx}>
                  {part}<span style={{ color: '#2D5F4C' }}>vědeckých postupů</span>
                </span>
              ) : part
            ))}
          </h1>

          {/* Subtitle */}
          {question.question_subtext && (
            <p className="text-[11px] md:text-sm text-gray-600 mb-2 md:mb-3 max-w-sm px-2" style={{ fontFamily: 'Figtree' }}>
              {question.question_subtext}
            </p>
          )}

          {/* Logos image */}
          <div className="w-full max-w-[260px] md:max-w-[300px] mb-1">
            <Image
              src="/images/logos.png"
              alt="Vědecké instituce"
              width={320}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>
        </motion.div>
      </StageLayout>
    );
  }

  // Default rendering for educational inserts
  return (
    <StageLayout
      showProgress={false}
      showCTA
      ctaLabel="Pokračovat"
      onCtaClick={handleContinue}
      variant="gate"
      showBackButton={canGoBack}
      onBackClick={handleBack}
      showHeaderLogo={true}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center h-full w-full"
      >
        <div className="flex flex-col w-full max-w-[351px]">
        {/* Featured image — 351px × 222px, rounded 10px */}
        {insertImageUrl && (
          <div className="relative w-full h-[222px] rounded-[10px] overflow-hidden">
            <Image
              src={insertImageUrl}
              alt={question.question_text}
              fill
              sizes="351px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Heading */}
        <h2 className={`mt-[16px] font-bold text-[#327455] font-figtree ${showExpertBadge ? 'text-[22px] leading-[28px] text-center' : 'text-[18px] leading-[25.2px] text-left'}`}>
          {question.question_text}
        </h2>

        {/* Body text */}
        {question.question_subtext && (
          <div className={`mt-[12px] text-[15px] leading-[21px] text-[#292424] font-figtree ${showExpertBadge ? 'italic text-center' : 'font-normal text-left'}`}>
            {parseFormattedText(question.question_subtext)}
          </div>
        )}

        {/* Expert Badge — only on e07 */}
        {showExpertBadge && (
          <div className="mt-[16px] w-full h-[110px] rounded-[10px] border border-[#e6e6e6] bg-white overflow-hidden">
            {/* Badge header */}
            <div className="h-[31px] bg-[#327455]/[0.12] flex items-center justify-center">
              <span className="text-[14px] leading-[14px] font-normal text-[#327455] font-figtree">
                Obsah kontrolovaný odborníkem
              </span>
            </div>
            {/* Expert info */}
            <div className="flex items-center h-[79px] px-[12px] gap-[8px]">
              {/* Expert badge icon */}
              <Image
                src="/icons/expert-badge.svg"
                alt=""
                width={47}
                height={47}
                className="w-[47px] h-[47px] shrink-0"
              />
              {/* Text block */}
              <div className="flex flex-col">
                <span className="text-[16px] leading-[20px] font-bold text-[#292424] font-figtree">
                  Miroslav Macháček
                </span>
                <span className="text-[15px] leading-[18px] italic text-[#292424] font-figtree">
                  Expert na stres a mentální zdraví
                </span>
              </div>
            </div>
          </div>
        )}
        </div>
      </motion.div>
    </StageLayout>
  );
}
