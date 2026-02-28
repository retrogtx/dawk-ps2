import type { DecisionTreeData, DecisionNode } from "@/lib/db/schema";

export interface DecisionStep {
  nodeId: string;
  label: string;
  type: DecisionNode["type"];
  result?: boolean;
  answer?: string;
  action?: DecisionNode["action"];
}

export interface DecisionResult {
  path: DecisionStep[];
  recommendation?: DecisionNode["action"];
}

export function executeDecisionTree(
  tree: DecisionTreeData,
  extractedParams: Record<string, string>,
): DecisionResult {
  const path: DecisionStep[] = [];
  let currentNode = tree.nodes[tree.rootNodeId];

  let maxSteps = 50; // safety limit
  while (currentNode && maxSteps-- > 0) {
    if (currentNode.type === "condition") {
      const value = extractedParams[currentNode.condition!.field];
      const result = evaluateCondition(currentNode.condition!, value);
      path.push({
        nodeId: currentNode.id,
        label: currentNode.label,
        type: "condition",
        result,
      });
      const nextId = result ? currentNode.trueChildId : currentNode.falseChildId;
      currentNode = nextId ? tree.nodes[nextId] : undefined!;
    } else if (currentNode.type === "question") {
      const field = currentNode.question?.extractFrom;
      const answer = field ? extractedParams[field] : undefined;

      if (answer && currentNode.childrenByAnswer?.[answer]) {
        path.push({
          nodeId: currentNode.id,
          label: currentNode.label,
          type: "question",
          answer,
        });
        currentNode = tree.nodes[currentNode.childrenByAnswer[answer]];
      } else {
        // Can't resolve — record and stop
        path.push({
          nodeId: currentNode.id,
          label: currentNode.label,
          type: "question",
          answer: answer || "unresolved",
        });
        break;
      }
    } else if (currentNode.type === "action") {
      path.push({
        nodeId: currentNode.id,
        label: currentNode.label,
        type: "action",
        action: currentNode.action,
      });
      break;
    } else {
      break;
    }
  }

  const lastAction = path.find((s) => s.type === "action");
  return {
    path,
    recommendation: lastAction?.action,
  };
}

function evaluateCondition(
  condition: NonNullable<DecisionNode["condition"]>,
  value: string | undefined,
): boolean {
  if (value === undefined) return false;

  switch (condition.operator) {
    case "eq":
      return value.toLowerCase() === String(condition.value).toLowerCase();
    case "gt":
      return Number(value) > Number(condition.value);
    case "lt":
      return Number(value) < Number(condition.value);
    case "contains":
      return value.toLowerCase().includes(String(condition.value).toLowerCase());
    case "in":
      return Array.isArray(condition.value)
        ? condition.value.map((v) => v.toLowerCase()).includes(value.toLowerCase())
        : false;
    default:
      return false;
  }
}
