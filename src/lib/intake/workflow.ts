import type { IntakeStatus } from "@/lib/intake/types";

const allowedTransitions: Record<IntakeStatus, readonly IntakeStatus[]> = {
  RECEIVED: ["TRIAGE", "CLOSED"],
  TRIAGE: ["NEEDS_INFORMATION", "QUALIFIED", "DECLINED", "CLOSED"],
  NEEDS_INFORMATION: ["TRIAGE", "DECLINED", "CLOSED"],
  QUALIFIED: ["NEEDS_INFORMATION", "APPROVED", "DECLINED", "CLOSED"],
  APPROVED: ["CONVERTED", "CLOSED"],
  DECLINED: ["CLOSED"],
  CONVERTED: ["CLOSED"],
  CLOSED: [],
};

export function canTransitionIntake(from: IntakeStatus, to: IntakeStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function nextIntakeStatuses(status: IntakeStatus): readonly IntakeStatus[] {
  return allowedTransitions[status];
}
