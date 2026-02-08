'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePostQuizState } from '@/hooks/usePostQuizState';
import { StressStateScreen } from './StressStateScreen';
import { TimeCommitmentScreen } from './TimeCommitmentScreen';
import { MicroCommitmentScreen } from './MicroCommitmentScreen';
import { EmailCaptureScreen } from './EmailCaptureScreen';
import { NameCaptureScreen } from './NameCaptureScreen';
import { ProjectionScreen } from './ProjectionScreen';
import type { QuizCompleteResponse } from '@/types/funnel.types';

// Stable key for the micro-commitment flow so it doesn't remount between C1/C2/C3
const getAnimationKey = (screen: string) =>
  screen === 'C1' || screen === 'C2' || screen === 'C3' ? 'micro-flow' : screen;

interface PostQuizFlowProps {
  /** Initial data from /api/quiz/complete */
  initialData: QuizCompleteResponse;
  /** Callback when funnel is complete (navigate to offer page) */
  onComplete: () => void;
}

/**
 * Post-Quiz Funnel Flow Container
 * Orchestrates screens A through F after quiz completion
 */
export function PostQuizFlow({ initialData, onComplete }: PostQuizFlowProps) {
  const {
    currentScreen,
    completeData,
    funnelData,
    isSaving,
    initialize,
    goToNextScreen,
    setScreen,
    saveTimeCommitment,
    saveMicroCommitment,
    saveEmail,
    saveFirstName,
    sendPlanEmail,
    completeFunnel,
  } = usePostQuizState();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initialize(initialData);
    setIsInitialized(true);
  }, [initialData, initialize]);

  // Wait for initialization
  if (!isInitialized || !completeData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#F9A201] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { insights } = completeData;

  // Handle Screen E submit (save name + trigger email + advance)
  const handleNameSubmit = async (firstName: string) => {
    await saveFirstName(firstName);

    // Trigger email in background (non-blocking)
    sendPlanEmail().catch(console.error);

    // Advance to Screen F
    goToNextScreen();
  };

  // Handle Screen F continue (complete funnel + navigate to offer)
  const handleProjectionContinue = async () => {
    await completeFunnel();
    onComplete();
  };

  // Animation variants for screen transitions
  const screenVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'A':
        return (
          <StressStateScreen
            insights={insights}
            onContinue={goToNextScreen}
          />
        );

      case 'B':
        return (
          <TimeCommitmentScreen
            onSelect={saveTimeCommitment}
            isSaving={isSaving}
          />
        );

      case 'C1':
      case 'C2':
      case 'C3':
        return (
          <MicroCommitmentScreen
            onSave={saveMicroCommitment}
            onComplete={() => setScreen('D')}
            isSaving={isSaving}
          />
        );

      case 'D':
        return (
          <EmailCaptureScreen
            onSubmit={saveEmail}
            isSaving={isSaving}
          />
        );

      case 'E':
        return (
          <NameCaptureScreen
            onSubmit={handleNameSubmit}
            isSaving={isSaving}
          />
        );

      case 'F':
        return (
          <ProjectionScreen
            firstName={funnelData.firstName || 'there'}
            normalizedScore={insights.normalizedScore}
            timeCommitmentMinutes={funnelData.timeCommitmentMinutes || 10}
            stressStage={insights.stressStage}
            onContinue={handleProjectionContinue}
          />
        );

      case 'complete':
        // This should trigger navigation to offer page
        // But in case we're still here, show a loading state
        return (
          <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#F9A201] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Pripravujeme tvou nabidku...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={getAnimationKey(currentScreen)}
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
}
