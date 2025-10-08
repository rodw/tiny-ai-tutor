/*
 * Handles the "Example Prompts" modal dialog popup and embedded actions.
 */
import { useRef } from "react";
import useScrollLock from "../hooks/useScrollLock";
import useModalDismiss from "../hooks/useModalDismiss";

import styles from "./ExamplePrompts.module.css";

export const EXAMPLE_PROMPTS = [
  "Can you walk me through a practice problem using the Pythagorean theorem?",
  "Pretend you’re quizzing me in a debate format: argue one side of Federalism vs Anti-Federalism then let me respond.",
  "I have biology test coming up on Cellular Respiration. Help me prepare a study guide that covers the chemical and metabolic compounds, reactions, processes and cycles that take place. What are the stages of cellular respiration? What other concepts and vocabulary will I need to know?",
  "Outline the main themes of Hamlet in bullet points",
  "What was the significance of the Federalist Papers in shaping the U.S. Constitution? What shaped the Federalist Papers?",
  "Why is the number phi called the Golden Ratio? What does it have to do with the Fibonacci sequence? Can I use phi to compute Fn?",
  "Help me practice writing a DBQ (document-based question) essay on the causes of the Great Depression. I'm not sure where to begin. Provide an complete example of a DBQ prompt, including references to the specific historical documents, and walk me through how to respond.",
  "Create a study guide that summarizes, compares and contrasts the core algebraic structures found in abstract algebra (groups, rings, fields, vector spaces, lattices, etc) and their basic properties",
  "Describe the timeline, context, factors and forces that led to creation and eventual replacement of Articles of Confederation. What were the pros and cons of the Articles? How were they different from the Constitution? In what ways did they influence the Constitution? Why was it necessary to replace the Articles of Confederation?",
  "Describe photosynthesis in a short (less than 300 words) allegorical story so I can remember it better. After the story, provide a brief explanation of the allegory.",
];

interface ExamplePromptsProps {
  /** is example prompts dialog open (visible)? */
  isOpen: boolean;
  /** callback to invoke when dialog is dismissed */
  onClose: () => void;
  /** callback to invoke when a prompt is selected within the dialog menu */
  onSelect: (prompt: string) => void;
  /** the input field (scrolled into view on select) */
  inputRef?: React.RefObject<HTMLInputElement>; // TODO should just move into onSelect handler
  /** the list of prompts to show in the menu */
  prompts?: string[];
}

export default function ExamplePrompts({isOpen, onClose, onSelect, inputRef, prompts = EXAMPLE_PROMPTS}: ExamplePromptsProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  useScrollLock(isOpen);
  useModalDismiss(isOpen,onClose,menuRef);
  if (!isOpen) {
    return null;
  } else {
    return (
      <div className={`${styles["eg-prompts-overlay"]} no-print`} role="dialog" aria-modal="true">
        <div className={`${styles["eg-prompts-menu"]} no-print`} ref={menuRef} tabIndex={-1}>
          <div className={styles["eg-prompts-header"]}>
            <div className={styles["eg-prompts-header-head"]}>
              Example Prompts
            </div>
            <button
              className={styles["eg-prompts-close"]}
              type="button"
              onClick={onClose}
              aria-label="Close example prompts menu"
            >×</button>
          </div>
          <div className={styles["eg-prompts-content"]}>
            <ul>
              {prompts.map((prompt, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className={styles["eg-prompt-link"]}
                    tabIndex={0}
                    onClick={e => {
                      e.preventDefault();
                      onSelect(prompt);
                      onClose();
                      setTimeout(() => {
                        inputRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        inputRef?.current?.focus();
                      }, 0);
                    }}
                  >{prompt}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles["eg-prompts-footer"]}>
            <div className={styles["eg-prompts-footer-note"]}></div>
            <button
              className={styles["eg-prompts-cancel"]}
              type="button"
              onClick={onClose}
            >Cancel</button>
          </div>
        </div>
      </div>
    );
  }
}
