# Session Handoff

Every long-running agent session ends with this compact, exact report:

```text
ENVIRONMENT:
TASK:
OWNER:
BASE_SHA:
HEAD_BEFORE:
HEAD_AFTER:
BRANCH:
CHANGED_FILES:
TESTS_RUN:
TESTS_PASSED:
TESTS_FAILED:
CI_STATUS:
BLOCKER_CLASS:
ROLLBACK_POINT:
HUMAN_GATE:
SAFE_FOR_INTEGRATION_REVIEW:
EXACT_REMAINING_BLOCKER:
NEXT_SAFE_ACTION:
```

Use full SHAs, exact paths, check names, and conclusions. Redact secret values.
If `HEAD_AFTER` does not yet exist, say `NOT_PUBLISHED`; do not guess. The
next agent must be able to resume from this report and the task contract without
reading chat history.
