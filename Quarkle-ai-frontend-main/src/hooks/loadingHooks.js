import { useState, useEffect } from "react";

export function useLoadingProgress(initialProgress = 100, initialMessage = "Loading", initialLimit = 0, initialEstimate = null) {
  const [loadingProgress, setLoadingProgress] = useState(initialProgress);
  const [loadingMessage, setLoadingMessage] = useState(initialMessage);
  const [progressLimit, setProgressLimit] = useState(initialLimit);
  const [estimateTotalTime, setEstimateTotalTime] = useState(initialEstimate);

  const loadingSpeed = (estimateTotalTime / (100 - loadingProgress)) * 1000; // time in ms to add 1 pct to progress bar

  // This effect handles the actual loading progress increment
  useEffect(() => {
    if (loadingProgress < progressLimit) {
      const timer = setTimeout(() => {
        setLoadingProgress((prevProgress) => Math.min(prevProgress + 1, progressLimit, 99));
      }, loadingSpeed);
      return () => clearTimeout(timer);
    }
  }, [loadingProgress, progressLimit]);

  // Every second this effect updates the estimated time remaining
  useEffect(() => {
    if (loadingProgress < 100) {
      const timer = setTimeout(() => {
        setEstimateTotalTime((prevTime) => (prevTime === 1 ? -1 : prevTime - 1)); // Skip 0 for UI purposes
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [estimateTotalTime]);

  // Reset the loading bar
  useEffect(() => {
    if (loadingProgress === 100) {
      setTimeout(() => {
        setLoadingProgress(100);
        setLoadingMessage("Loading");
        setProgressLimit(0);
        setEstimateTotalTime(null);
      }, 1000);
    }
  }, [loadingProgress]);

  return {
    loadingProgress,
    setLoadingProgress,
    loadingMessage,
    setLoadingMessage,
    progressLimit,
    setProgressLimit,
    estimateTotalTime,
    setEstimateTotalTime,
  };
}
