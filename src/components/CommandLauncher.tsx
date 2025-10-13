"use client"

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCommand, FiSend, FiX, FiZap, FiArrowRight, FiChevronDown, FiCheck, FiClock, FiLoader } from 'react-icons/fi';
import { parseCommand, getSuggestedCommands } from '@/utils/commandParser';
import { saveToolInteraction } from '@/utils/recommendationEngine';

interface CommandLauncherProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandLauncher: React.FC<CommandLauncherProps> = ({ isOpen, onClose }) => {
  const [command, setCommand] = useState('');
  const [suggestedCommands, setSuggestedCommands] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [parsedTools, setParsedTools] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [executionSteps, setExecutionSteps] = useState<{ step: string; status: 'pending' | 'processing' | 'completed' | 'error' }[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Load suggested commands
      setSuggestedCommands(getSuggestedCommands());
    }
  }, [isOpen]);

  // Handle command input
  const handleCommandChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommand(e.target.value);
    setShowSuggestions(e.target.value.length > 0);

    // Reset results when command changes
    if (result) {
      setResult(null);
    }

    // Reset parsed tools when command changes
    if (parsedTools.length > 0) {
      setParsedTools([]);
    }
  };

  // Handle command submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!command.trim()) return;

    // Reset previous results
    setResult(null);
    setExecutionSteps([]);
    setCurrentStepIndex(-1);

    // Parse the command
    const { tools, actions, chainName, chainDescription, steps = [] } = parseCommand(command);

    // If no tools found, show error
    if (tools.length === 0) {
      setResult({
        success: false,
        message: "I couldn't understand that command. Try one of the suggested commands or be more specific."
      });

      // Reset launcher after 4 seconds
      setTimeout(() => {
        resetLauncher();
      }, 4000);

      return;
    }

    // Set parsed tools
    setParsedTools(tools);

    // Track tool usage
    tools.forEach(tool => {
      saveToolInteraction(tool.id);
    });

    // Create execution steps
    const stepsToExecute = steps.length > 0
      ? steps.map(step => ({ step, status: 'pending' as const }))
      : tools.map(tool => ({ step: `Use ${tool.name}`, status: 'pending' as const }));

    setExecutionSteps(stepsToExecute);

    // Start processing
    setIsProcessing(true);

    // Execute steps one by one with realistic timing
    const executeSteps = async () => {
      for (let i = 0; i < stepsToExecute.length; i++) {
        // Update current step
        setCurrentStepIndex(i);

        // Set step to processing
        setExecutionSteps(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'processing' };
          return updated;
        });

        try {
          // Execute the actual step
          await executeStep(tools[i], stepsToExecute[i].step);

          // Set step to completed
          setExecutionSteps(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], status: 'completed' };
            return updated;
          });
        } catch (error) {
          console.error('Step execution error:', error);

          // Set step to error
          setExecutionSteps(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], status: 'error' };
            return updated;
          });

          // Stop execution on error
          setIsProcessing(false);
          setResult({
            success: false,
            message: `Failed at step: ${stepsToExecute[i].step}`
          });

          setTimeout(() => {
            resetLauncher();
          }, 4000);

          return;
        }
      }

      // All steps completed
      setIsProcessing(false);
      setResult({
        success: true,
        message: chainName
          ? `Successfully executed "${chainName}": ${chainDescription}`
          : `Successfully executed ${tools.length} tools in sequence`
      });

      // Reset launcher after 5 seconds
      setTimeout(() => {
        resetLauncher();
      }, 5000);
    };

    // Start execution
    executeSteps();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setCommand(suggestion);
    setShowSuggestions(false);

    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Close on Escape
    if (e.key === 'Escape') {
      onClose();
    }

    // Create new line on Shift+Enter
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setCommand(prev => prev + '\n');
    }
  };

  // Execute a single step
  const executeStep = async (tool: any, stepDescription: string): Promise<void> => {
    // Simulate realistic processing time based on tool type
    let processingTime = 2000; // Default 2 seconds

    if (tool.id.includes('converter')) {
      processingTime = 3000; // Conversion takes longer
    } else if (tool.id.includes('enhancer')) {
      processingTime = 5000; // Enhancement takes even longer
    } else if (tool.id.includes('detector')) {
      processingTime = 1500; // Detection is faster
    }

    // Add some randomness
    processingTime += Math.random() * 1000;

    await new Promise(resolve => setTimeout(resolve, processingTime));

    // In a real implementation, this would:
    // 1. Navigate to the tool page
    // 2. Trigger the tool's functionality
    // 3. Handle file uploads/processing
    // 4. Return results

    console.log(`Executed step: ${stepDescription} using tool: ${tool.name}`);
  };

  // Reset the launcher state
  const resetLauncher = () => {
    setCommand('');
    setParsedTools([]);
    setResult(null);
    setExecutionSteps([]);
    setCurrentStepIndex(-1);
    setIsProcessing(false);
    setShowSuggestions(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                  <FiCommand className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold">One-Command AI Tools Launcher</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Command Input */}
            <div className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={command}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleCommandChange(e)}
                    onKeyDown={handleKeyDown}
                    onKeyPress={(e) => {
                      // Submit on Enter (without Shift)
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (command.trim() && !isProcessing) {
                          handleSubmit(e);
                        }
                      }
                    }}
                    placeholder="Type a command like 'Convert PDF to Word and enhance quality'..."
                    className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[60px] shadow-sm"
                    disabled={isProcessing}
                    rows={command.split('\n').length > 3 ? 3 : command.split('\n').length}
                    style={{ overflowY: 'auto', maxHeight: '150px' }}
                  />
                  <div className="absolute right-3 bottom-3">
                    <button
                      type="submit"
                      className="bg-blue-600 dark:bg-blue-700 text-white p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      disabled={!command.trim() || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <FiSend className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Suggestions */}
              {showSuggestions && suggestedCommands.length > 0 && !result && (
                <div className="mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <FiChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Suggested commands</span>
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {suggestedCommands
                      .filter(s => s.toLowerCase().includes(command.toLowerCase()))
                      .map((suggestion, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Parsed Tools */}
              {parsedTools.length > 0 && !result && executionSteps.length === 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tools that will be used:
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    {parsedTools.map((tool, index) => (
                      <React.Fragment key={tool.id}>
                        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
                          <FiZap className="h-3 w-3 mr-1" />
                          {tool.name}
                        </div>
                        {index < parsedTools.length - 1 && (
                          <FiArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution Steps */}
              {executionSteps.length > 0 && (
                <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium">Executing command...</h3>
                  </div>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {executionSteps.map((step, index) => (
                      <li
                        key={index}
                        className={`px-4 py-3 flex items-center ${
                          currentStepIndex === index && step.status === 'processing'
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                      >
                        <div className="mr-3 flex-shrink-0">
                          {step.status === 'pending' && (
                            <FiClock className="h-5 w-5 text-gray-400" />
                          )}
                          {step.status === 'processing' && (
                            <div className="animate-spin h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full" />
                          )}
                          {step.status === 'completed' && (
                            <FiCheck className="h-5 w-5 text-green-500" />
                          )}
                          {step.status === 'error' && (
                            <FiX className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className={`text-sm ${
                            step.status === 'completed'
                              ? 'text-gray-700 dark:text-gray-300'
                              : step.status === 'processing'
                                ? 'text-blue-700 dark:text-blue-300 font-medium'
                                : step.status === 'error'
                                  ? 'text-red-700 dark:text-red-300'
                                  : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {step.step}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-lg ${
                    result.success
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}
                >
                  {result.message}

                  {result.success && (
                    <div className="mt-2 text-sm">
                      <p>All steps completed successfully. In a full implementation, this would:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {executionSteps.map((step, index) => (
                          <li key={index}>{step.step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Pro Tip:</span> Try "Convert PDF to Word" or "Enhance image quality"
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300 font-mono">Shift+Enter</kbd>
                    <span className="ml-1">New line</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300 font-mono">Enter</kbd>
                    <span className="ml-1">Submit</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandLauncher;



